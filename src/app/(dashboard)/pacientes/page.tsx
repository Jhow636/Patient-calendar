import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import { StatusChip } from "@/components/status-chip";
import { statusPacienteInfo } from "@/lib/status-labels";
import { formatMoeda } from "@/lib/format";
import type { StatusPaciente } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Pacientes" };

export default async function PacientesPage() {
  const usuario = await requireUsuario();
  const pacientes = await prisma.paciente.findMany({
    where: { terapeutaId: usuario.id },
    orderBy: [{ status: "asc" }, { nome: "asc" }],
    include: { _count: { select: { sessoes: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Pacientes</h1>
          <p className="text-sm text-ink-soft">
            {pacientes.length} {pacientes.length === 1 ? "cadastrado" : "cadastrados"}
          </p>
        </div>
        <Button asChild>
          <Link href="/pacientes/novo">Novo paciente</Link>
        </Button>
      </div>

      {pacientes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="text-sm font-medium text-ink">Nenhum paciente ainda</p>
          <p className="mt-1 text-sm text-ink-soft">
            Cadastre o primeiro paciente para começar a marcar sessões.
          </p>
          <Button asChild className="mt-4">
            <Link href="/pacientes/novo">Cadastrar primeiro paciente</Link>
          </Button>
        </div>
      ) : (
        <Card className="gap-0 divide-y divide-line overflow-hidden py-0">
          {pacientes.map((paciente) => {
            const status = statusPacienteInfo(paciente.status as StatusPaciente);
            return (
              <Link
                key={paciente.id}
                href={`/pacientes/${paciente.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{paciente.nome}</p>
                  <p className="truncate text-sm text-ink-soft">
                    {[
                      [paciente.email, paciente.telefone].filter(Boolean).join(" / "),
                      paciente.valorSessao != null
                        ? formatMoeda(paciente.valorSessao)
                        : null,
                      `${paciente._count.sessoes} ${
                        paciente._count.sessoes === 1 ? "sessão" : "sessões"
                      }`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <StatusChip variant={status.variant}>{status.label}</StatusChip>
              </Link>
            );
          })}
        </Card>
      )}
    </div>
  );
}
