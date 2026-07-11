import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import { StatusChip } from "@/components/status-chip";
import { statusSessaoInfo } from "@/lib/status-labels";
import type { StatusSessao } from "@/lib/types";
import { formatMoeda } from "@/lib/format";
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

export const metadata: Metadata = { title: "Agenda" };

const BORDA_STATUS: Record<StatusSessao, string> = {
  AGENDADA: "border-l-info",
  REALIZADA: "border-l-success",
  CANCELADA: "border-l-danger",
};

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

  const hojeInicio = new Date();
  hojeInicio.setHours(0, 0, 0, 0);
  const hojeFim = new Date(hojeInicio);
  hojeFim.setDate(hojeFim.getDate() + 1);

  const [sessoes, sessoesHoje] = await Promise.all([
    prisma.sessao.findMany({
      where: {
        paciente: { terapeutaId: usuario.id },
        dataHora: { gte: inicio, lt: fim },
      },
      include: { paciente: true, pagamento: true },
      orderBy: { dataHora: "asc" },
    }),
    prisma.sessao.findMany({
      where: {
        paciente: { terapeutaId: usuario.id },
        dataHora: { gte: hojeInicio, lt: hojeFim },
        status: "AGENDADA",
      },
      include: { paciente: true },
      orderBy: { dataHora: "asc" },
    }),
  ]);

  const sessoesPorDia = dias.map((dia) =>
    sessoes.filter((sessao) => sessao.dataHora.toDateString() === dia.toDateString())
  );

  const hoje = new Date().toDateString();

  const ativasSemana = sessoes.filter((s) => s.status !== "CANCELADA");
  const pendenteSemana = sessoes
    .filter((s) => s.status === "REALIZADA" && s.pagamento?.status === "PENDENTE")
    .reduce((soma, s) => soma + (s.pagamento?.valor ?? 0), 0);
  const proximaHoje = sessoesHoje[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Agenda</h1>
          <p className="text-sm text-ink-soft">
            {formatDiaCompleto(dias[0])} – {formatDiaCompleto(dias[6])}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-paper-raised px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Hoje</p>
          <p className="mt-0.5 text-lg font-semibold text-ink">
            {sessoesHoje.length === 0
              ? "Sem sessões"
              : `${sessoesHoje.length} ${sessoesHoje.length === 1 ? "sessão" : "sessões"}`}
          </p>
          {proximaHoje && (
            <p className="text-xs text-ink-soft">
              Próxima: {formatHora(proximaHoje.dataHora)} · {proximaHoje.paciente.nome}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-line bg-paper-raised px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Nesta semana
          </p>
          <p className="mt-0.5 text-lg font-semibold text-ink">
            {ativasSemana.length} {ativasSemana.length === 1 ? "sessão" : "sessões"}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-paper-raised px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            A receber (realizadas)
          </p>
          <p
            className={`mt-0.5 text-lg font-semibold tabular-nums ${
              pendenteSemana > 0 ? "text-warning" : "text-ink"
            }`}
          >
            {formatMoeda(pendenteSemana)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7 lg:gap-2">
        {dias.map((dia, i) => {
          const sessoesDoDia = sessoesPorDia[i];
          const ehHoje = dia.toDateString() === hoje;

          return (
            <div
              key={dia.toISOString()}
              className={`rounded-xl border p-2.5 ${
                ehHoje
                  ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                  : "border-line bg-paper-raised"
              }`}
            >
              <p className="mb-2 flex items-baseline justify-between text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <span className="capitalize">{formatDiaCurto(dia)}</span>
                <span
                  className={
                    ehHoje
                      ? "rounded-full bg-primary px-1.5 py-0.5 text-[11px] leading-none text-white"
                      : ""
                  }
                >
                  {dia.getDate()}
                </span>
              </p>

              {sessoesDoDia.length === 0 ? (
                <p className="py-2 text-center text-xs text-ink-soft/60">—</p>
              ) : (
                <ul className="space-y-1.5">
                  {sessoesDoDia.map((sessao) => {
                    const status = statusSessaoInfo(sessao.status as StatusSessao);
                    const cancelada = sessao.status === "CANCELADA";
                    const pagamentoPendente =
                      sessao.status === "REALIZADA" &&
                      sessao.pagamento?.status === "PENDENTE";

                    return (
                      <li key={sessao.id}>
                        <Link
                          href={`/agenda/${sessao.id}`}
                          className={`block rounded-lg border border-line border-l-[3px] bg-paper px-2 py-1.5 transition hover:border-primary ${
                            BORDA_STATUS[sessao.status as StatusSessao]
                          }`}
                        >
                          <p
                            className={`text-xs font-semibold tabular-nums ${
                              cancelada ? "text-ink-soft line-through" : "text-ink"
                            }`}
                          >
                            {formatHora(sessao.dataHora)}
                          </p>
                          <p
                            className={`truncate text-sm ${
                              cancelada
                                ? "text-ink-soft line-through"
                                : "font-medium text-ink"
                            }`}
                          >
                            {sessao.paciente.nome}
                          </p>
                          {(cancelada || pagamentoPendente) && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {cancelada && (
                                <StatusChip variant={status.variant}>{status.label}</StatusChip>
                              )}
                              {pagamentoPendente && (
                                <StatusChip variant="warning">Pendente</StatusChip>
                              )}
                            </div>
                          )}
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

      <p className="text-xs text-ink-soft">
        Borda azul: agendada · verde: realizada · vermelha: cancelada
      </p>
    </div>
  );
}
