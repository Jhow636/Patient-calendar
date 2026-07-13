"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import { formatDataParam, inicioSemana } from "@/lib/date";
import { STATUS_SESSAO, type StatusSessao } from "@/lib/types";

const OCORRENCIAS_RECORRENCIA = 12;

const sessaoSchema = z.object({
  pacienteId: z.string().min(1, "Selecione um paciente"),
  data: z.string().min(1, "Informe a data"),
  hora: z.string().min(1, "Informe o horário"),
  recorrencia: z.enum(["NENHUMA", "SEMANAL"]),
  valor: z.coerce.number().nonnegative().optional().nullable(),
});

async function exigirPaciente(pacienteId: string, usuarioId: string) {
  const paciente = await prisma.paciente.findFirst({
    where: { id: pacienteId, terapeutaId: usuarioId },
  });
  if (!paciente) throw new Error("Paciente não encontrado");
  return paciente;
}

async function exigirSessao(id: string, usuarioId: string) {
  const sessao = await prisma.sessao.findFirst({
    where: { id, paciente: { terapeutaId: usuarioId } },
  });
  if (!sessao) throw new Error("Sessão não encontrada");
  return sessao;
}

export async function criarSessao(formData: FormData) {
  const usuario = await requireUsuario();
  const dados = sessaoSchema.parse({
    pacienteId: formData.get("pacienteId"),
    data: formData.get("data"),
    hora: formData.get("hora"),
    recorrencia: formData.get("recorrencia") || "NENHUMA",
    valor: formData.get("valor") || null,
  });

  const paciente = await exigirPaciente(dados.pacienteId, usuario.id);
  const valor = dados.valor ?? 0;

  const [ano, mes, dia] = dados.data.split("-").map(Number);
  const [horaH, horaM] = dados.hora.split(":").map(Number);
  const primeiraData = new Date(ano, mes - 1, dia, horaH, horaM);

  const totalOcorrencias = dados.recorrencia === "SEMANAL" ? OCORRENCIAS_RECORRENCIA : 1;

  await prisma.$transaction(
    Array.from({ length: totalOcorrencias }, (_, i) => {
      const dataHora = new Date(primeiraData);
      dataHora.setDate(dataHora.getDate() + i * 7);

      return prisma.sessao.create({
        data: {
          pacienteId: paciente.id,
          dataHora,
          recorrencia: dados.recorrencia,
          pagamento: { create: { valor } },
        },
      });
    })
  );

  revalidatePath("/agenda");
  revalidatePath(`/pacientes/${paciente.id}`);
  redirect(`/agenda?inicio=${formatDataParam(inicioSemana(primeiraData))}`);
}

export async function atualizarStatusSessao(id: string, status: string) {
  if (!STATUS_SESSAO.includes(status as StatusSessao)) {
    throw new Error("Status inválido");
  }

  const usuario = await requireUsuario();
  const sessao = await exigirSessao(id, usuario.id);

  await prisma.sessao.update({
    where: { id: sessao.id },
    data: { status },
  });

  revalidatePath("/agenda");
  revalidatePath(`/agenda/${id}`);
  revalidatePath(`/pacientes/${sessao.pacienteId}`);
}

export async function excluirSessao(id: string) {
  const usuario = await requireUsuario();
  const sessao = await exigirSessao(id, usuario.id);

  await prisma.sessao.delete({ where: { id: sessao.id } });

  revalidatePath("/agenda");
  revalidatePath(`/pacientes/${sessao.pacienteId}`);
  redirect("/agenda");
}
