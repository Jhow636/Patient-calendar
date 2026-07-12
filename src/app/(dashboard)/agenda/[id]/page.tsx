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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Status da sessão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {OPCOES_STATUS.map((opcao) => {
              const acaoStatus = atualizarStatusSessao.bind(null, sessao.id, opcao.valor);
              const ativo = sessao.status === opcao.valor;
              return (
                <form key={opcao.valor} action={acaoStatus}>
                  <Button
                    type="submit"
                    disabled={ativo}
                    variant={ativo ? "default" : "outline"}
                    size="sm"
                    className="disabled:opacity-100"
                  >
                    {opcao.label}
                  </Button>
                </form>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {sessao.pagamento && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Pagamento
              {pagamentoStatus && (
                <StatusChip variant={pagamentoStatus.variant}>
                  {pagamentoStatus.label}
                </StatusChip>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-3">
              <form action={atualizarValorComId} className="flex items-end gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    name="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={sessao.pagamento.valor}
                    className="w-32"
                  />
                </div>
                <Button type="submit" variant="outline">
                  Atualizar valor
                </Button>
              </form>

              {alternarPagamentoComId && (
                <form action={alternarPagamentoComId}>
                  <Button type="submit">
                    Marcar como {sessao.pagamento.status === "PAGO" ? "pendente" : "pago"}
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Nota da sessão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={salvarNotaComId} className="space-y-3">
            <Textarea
              name="texto"
              rows={6}
              defaultValue={sessao.nota?.texto ?? ""}
              placeholder="Registre observações desta sessão…"
            />
            <SubmitButton size="default">Salvar nota</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <form action={excluirComId} className="flex justify-end">
        <ConfirmSubmitButton confirmMessage="Excluir esta sessão? Essa ação não pode ser desfeita.">
          Excluir sessão
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
