export const STATUS_PACIENTE = ["ATIVO", "INATIVO"] as const;
export type StatusPaciente = (typeof STATUS_PACIENTE)[number];

export const STATUS_SESSAO = ["AGENDADA", "REALIZADA", "CANCELADA"] as const;
export type StatusSessao = (typeof STATUS_SESSAO)[number];

export const RECORRENCIA = ["NENHUMA", "SEMANAL", "QUINZENAL", "MENSAL"] as const;
export type Recorrencia = (typeof RECORRENCIA)[number];

export const RECORRENCIA_LABEL: Record<Recorrencia, string> = {
  NENHUMA: "Única",
  SEMANAL: "Toda semana",
  QUINZENAL: "A cada 15 dias",
  MENSAL: "Todo mês",
};

export const STATUS_PAGAMENTO = ["PAGO", "PENDENTE"] as const;
export type StatusPagamento = (typeof STATUS_PAGAMENTO)[number];

export const PAPEL = ["TERAPEUTA", "PACIENTE"] as const;
export type Papel = (typeof PAPEL)[number];
