"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";

const pacienteSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  telefone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  prontuario: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
});

function lerFormulario(formData: FormData) {
  return pacienteSchema.parse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    prontuario: formData.get("prontuario"),
  });
}

export async function criarPaciente(formData: FormData) {
  const usuario = await requireUsuario();
  const dados = lerFormulario(formData);

  const paciente = await prisma.paciente.create({
    data: { ...dados, terapeutaId: usuario.id },
  });

  revalidatePath("/pacientes");
  redirect(`/pacientes/${paciente.id}`);
}

export async function atualizarPaciente(id: string, formData: FormData) {
  const usuario = await requireUsuario();
  const dados = lerFormulario(formData);

  await prisma.paciente.updateMany({
    where: { id, terapeutaId: usuario.id },
    data: dados,
  });

  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${id}`);
}

export async function alternarStatusPaciente(id: string, statusAtual: string) {
  const usuario = await requireUsuario();

  await prisma.paciente.updateMany({
    where: { id, terapeutaId: usuario.id },
    data: { status: statusAtual === "ATIVO" ? "INATIVO" : "ATIVO" },
  });

  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${id}`);
}

export async function excluirPaciente(id: string) {
  const usuario = await requireUsuario();

  // Remove apenas se o paciente pertencer ao terapeuta logado.
  // As sessões, notas e pagamentos são apagados em cascata (schema).
  await prisma.paciente.deleteMany({
    where: { id, terapeutaId: usuario.id },
  });

  revalidatePath("/pacientes");
  redirect("/pacientes");
}
