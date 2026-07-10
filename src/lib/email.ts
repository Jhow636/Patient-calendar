import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { formatHora } from "@/lib/date";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
}

export async function enviarLembretesDoDia() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 1);

  const sessoes = await prisma.sessao.findMany({
    where: {
      status: "AGENDADA",
      dataHora: { gte: inicio, lt: fim },
    },
    include: { paciente: { include: { terapeuta: true } } },
    orderBy: { dataHora: "asc" },
  });

  if (sessoes.length === 0) {
    return { enviados: 0, sessoes: 0, motivo: "Nenhuma sessão agendada para hoje." };
  }

  const porTerapeuta = new Map<
    string,
    { email: string; nome: string; itens: typeof sessoes }
  >();
  for (const sessao of sessoes) {
    const terapeuta = sessao.paciente.terapeuta;
    const atual = porTerapeuta.get(terapeuta.id) ?? {
      email: terapeuta.email,
      nome: terapeuta.nome,
      itens: [],
    };
    atual.itens.push(sessao);
    porTerapeuta.set(terapeuta.id, atual);
  }

  const resend = getResend();
  const remetente = process.env.EMAIL_REMETENTE ?? "onboarding@resend.dev";
  let enviados = 0;

  for (const { email, nome, itens } of porTerapeuta.values()) {
    const linhas = itens.map((s) => `${formatHora(s.dataHora)} — ${s.paciente.nome}`).join("\n");
    const assunto = `Lembrete: ${itens.length} sessão(ões) hoje`;
    const corpoTexto = `Olá, ${nome}!\n\nVocê tem ${itens.length} sessão(ões) hoje:\n\n${linhas}`;

    if (!resend) {
      console.log(`[lembretes] modo stub (sem RESEND_API_KEY) — destinatário: ${email}\n${corpoTexto}`);
      enviados++;
      continue;
    }

    await resend.emails.send({
      from: remetente,
      to: email,
      subject: assunto,
      text: corpoTexto,
    });
    enviados++;
  }

  return { enviados, sessoes: sessoes.length };
}
