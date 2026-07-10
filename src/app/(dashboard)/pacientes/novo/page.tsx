import Link from "next/link";
import { criarPaciente } from "@/lib/actions/pacientes";

export default function NovoPacientePage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/pacientes" className="text-sm text-ink-soft hover:text-ink">
          ← Pacientes
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-ink">Novo paciente</h1>
      </div>

      <form action={criarPaciente} className="space-y-4 rounded-xl border border-line bg-paper-raised p-6">
        <div className="space-y-1.5">
          <label htmlFor="nome" className="text-sm font-medium text-ink">
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            required
            autoFocus
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contato" className="text-sm font-medium text-ink">
            Contato
          </label>
          <input
            id="contato"
            name="contato"
            placeholder="E-mail ou telefone"
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
            placeholder="150.00"
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
            placeholder="Anotações gerais sobre o paciente"
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition hover:opacity-90"
        >
          Salvar paciente
        </button>
      </form>
    </div>
  );
}
