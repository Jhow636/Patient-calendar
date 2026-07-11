import { requireUsuario } from "@/lib/auth-helpers";
import { NavLink } from "./nav-link";
import { sair } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await requireUsuario();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-paper-raised">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                Consultório
              </p>
              <p className="text-sm font-semibold text-ink">Everton Dutra</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-ink-soft sm:inline">{usuario.name}</span>
              <form action={sair}>
                <button
                  type="submit"
                  className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-danger hover:text-danger"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>

          <nav className="mt-3 flex items-center gap-1 overflow-x-auto">
            <NavLink href="/agenda">Agenda</NavLink>
            <NavLink href="/pacientes">Pacientes</NavLink>
            <NavLink href="/financeiro">Financeiro</NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
