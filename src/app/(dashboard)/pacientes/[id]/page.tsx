import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { linkWhatsApp } from "@/lib/whatsapp";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import { StatusChip } from "@/components/status-chip";
import { statusPacienteInfo, statusSessaoInfo, statusPagamentoInfo } from "@/lib/status-labels";
import { formatDataHora } from "@/lib/date";
import type { StatusPaciente, StatusSessao, StatusPagamento } from "@/lib/types";
import {
  atualizarPaciente,
  alternarStatusPaciente,
  excluirPaciente,
} from "@/lib/actions/pacientes";
import { SubmitButton } from "@/components/submit-button";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const excluirComId = excluirPaciente.bind(null, paciente.id);

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/pacientes">
            <ChevronLeft data-icon="inline-start" />
            Pacientes
          </Link>
        </Button>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-ink">{paciente.nome}</h1>
          <div className="flex items-center gap-2">
            <StatusChip variant={status.variant}>{status.label}</StatusChip>
            {paciente.telefone && (
              <Button asChild variant="outline" size="sm">
                <a
                  href={linkWhatsApp(paciente.telefone, `Olá, ${paciente.nome}! Tudo bem?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle data-icon="inline-start" />
                  WhatsApp
                </a>
              </Button>
            )}
            <form action={alternarStatus}>
              <Button type="submit" variant="outline" size="sm">
                {paciente.status === "ATIVO" ? "Marcar inativo" : "Marcar ativo"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Dados cadastrais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={atualizarComId} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" name="nome" defaultValue={paciente.nome} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contato@exemplo.com"
                  defaultValue={paciente.email ?? ""}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  placeholder="(11) 98888-1234"
                  defaultValue={paciente.telefone ?? ""}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prontuario">Prontuário</Label>
                <Textarea
                  id="prontuario"
                  name="prontuario"
                  rows={6}
                  placeholder="Histórico clínico do paciente, diagnósticos, tratamentos anteriores..."
                  defaultValue={paciente.prontuario ?? ""}
                />
              </div>

              <SubmitButton>Salvar alterações</SubmitButton>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Histórico de sessões
            </h2>
            <Button asChild size="sm">
              <Link href={`/agenda/nova?pacienteId=${paciente.id}`}>Nova sessão</Link>
            </Button>
          </div>

          {paciente.sessoes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-soft">
              Nenhuma sessão registrada ainda.
            </p>
          ) : (
            <Card className="gap-0 divide-y divide-line overflow-hidden py-0">
              {paciente.sessoes.map((sessao) => {
                const statusSessao = statusSessaoInfo(sessao.status as StatusSessao);
                const statusPagamento = sessao.pagamento
                  ? statusPagamentoInfo(sessao.pagamento.status as StatusPagamento)
                  : null;
                return (
                  <Link
                    key={sessao.id}
                    href={`/agenda/${sessao.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-muted/50"
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
                );
              })}
            </Card>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="text-sm text-ink-soft">
          Excluir remove o paciente e todo o histórico de sessões, notas e
          pagamentos. Essa ação não pode ser desfeita.
        </p>
        <form action={excluirComId}>
          <ConfirmSubmitButton confirmMessage={`Excluir ${paciente.nome} e todo o histórico? Essa ação não pode ser desfeita.`}>
            Excluir paciente
          </ConfirmSubmitButton>
        </form>
      </div>
    </div>
  );
}
