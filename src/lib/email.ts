import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { formatHora } from "@/lib/date";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
}

async function enviarEmail(
  resend: Resend | null,
  remetente: string,
  destinatario: string,
  assunto: string,
  corpoTexto: string
) {
  if (!resend) {
    console.log(
      `[lembretes] modo stub (sem RESEND_API_KEY) — destinatário: ${destinatario}\n${corpoTexto}`
    );
    return;
  }
  await resend.emails.send({
    from: remetente,
    to: destinatario,
    subject: assunto,
    text: corpoTexto,
  });
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
    return {
      enviadosTerapeuta: 0,
      enviadosPacientes: 0,
      sessoes: 0,
      motivo: "Nenhuma sessão agendada para hoje.",
    };
  }

  const resend = getResend();
  const remetente = process.env.EMAIL_REMETENTE ?? "onboarding@resend.dev";

  // Resumo do dia para cada terapeuta
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

  let enviadosTerapeuta = 0;
  for (const { email, nome, itens } of porTerapeuta.values()) {
    const linhas = itens.map((s) => `${formatHora(s.dataHora)} — ${s.paciente.nome}`).join("\n");
    await enviarEmail(
      resend,
      remetente,
      email,
      `Lembrete: ${itens.length} sessão(ões) hoje`,
      `Olá, ${nome}!\n\nVocê tem ${itens.length} sessão(ões) hoje:\n\n${linhas}`
    );
    enviadosTerapeuta++;
  }

  // Lembrete individual para cada paciente com e-mail cadastrado
  let enviadosPacientes = 0;
  let pacientesSemEmail = 0;
  for (const sessao of sessoes) {
    const { paciente } = sessao;
    if (!paciente.email) {
      pacientesSemEmail++;
      continue;
    }
    await enviarEmail(
      resend,
      remetente,
      paciente.email,
      `Lembrete: sua sessão é hoje às ${formatHora(sessao.dataHora)}`,
      `Olá, ${paciente.nome}!\n\n` +
        `Passando para lembrar da sua sessão hoje às ${formatHora(sessao.dataHora)} ` +
        `com ${paciente.terapeuta.nome}.\n\n` +
        `Se precisar remarcar, é só entrar em contato.\n\n` +
        `Até logo!`
    );
    enviadosPacientes++;
  }

  return {
    enviadosTerapeuta,
    enviadosPacientes,
    pacientesSemEmail,
    sessoes: sessoes.length,
  };
}
