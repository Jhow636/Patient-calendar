import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import { StatusChip } from "@/components/status-chip";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { statusSessaoInfo, statusPagamentoInfo } from "@/lib/status-labels";
import { formatDataHora } from "@/lib/date";
import type { StatusSessao, StatusPagamento } from "@/lib/types";
import { atualizarStatusSessao, excluirSessao } from "@/lib/actions/sessoes";
import { salvarNota } from "@/lib/actions/notas";
import { alternarStatusPagamento, atualizarValorPagamento } from "@/lib/actions/pagamentos";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Sessão" };

const OPCOES_STATUS: { valor: StatusSessao; label: string }[] = [
  { valor: "AGENDADA", label: "Agendada" },
  { valor: "REALIZADA", label: "Realizada" },
  { valor: "CANCELADA", label: "Cancelada" },
];

export default async function SessaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await requireUsuario();

  const sessao = await prisma.sessao.findFirst({
    where: { id, paciente: { terapeutaId: usuario.id } },
    include: { paciente: true, nota: true, pagamento: true },
  });

  if (!sessao) notFound();

  const status = statusSessaoInfo(sessao.status as StatusSessao);
  const pagamentoStatus = sessao.pagamento
    ? statusPagamentoInfo(sessao.pagamento.status as StatusPagamento)
    : null;

  const salvarNotaComId = salvarNota.bind(null, sessao.id);
  const excluirComId = excluirSessao.bind(null, sessao.id);
  const alternarPagamentoComId = sessao.pagamento
    ? alternarStatusPagamento.bind(null, sessao.id, sessao.pagamento.status)
    : null;
  const atualizarValorComId = atualizarValorPagamento.bind(null, sessao.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/agenda" className="text-sm text-ink-soft hover:text-ink">
          ← Agenda
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-ink">
              <Link href={`/pacientes/${sessao.paciente.id}`} className="hover:text-primary">
                {sessao.paciente.nome}
              </Link>
            </h1>
            <p className="text-sm text-ink-soft">{formatDataHora(sessao.dataHora)}</p>
          </div>
          <StatusChip variant={status.variant}>{status.label}</StatusChip>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-line bg-paper-raised p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Status da sessão
        </h2>
        <div className="flex flex-wrap gap-2">
          {OPCOES_STATUS.map((opcao) => {
            const acaoStatus = atualizarStatusSessao.bind(null, sessao.id, opcao.valor);
            const ativo = sessao.status === opcao.valor;
            return (
              <form key={opcao.valor} action={acaoStatus}>
                <button
                  type="submit"
                  disabled={ativo}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    ativo
                      ? "border-primary bg-primary text-white"
                      : "border-line text-ink-soft hover:border-primary hover:text-primary"
                  }`}
                >
                  {opcao.label}
                </button>
              </form>
            );
          })}
        </div>
      </div>

      {sessao.pagamento && (
        <div className="space-y-3 rounded-xl border border-line bg-paper-raised p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Pagamento
            </h2>
            {pagamentoStatus && (
              <StatusChip variant={pagamentoStatus.variant}>{pagamentoStatus.label}</StatusChip>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <form action={atualizarValorComId} className="flex items-end gap-2">
              <div className="space-y-1.5">
                <label htmlFor="valor" className="text-sm font-medium text-ink">
                  Valor (R$)
                </label>
                <input
                  id="valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={sessao.pagamento.valor}
                  className="w-32 rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink-soft transition hover:border-primary hover:text-primary"
              >
                Atualizar valor
              </button>
            </form>

            {alternarPagamentoComId && (
              <form action={alternarPagamentoComId}>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Marcar como {sessao.pagamento.status === "PAGO" ? "pendente" : "pago"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-line bg-paper-raised p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Nota da sessão
        </h2>
        <form action={salvarNotaComId} className="space-y-3">
          <textarea
            name="texto"
            rows={6}
            defaultValue={sessao.nota?.texto ?? ""}
            placeholder="Registre observações desta sessão…"
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
            Salvar nota
          </SubmitButton>
        </form>
      </div>

      <form action={excluirComId} className="flex justify-end">
        <ConfirmSubmitButton
          confirmMessage="Excluir esta sessão? Essa ação não pode ser desfeita."
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-danger hover:text-danger"
        >
          Excluir sessão
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
