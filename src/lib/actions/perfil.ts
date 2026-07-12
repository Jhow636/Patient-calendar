"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";

const perfilSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
  email: z.string().trim().email("E-mail inválido"),
  telefone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
});

export async function atualizarPerfil(formData: FormData) {
  const usuario = await requireUsuario();

  const resultado = perfilSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
  });
  if (!resultado.success) redirect("/perfil?erro=dados");

  const { nome, email, telefone } = resultado.data;

  const emailEmUso = await prisma.usuario.findFirst({
    where: { email, id: { not: usuario.id } },
    select: { id: true },
  });
  if (emailEmUso) redirect("/perfil?erro=email");

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { nome, email, telefone },
  });

  revalidatePath("/", "layout");
  redirect("/perfil?ok=perfil");
}

export async function alterarSenha(formData: FormData) {
  const usuario = await requireUsuario();

  const senhaAtual = String(formData.get("senhaAtual") ?? "");
  const novaSenha = String(formData.get("novaSenha") ?? "");
  const confirmarSenha = String(formData.get("confirmarSenha") ?? "");

  if (novaSenha.length < 8) redirect("/perfil?erro=senha-curta");
  if (novaSenha !== confirmarSenha) redirect("/perfil?erro=senha-confirma");

  const registro = await prisma.usuario.findUnique({
    where: { id: usuario.id },
    select: { senhaHash: true },
  });
  if (!registro) redirect("/login");

  const senhaValida = await bcrypt.compare(senhaAtual, registro.senhaHash);
  if (!senhaValida) redirect("/perfil?erro=senha-atual");

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { senhaHash: await bcrypt.hash(novaSenha, 10) },
  });

  redirect("/perfil?ok=senha");
}
