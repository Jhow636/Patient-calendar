import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import { StatusChip } from "@/components/status-chip";
import { statusPagamentoInfo } from "@/lib/status-labels";
import type { StatusPagamento } from "@/lib/types";
import { formatMoeda } from "@/lib/format";
import {
  formatDataCurta,
  formatMes,
  formatMesParam,
  inicioMes,
  fimMes,
  mesAnterior,
  proximoMes,
  parseMesParam,
} from "@/lib/date";
import { alternarStatusPagamento } from "@/lib/actions/pagamentos";

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const usuario = await requireUsuario();

  const referencia = parseMesParam(mes);
  const inicio = inicioMes(referencia);
  const fim = fimMes(referencia);

  const sessoes = await prisma.sessao.findMany({
    where: {
      paciente: { terapeutaId: usuario.id },
      dataHora: { gte: inicio, lte: fim },
      pagamento: { isNot: null },
    },
    include: { paciente: true, pagamento: true },
    orderBy: { dataHora: "asc" },
  });

  const comPagamento = sessoes.filter(
    (s): s is typeof s & { pagamento: NonNullable<typeof s.pagamento> } => s.pagamento !== null
  );

  const total = comPagamento.reduce((soma, s) => soma + s.pagamento.valor, 0);
  const recebido = comPagamento
    .filter((s) => s.pagamento.status === "PAGO")
    .reduce((soma, s) => soma + s.pagamento.valor, 0);
  const pendente = total - recebido;

  const porPaciente = new Map<
    string,
    { nome: string; total: number; recebido: number; sessoes: number }
  >();
  for (const s of comPagamento) {
    const atual = porPaciente.get(s.pacienteId) ?? {
      nome: s.paciente.nome,
      total: 0,
      recebido: 0,
      sessoes: 0,
    };
    atual.total += s.pagamento.valor;
    atual.sessoes += 1;
    if (s.pagamento.status === "PAGO") atual.recebido += s.pagamento.valor;
    porPaciente.set(s.pacienteId, atual);
  }
  const resumoPacientes = [...porPaciente.values()].sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Financeiro</h1>
          <p className="text-sm text-ink-soft">{formatMes(referencia)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/financeiro?mes=${formatMesParam(mesAnterior(referencia))}`}
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-primary hover:text-primary"
          >
            ← Mês anterior
          </Link>
          <Link
            href="/financeiro"
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-primary hover:text-primary"
          >
            Este mês
          </Link>
          <Link
            href={`/financeiro?mes=${formatMesParam(proximoMes(referencia))}`}
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-primary hover:text-primary"
          >
            Próximo mês →
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-paper-raised p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Total do mês
          </p>
          <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">{formatMoeda(total)}</p>
        </div>
        <div className="rounded-xl border border-line bg-paper-raised p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Recebido</p>
          <p className="mt-1 text-2xl font-semibold text-success tabular-nums">
            {formatMoeda(recebido)}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-paper-raised p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Pendente</p>
          <p className="mt-1 text-2xl font-semibold text-warning tabular-nums">
            {formatMoeda(pendente)}
          </p>
        </div>
      </div>

      {resumoPacientes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Por paciente
          </h2>
          <div className="overflow-x-auto rounded-xl border border-line bg-paper-raised">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-4 py-2 font-medium">Paciente</th>
                  <th className="px-4 py-2 font-medium">Sessões</th>
                  <th className="px-4 py-2 font-medium">Total</th>
                  <th className="px-4 py-2 font-medium">Recebido</th>
                </tr>
              </thead>
              <tbody>
                {resumoPacientes.map((p) => (
                  <tr key={p.nome} className="border-b border-line last:border-0">
                    <td className="px-4 py-2 text-ink">{p.nome}</td>
                    <td className="px-4 py-2 text-ink-soft tabular-nums">{p.sessoes}</td>
                    <td className="px-4 py-2 text-ink tabular-nums">{formatMoeda(p.total)}</td>
                    <td className="px-4 py-2 text-success tabular-nums">
                      {formatMoeda(p.recebido)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Sessões do mês
        </h2>

        {comPagamento.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-soft">
            Nenhuma sessão com pagamento neste mês.
          </p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-paper-raised">
            {comPagamento.map((sessao) => {
              const status = statusPagamentoInfo(sessao.pagamento.status as StatusPagamento);
              const alternar = alternarStatusPagamento.bind(
                null,
                sessao.id,
                sessao.pagamento.status
              );
              return (
                <li key={sessao.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <Link
                      href={`/agenda/${sessao.id}`}
                      className="text-sm font-medium text-ink hover:text-primary"
                    >
                      {sessao.paciente.nome}
                    </Link>
                    <p className="text-xs text-ink-soft">{formatDataCurta(sessao.dataHora)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-ink tabular-nums">
                      {formatMoeda(sessao.pagamento.valor)}
                    </span>
                    <StatusChip variant={status.variant}>{status.label}</StatusChip>
                    <form action={alternar}>
                      <button
                        type="submit"
                        className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink-soft transition hover:border-primary hover:text-primary"
                      >
                        {sessao.pagamento.status === "PAGO" ? "Marcar pendente" : "Marcar pago"}
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
