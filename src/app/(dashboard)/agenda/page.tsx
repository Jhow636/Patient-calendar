import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import { StatusChip } from "@/components/status-chip";
import { statusSessaoInfo, statusPagamentoInfo } from "@/lib/status-labels";
import type { StatusSessao, StatusPagamento } from "@/lib/types";
import {
  diasDaSemana,
  formatDataParam,
  formatDiaCompleto,
  formatDiaCurto,
  formatHora,
  inicioSemana,
  parseDataParam,
  proximaSemana,
  semanaAnterior,
} from "@/lib/date";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ inicio?: string }>;
}) {
  const { inicio: inicioParam } = await searchParams;
  const usuario = await requireUsuario();

  const referencia = parseDataParam(inicioParam);
  const inicio = inicioSemana(referencia);
  const dias = diasDaSemana(inicio);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 7);

  const sessoes = await prisma.sessao.findMany({
    where: {
      paciente: { terapeutaId: usuario.id },
      dataHora: { gte: inicio, lt: fim },
    },
    include: { paciente: true, pagamento: true },
    orderBy: { dataHora: "asc" },
  });

  const sessoesPorDia = dias.map((dia) =>
    sessoes.filter((sessao) => sessao.dataHora.toDateString() === dia.toDateString())
  );

  const hoje = new Date().toDateString();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Agenda</h1>
          <p className="text-sm text-ink-soft">
            {formatDiaCompleto(dias[0])} – {formatDiaCompleto(dias[6])}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/agenda?inicio=${formatDataParam(semanaAnterior(inicio))}`}
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-primary hover:text-primary"
          >
            ← Anterior
          </Link>
          <Link
            href="/agenda"
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-primary hover:text-primary"
          >
            Hoje
          </Link>
          <Link
            href={`/agenda?inicio=${formatDataParam(proximaSemana(inicio))}`}
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-primary hover:text-primary"
          >
            Próxima →
          </Link>
          <Link
            href="/agenda/nova"
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Nova sessão
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dias.map((dia, i) => {
          const sessoesDoDia = sessoesPorDia[i];
          const ehHoje = dia.toDateString() === hoje;

          return (
            <div
              key={dia.toISOString()}
              className={`rounded-xl border p-3 ${
                ehHoje ? "border-primary/40 bg-primary/5" : "border-line bg-paper-raised"
              }`}
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <span className="capitalize">{formatDiaCurto(dia)}</span>{" "}
                <span className={ehHoje ? "text-primary" : ""}>{dia.getDate()}</span>
              </p>

              {sessoesDoDia.length === 0 ? (
                <p className="py-3 text-center text-xs text-ink-soft">Sem sessões</p>
              ) : (
                <ul className="space-y-1.5">
                  {sessoesDoDia.map((sessao) => {
                    const status = statusSessaoInfo(sessao.status as StatusSessao);
                    const pagamento = sessao.pagamento
                      ? statusPagamentoInfo(sessao.pagamento.status as StatusPagamento)
                      : null;
                    return (
                      <li key={sessao.id}>
                        <Link
                          href={`/agenda/${sessao.id}`}
                          className="block rounded-lg border border-line bg-paper px-2.5 py-2 transition hover:border-primary"
                        >
                          <p className="text-sm font-medium text-ink">
                            {formatHora(sessao.dataHora)} · {sessao.paciente.nome}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <StatusChip variant={status.variant}>{status.label}</StatusChip>
                            {pagamento && (
                              <StatusChip variant={pagamento.variant}>{pagamento.label}</StatusChip>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
