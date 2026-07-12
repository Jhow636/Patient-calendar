/*
  Warnings:

  - You are about to drop the column `observacoes` on the `Paciente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "telefone" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Paciente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "prontuario" TEXT,
    "valorSessao" REAL,
    "terapeutaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Paciente_terapeutaId_fkey" FOREIGN KEY ("terapeutaId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Paciente" ("createdAt", "email", "id", "nome", "prontuario", "status", "telefone", "terapeutaId", "updatedAt", "valorSessao") SELECT "createdAt", "email", "id", "nome", "prontuario", "status", "telefone", "terapeutaId", "updatedAt", "valorSessao" FROM "Paciente";
DROP TABLE "Paciente";
ALTER TABLE "new_Paciente" RENAME TO "Paciente";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
