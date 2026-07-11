import type { Metadata } from "next";
import { entrar } from "./actions";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Consultório
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Everton Dutra</h1>
          <p className="mt-1 text-sm text-ink-soft">Entre para acessar sua agenda</p>
        </div>

        <form action={entrar} className="space-y-4 rounded-xl border border-line bg-paper-raised p-6 shadow-sm">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-ink">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="voce@exemplo.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="senha" className="text-sm font-medium text-ink">
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              required
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
            />
          </div>

          {erro && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
              E-mail ou senha incorretos.
            </p>
          )}

          <SubmitButton
            pendingText="Entrando…"
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition hover:opacity-90"
          >
            Entrar
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
