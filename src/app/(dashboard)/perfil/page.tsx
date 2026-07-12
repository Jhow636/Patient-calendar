import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import { atualizarPerfil, alterarSenha } from "@/lib/actions/perfil";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Perfil" };

const MENSAGENS: Record<string, { texto: string; tipo: "ok" | "erro" }> = {
  "ok:perfil": { texto: "Perfil atualizado com sucesso.", tipo: "ok" },
  "ok:senha": { texto: "Senha alterada com sucesso.", tipo: "ok" },
  "erro:dados": { texto: "Confira os dados informados e tente novamente.", tipo: "erro" },
  "erro:email": { texto: "Este e-mail já está em uso por outra conta.", tipo: "erro" },
  "erro:senha-atual": { texto: "A senha atual está incorreta.", tipo: "erro" },
  "erro:senha-curta": {
    texto: "A nova senha precisa ter pelo menos 8 caracteres.",
    tipo: "erro",
  },
  "erro:senha-confirma": { texto: "A confirmação não confere com a nova senha.", tipo: "erro" },
};

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const { ok, erro } = await searchParams;
  const sessao = await requireUsuario();

  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.id },
    select: { nome: true, email: true, telefone: true },
  });
  if (!usuario) redirect("/login");

  const mensagem = ok ? MENSAGENS[`ok:${ok}`] : erro ? MENSAGENS[`erro:${erro}`] : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Perfil</h1>
        <p className="text-sm text-ink-soft">Seus dados de acesso e contato</p>
      </div>

      {mensagem && (
        <p
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            mensagem.tipo === "ok"
              ? "bg-success-bg text-success"
              : "bg-danger-bg text-danger"
          }`}
        >
          {mensagem.texto}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Dados do perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={atualizarPerfil} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" defaultValue={usuario.nome} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail (usado no login)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={usuario.email}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                placeholder="(11) 98888-1234"
                defaultValue={usuario.telefone ?? ""}
              />
            </div>

            <SubmitButton>Salvar perfil</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Alterar senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={alterarSenha} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="senhaAtual">Senha atual</Label>
              <Input
                id="senhaAtual"
                name="senhaAtual"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="novaSenha">Nova senha</Label>
                <Input
                  id="novaSenha"
                  name="novaSenha"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
                <Input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <p className="text-xs text-ink-soft">Mínimo de 8 caracteres.</p>

            <SubmitButton pendingText="Alterando…">Alterar senha</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
