import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import { StatusChip } from "@/components/status-chip";
import { statusPacienteInfo } from "@/lib/status-labels";
import { formatMoeda } from "@/lib/format";
import type { StatusPaciente } from "@/lib/types";

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
        <Link
          href="/pacientes/novo"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Novo paciente
        </Link>
      </div>

      {pacientes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="text-sm font-medium text-ink">Nenhum paciente ainda</p>
          <p className="mt-1 text-sm text-ink-soft">
            Cadastre o primeiro paciente para começar a marcar sessões.
          </p>
          <Link
            href="/pacientes/novo"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Cadastrar primeiro paciente
          </Link>
        </div>
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
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{paciente.nome}</p>
                    <p className="truncate text-sm text-ink-soft">
                      {[
                        paciente.contato,
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
