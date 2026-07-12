import Link from "next/link";
import type { Metadata } from "next";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Financeiro" };

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
          <h1 className="text-3xl font-bold text-ink">Financeiro</h1>
          <p className="text-sm text-ink-soft">{formatMes(referencia)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/financeiro?mes=${formatMesParam(mesAnterior(referencia))}`}>
              ← Mês anterior
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/financeiro">Este mês</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/financeiro?mes=${formatMesParam(proximoMes(referencia))}`}>
              Próximo mês →
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="gap-1 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Total do mês
          </p>
          <p className="text-2xl font-semibold text-ink tabular-nums">{formatMoeda(total)}</p>
        </Card>
        <Card className="gap-1 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Recebido</p>
          <p className="text-2xl font-semibold text-success tabular-nums">
            {formatMoeda(recebido)}
          </p>
        </Card>
        <Card className="gap-1 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Pendente</p>
          <p className="text-2xl font-semibold text-warning tabular-nums">
            {formatMoeda(pendente)}
          </p>
        </Card>
      </div>

      {resumoPacientes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Por paciente
          </h2>
          <Card className="overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Sessões</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Recebido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumoPacientes.map((p) => (
                  <TableRow key={p.nome}>
                    <TableCell className="text-ink">{p.nome}</TableCell>
                    <TableCell className="text-ink-soft tabular-nums">{p.sessoes}</TableCell>
                    <TableCell className="text-ink tabular-nums">
                      {formatMoeda(p.total)}
                    </TableCell>
                    <TableCell className="text-success tabular-nums">
                      {formatMoeda(p.recebido)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
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
          <Card className="gap-0 divide-y divide-line overflow-hidden py-0">
            {comPagamento.map((sessao) => {
              const status = statusPagamentoInfo(sessao.pagamento.status as StatusPagamento);
              const alternar = alternarStatusPagamento.bind(
                null,
                sessao.id,
                sessao.pagamento.status
              );
              return (
                <div
                  key={sessao.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
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
                      <Button type="submit" variant="outline" size="xs">
                        {sessao.pagamento.status === "PAGO" ? "Marcar pendente" : "Marcar pago"}
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}
