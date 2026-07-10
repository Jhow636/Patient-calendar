import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import { StatusChip } from "@/components/status-chip";
import { statusPacienteInfo } from "@/lib/status-labels";
import type { StatusPaciente } from "@/lib/types";

export default async function PacientesPage() {
  const usuario = await requireUsuario();
  const pacientes = await prisma.paciente.findMany({
    where: { terapeutaId: usuario.id },
    orderBy: { nome: "asc" },
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
        <Link
          href="/pacientes/novo"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Novo paciente
        </Link>
      </div>

      {pacientes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-soft">
          Nenhum paciente cadastrado ainda.
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-paper-raised">
          {pacientes.map((paciente) => {
            const status = statusPacienteInfo(paciente.status as StatusPaciente);
            return (
              <li key={paciente.id}>
                <Link
                  href={`/pacientes/${paciente.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-paper"
                >
                  <div>
                    <p className="font-medium text-ink">{paciente.nome}</p>
                    {paciente.contato && (
                      <p className="text-sm text-ink-soft">{paciente.contato}</p>
                    )}
                  </div>
                  <StatusChip variant={status.variant}>{status.label}</StatusChip>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
