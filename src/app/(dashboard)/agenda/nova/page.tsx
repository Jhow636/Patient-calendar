import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import { criarSessao } from "@/lib/actions/sessoes";
import { formatDataParam } from "@/lib/date";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = { title: "Nova sessão" };

export default async function NovaSessaoPage({
  searchParams,
}: {
  searchParams: Promise<{ pacienteId?: string }>;
}) {
  const { pacienteId } = await searchParams;
  const usuario = await requireUsuario();

  const pacientes = await prisma.paciente.findMany({
    where: { terapeutaId: usuario.id, status: "ATIVO" },
    orderBy: { nome: "asc" },
  });

  const hoje = formatDataParam(new Date());

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/agenda">
            <ChevronLeft data-icon="inline-start" />
            Agenda
          </Link>
        </Button>
        <h1 className="mt-4 text-xl font-semibold text-ink">Nova sessão</h1>
      </div>

      {pacientes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-soft">
          Cadastre um paciente ativo antes de marcar uma sessão.{" "}
          <Link href="/pacientes/novo" className="font-medium text-primary">
            Cadastrar paciente
          </Link>
        </p>
      ) : (
        <Card>
          <CardContent>
            <form action={criarSessao} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pacienteId">Paciente</Label>
                <Select name="pacienteId" defaultValue={pacienteId} required>
                  <SelectTrigger id="pacienteId" className="w-full">
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map((paciente) => (
                      <SelectItem key={paciente.id} value={paciente.id}>
                        {paciente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="data">Data</Label>
                  <Input id="data" name="data" type="date" required defaultValue={hoje} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hora">Horário</Label>
                  <Input id="hora" name="hora" type="time" required defaultValue="09:00" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="recorrencia">Recorrência</Label>
                <Select name="recorrencia" defaultValue="NENHUMA">
                  <SelectTrigger id="recorrencia" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NENHUMA">Única</SelectItem>
                    <SelectItem value="SEMANAL">Semanal (12 sessões)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="valor">Valor da sessão (R$)</Label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 150,00"
                />
              </div>

              <SubmitButton pendingText="Marcando…" className="w-full">
                Marcar sessão
              </SubmitButton>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
