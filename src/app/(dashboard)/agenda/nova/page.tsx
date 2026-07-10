import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import { criarSessao } from "@/lib/actions/sessoes";
import { formatDataParam } from "@/lib/date";

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
        <Link href="/agenda" className="text-sm text-ink-soft hover:text-ink">
          ← Agenda
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-ink">Nova sessão</h1>
      </div>

      {pacientes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-soft">
          Cadastre um paciente ativo antes de marcar uma sessão.{" "}
          <Link href="/pacientes/novo" className="font-medium text-primary">
            Cadastrar paciente
          </Link>
        </p>
      ) : (
        <form action={criarSessao} className="space-y-4 rounded-xl border border-line bg-paper-raised p-6">
          <div className="space-y-1.5">
            <label htmlFor="pacienteId" className="text-sm font-medium text-ink">
              Paciente
            </label>
            <select
              id="pacienteId"
              name="pacienteId"
              required
              defaultValue={pacienteId ?? ""}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="" disabled>
                Selecione um paciente
              </option>
              {pacientes.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="data" className="text-sm font-medium text-ink">
                Data
              </label>
              <input
                id="data"
                name="data"
                type="date"
                required
                defaultValue={hoje}
                className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="hora" className="text-sm font-medium text-ink">
                Horário
              </label>
              <input
                id="hora"
                name="hora"
                type="time"
                required
                defaultValue="09:00"
                className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="recorrencia" className="text-sm font-medium text-ink">
              Recorrência
            </label>
            <select
              id="recorrencia"
              name="recorrencia"
              defaultValue="NENHUMA"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="NENHUMA">Única</option>
              <option value="SEMANAL">Semanal (12 sessões)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="valor" className="text-sm font-medium text-ink">
              Valor da sessão (R$)
            </label>
            <input
              id="valor"
              name="valor"
              type="number"
              step="0.01"
              min="0"
              placeholder="Deixe em branco para usar o valor padrão do paciente"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition hover:opacity-90"
          >
            Marcar sessão
          </button>
        </form>
      )}
    </div>
  );
}
