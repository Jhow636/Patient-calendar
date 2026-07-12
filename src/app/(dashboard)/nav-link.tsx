"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CalendarDays, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function useAtivo(href: string) {
  const pathname = usePathname();
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* Pílula de texto usada na barra de navegação mobile */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const active = useAtivo(href);

  return (
    <Button asChild variant={active ? "default" : "ghost"} size="sm">
      <Link href={href}>{children}</Link>
    </Button>
  );
}

const LINKS_SIDEBAR = [
  { href: "/agenda", label: "Agenda", Icon: CalendarDays },
  { href: "/pacientes", label: "Pacientes", Icon: Users },
  { href: "/financeiro", label: "Financeiro", Icon: Wallet },
];

/* Ícones de navegação da sidebar desktop */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col items-center gap-2">
      {LINKS_SIDEBAR.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex size-11 items-center justify-center rounded-xl text-sidebar-foreground/70 transition hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-5" />
          </Link>
        );
      })}
    </nav>
  );
}
