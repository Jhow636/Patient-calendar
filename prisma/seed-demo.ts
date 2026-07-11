// Dados fictícios para demonstração (prints do relatório).
// Rode com: npx tsx prisma/seed-demo.ts
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

function nestaSemanana(diaSemana: number, hora: number, minuto = 0) {
  // diaSemana: 1 = segunda ... 7 = domingo, na semana atual
  const hoje = new Date();
  const dia = hoje.getDay() === 0 ? 7 : hoje.getDay();
  const data = new Date(hoje);
  data.setDate(hoje.getDate() + (diaSemana - dia));
  data.setHours(hora, minuto, 0, 0);
  return data;
}

async function main() {
  const terapeuta = await prisma.usuario.findFirst({ where: { papel: "TERAPEUTA" } });
  if (!terapeuta) throw new Error("Rode primeiro: npm run db:seed");

  const jaExiste = await prisma.paciente.findFirst({ where: { nome: "João Pereira" } });
  if (jaExiste) {
    console.log("Dados de demonstração já existem, nada a fazer.");
    return;
  }

  const joao = await prisma.paciente.create({
    data: {
      nome: "João Pereira",
      contato: "(11) 98888-1234",
      valorSessao: 180,
      observacoes: "Processo focado em transição de carreira e autoconfiança.",
      terapeutaId: terapeuta.id,
    },
  });
  const ana = await prisma.paciente.create({
    data: {
      nome: "Ana Costa",
      contato: "ana.costa@email.com",
      valorSessao: 150,
      observacoes: "Acompanhamento semanal desde março.",
      terapeutaId: terapeuta.id,
    },
  });
  const carlos = await prisma.paciente.create({
    data: {
      nome: "Carlos Mendes",
      contato: "(21) 97777-5678",
      valorSessao: 200,
      terapeutaId: terapeuta.id,
    },
  });

  await prisma.paciente.updateMany({
    where: { nome: "Maria Silva" },
    data: {
      observacoes: "Trabalho voltado a ansiedade e limites no ambiente de trabalho.",
    },
  });

  const sessoes: {
    pacienteId: string;
    dataHora: Date;
    status: string;
    pagamento: { valor: number; status: string; dataPagamento?: Date };
  }[] = [
    { pacienteId: joao.id, dataHora: nestaSemanana(1, 10), status: "REALIZADA", pagamento: { valor: 180, status: "PAGO", dataPagamento: nestaSemanana(1, 11) } },
    { pacienteId: ana.id, dataHora: nestaSemanana(2, 14), status: "REALIZADA", pagamento: { valor: 150, status: "PENDENTE" } },
    { pacienteId: carlos.id, dataHora: nestaSemanana(3, 11), status: "CANCELADA", pagamento: { valor: 200, status: "PENDENTE" } },
    { pacienteId: ana.id, dataHora: nestaSemanana(5, 15), status: "REALIZADA", pagamento: { valor: 150, status: "PAGO", dataPagamento: nestaSemanana(5, 16) } },
    { pacienteId: joao.id, dataHora: nestaSemanana(6, 14), status: "AGENDADA", pagamento: { valor: 180, status: "PENDENTE" } },
    { pacienteId: carlos.id, dataHora: nestaSemanana(6, 16), status: "AGENDADA", pagamento: { valor: 200, status: "PENDENTE" } },
    { pacienteId: joao.id, dataHora: nestaSemanana(8, 10), status: "AGENDADA", pagamento: { valor: 180, status: "PENDENTE" } },
    { pacienteId: ana.id, dataHora: nestaSemanana(9, 14), status: "AGENDADA", pagamento: { valor: 150, status: "PENDENTE" } },
  ];

  for (const s of sessoes) {
    await prisma.sessao.create({
      data: {
        pacienteId: s.pacienteId,
        dataHora: s.dataHora,
        status: s.status,
        pagamento: { create: s.pagamento },
      },
    });
  }

  const sessaoComNota = await prisma.sessao.findFirst({
    where: { pacienteId: ana.id, status: "REALIZADA", dataHora: nestaSemanana(2, 14) },
  });
  if (sessaoComNota) {
    await prisma.notaSessao.create({
      data: {
        sessaoId: sessaoComNota.id,
        texto:
          "Sessão produtiva. Ana trouxe avanços na comunicação com a família e relatou melhora no sono. Seguimos explorando o tema de autonomia nas próximas sessões.",
      },
    });
  }

  console.log("Dados de demonstração criados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
