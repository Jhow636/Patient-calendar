import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import { StatusChip } from "@/components/status-chip";
import { statusPacienteInfo, statusSessaoInfo, statusPagamentoInfo } from "@/lib/status-labels";
import { formatDataHora } from "@/lib/date";
import type { StatusPaciente, StatusSessao, StatusPagamento } from "@/lib/types";
import { atualizarPaciente, alternarStatusPaciente } from "@/lib/actions/pacientes";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Paciente" };

export default async function PacienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await requireUsuario();

  const paciente = await prisma.paciente.findFirst({
    where: { id, terapeutaId: usuario.id },
    include: {
      sessoes: {
        orderBy: { dataHora: "desc" },
        include: { nota: true, pagamento: true },
      },
    },
  });

  if (!paciente) notFound();

  const status = statusPacienteInfo(paciente.status as StatusPaciente);
  const atualizarComId = atualizarPaciente.bind(null, paciente.id);
  const alternarStatus = alternarStatusPaciente.bind(null, paciente.id, paciente.status);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/pacientes" className="text-sm text-ink-soft hover:text-ink">
          ← Pacientes
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-ink">{paciente.nome}</h1>
          <div className="flex items-center gap-2">
            <StatusChip variant={status.variant}>{status.label}</StatusChip>
            <form action={alternarStatus}>
              <button
                type="submit"
                className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-primary hover:text-primary"
              >
                {paciente.status === "ATIVO" ? "Marcar inativo" : "Marcar ativo"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <form action={atualizarComId} className="space-y-4 rounded-xl border border-line bg-paper-raised p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Dados cadastrais
          </h2>

          <div className="space-y-1.5">
            <label htmlFor="nome" className="text-sm font-medium text-ink">
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              defaultValue={paciente.nome}
              required
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contato" className="text-sm font-medium text-ink">
              Telefone ou E-mail
            </label>
            <input
              id="contato"
              name="contato"
              placeholder="(11) 98888-1234 ou email@exemplo.com"
              defaultValue={paciente.contato ?? ""}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="valorSessao" className="text-sm font-medium text-ink">
              Valor da sessão (R$)
            </label>
            <input
              id="valorSessao"
              name="valorSessao"
              type="number"
              step="0.01"
              min="0"
              defaultValue={paciente.valorSessao ?? ""}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="observacoes" className="text-sm font-medium text-ink">
              Observações clínicas
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              rows={4}
              defaultValue={paciente.observacoes ?? ""}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <SubmitButton className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90">
            Salvar alterações
          </SubmitButton>
        </form>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Histórico de sessões
            </h2>
            <Link
              href={`/agenda/nova?pacienteId=${paciente.id}`}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Nova sessão
            </Link>
          </div>

          {paciente.sessoes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-soft">
              Nenhuma sessão registrada ainda.
            </p>
          ) : (
            <ul className="divide-y divide-line rounded-xl border border-line bg-paper-raised">
              {paciente.sessoes.map((sessao) => {
                const statusSessao = statusSessaoInfo(sessao.status as StatusSessao);
                const statusPagamento = sessao.pagamento
                  ? statusPagamentoInfo(sessao.pagamento.status as StatusPagamento)
                  : null;
                return (
                  <li key={sessao.id}>
                    <Link
                      href={`/agenda/${sessao.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-paper"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {formatDataHora(sessao.dataHora)}
                        </p>
                        {sessao.nota && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-ink-soft">
                            {sessao.nota.texto}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <StatusChip variant={statusSessao.variant}>{statusSessao.label}</StatusChip>
                        {statusPagamento && (
                          <StatusChip variant={statusPagamento.variant}>
                            {statusPagamento.label}
                          </StatusChip>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
