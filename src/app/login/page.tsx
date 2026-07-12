import type { Metadata } from "next";
import { entrar } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

        <Card>
          <CardContent>
            <form action={entrar} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  placeholder="voce@exemplo.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  required
                  placeholder="••••••••"
                />
              </div>

              {erro && (
                <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
                  E-mail ou senha incorretos.
                </p>
              )}

              <SubmitButton pendingText="Entrando…" className="w-full">
                Entrar
              </SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
