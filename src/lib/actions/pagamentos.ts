"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";

export async function alternarStatusPagamento(sessaoId: string, statusAtual: string) {
  const usuario = await requireUsuario();

  const sessao = await prisma.sessao.findFirst({
    where: { id: sessaoId, paciente: { terapeutaId: usuario.id } },
    include: { pagamento: true },
  });
  if (!sessao?.pagamento) throw new Error("Pagamento não encontrado");

  await prisma.pagamento.update({
    where: { id: sessao.pagamento.id },
    data: {
      status: statusAtual === "PAGO" ? "PENDENTE" : "PAGO",
      dataPagamento: statusAtual === "PAGO" ? null : new Date(),
    },
  });

  revalidatePath(`/agenda/${sessaoId}`);
  revalidatePath("/financeiro");
  revalidatePath(`/pacientes/${sessao.pacienteId}`);
}

export async function atualizarValorPagamento(sessaoId: string, formData: FormData) {
  const usuario = await requireUsuario();
  const valor = Number(formData.get("valor"));
  if (Number.isNaN(valor) || valor < 0) throw new Error("Valor inválido");

  const sessao = await prisma.sessao.findFirst({
    where: { id: sessaoId, paciente: { terapeutaId: usuario.id } },
    include: { pagamento: true },
  });
  if (!sessao?.pagamento) throw new Error("Pagamento não encontrado");

  await prisma.pagamento.update({
    where: { id: sessao.pagamento.id },
    data: { valor },
  });

  revalidatePath(`/agenda/${sessaoId}`);
  revalidatePath("/financeiro");
}
