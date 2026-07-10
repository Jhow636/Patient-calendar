import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "everton@exemplo.com";
  const senha = process.env.SEED_ADMIN_SENHA ?? "trocar123";

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    console.log(`Usuário ${email} já existe, nada a fazer.`);
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await prisma.usuario.create({
    data: {
      nome: "Everton Dutra",
      email,
      senhaHash,
      papel: "TERAPEUTA",
    },
  });

  console.log(`Usuário criado: ${usuario.email}`);
  console.log(`Senha inicial: ${senha} (troque depois do primeiro login)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
