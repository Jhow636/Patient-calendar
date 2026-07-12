import Link from "next/link";
import { CalendarDays, LogOut } from "lucide-react";
import { requireUsuario } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { NavLink, SidebarNav } from "./nav-link";
import { sair } from "./actions";

function dataDeHoje() {
  const texto = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await requireUsuario();
  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.id },
    select: { nome: true },
  });
  const nomeExibido = usuario?.nome ?? sessao.name ?? "";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col items-center gap-2 rounded-r-3xl bg-sidebar py-6 md:flex">
        <div className="mb-6 flex size-11 items-center justify-center rounded-2xl bg-sidebar-accent text-sm font-bold text-sidebar-accent-foreground">
          ED
        </div>
        <SidebarNav />
        <div className="flex-1" />
        <form action={sair}>
          <button
            type="submit"
            title="Sair"
            aria-label="Sair"
            className="flex size-11 items-center justify-center rounded-xl text-sidebar-foreground/70 transition hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          >
            <LogOut className="size-5" />
          </button>
        </form>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Barra superior (mobile) */}
        <header className="bg-paper-raised shadow-sm md:hidden">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  Consultório
                </p>
                <p className="text-sm font-semibold text-ink">Everton Dutra</p>
              </div>
              <form action={sair}>
                <Button type="submit" variant="outline" size="sm">
                  Sair
                </Button>
              </form>
            </div>
            <nav className="mt-3 flex items-center gap-1 overflow-x-auto">
              <NavLink href="/agenda">Agenda</NavLink>
              <NavLink href="/pacientes">Pacientes</NavLink>
              <NavLink href="/financeiro">Financeiro</NavLink>
              <NavLink href="/perfil">Perfil</NavLink>
            </nav>
          </div>
        </header>

        {/* Cabeçalho (desktop) */}
        <div className="mx-auto hidden w-full max-w-6xl items-center justify-between px-6 pt-8 md:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Consultório
            </p>
            <p className="text-lg font-bold text-ink">Everton Dutra</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm text-ink-soft">
              <CalendarDays className="size-4" />
              {dataDeHoje()}
            </span>
            <Link
              href="/perfil"
              className="text-sm font-medium text-ink transition hover:text-primary"
            >
              {nomeExibido}
            </Link>
          </div>
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
