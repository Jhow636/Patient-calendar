"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";

const notaSchema = z.object({
  texto: z.string().trim().min(1, "Escreva algo antes de salvar"),
});

export async function salvarNota(sessaoId: string, formData: FormData) {
  const usuario = await requireUsuario();
  const { texto } = notaSchema.parse({ texto: formData.get("texto") });

  const sessao = await prisma.sessao.findFirst({
    where: { id: sessaoId, paciente: { terapeutaId: usuario.id } },
  });
  if (!sessao) throw new Error("Sessão não encontrada");

  await prisma.notaSessao.upsert({
    where: { sessaoId },
    create: { sessaoId, texto },
    update: { texto },
  });

  revalidatePath(`/agenda/${sessaoId}`);
  revalidatePath(`/pacientes/${sessao.pacienteId}`);
}
