"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth-helpers";
import {
  combinarDataHora,
  formatDataParam,
  inicioSemana,
  ocorrenciaRecorrente,
} from "@/lib/date";
import { RECORRENCIA, STATUS_SESSAO, type StatusSessao } from "@/lib/types";

const sessaoSchema = z.object({
  pacienteId: z.string().min(1, "Selecione um paciente"),
  data: z.string().min(1, "Informe a data"),
  hora: z.string().min(1, "Informe o horário"),
  recorrencia: z.enum(RECORRENCIA),
  repeticoes: z.coerce.number().int().min(1).max(52).catch(12),
  valor: z.coerce.number().nonnegative().optional().nullable(),
});

const remarcarSchema = z.object({
  data: z.string().min(1, "Informe a data"),
  hora: z.string().min(1, "Informe o horário"),
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
    repeticoes: formData.get("repeticoes"),
    valor: formData.get("valor") || null,
  });

  const paciente = await exigirPaciente(dados.pacienteId, usuario.id);
  const valor = dados.valor ?? 0;

  const primeiraData = combinarDataHora(dados.data, dados.hora);
  const totalOcorrencias = dados.recorrencia === "NENHUMA" ? 1 : dados.repeticoes;

  // Criar em lote: uma sessão por vez estourava o timeout da transação
  // quando a recorrência tinha muitas ocorrências.
  await prisma.$transaction(async (tx) => {
    const sessoes = await tx.sessao.createManyAndReturn({
      data: Array.from({ length: totalOcorrencias }, (_, i) => ({
        pacienteId: paciente.id,
        dataHora: ocorrenciaRecorrente(primeiraData, dados.recorrencia, i),
        recorrencia: dados.recorrencia,
      })),
      select: { id: true },
    });

    await tx.pagamento.createMany({
      data: sessoes.map((sessao) => ({ sessaoId: sessao.id, valor })),
    });
  });

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

export async function remarcarSessao(id: string, formData: FormData) {
  const usuario = await requireUsuario();
  const sessao = await exigirSessao(id, usuario.id);
  const dados = remarcarSchema.parse({
    data: formData.get("data"),
    hora: formData.get("hora"),
  });

  await prisma.sessao.update({
    where: { id: sessao.id },
    data: {
      dataHora: combinarDataHora(dados.data, dados.hora),
      // Remarcar uma sessão cancelada volta a agendá-la.
      ...(sessao.status === "CANCELADA" ? { status: "AGENDADA" } : {}),
    },
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
