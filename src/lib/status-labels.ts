import type { StatusPaciente, StatusSessao, StatusPagamento } from "@/lib/types";

type Variant = "success" | "warning" | "danger" | "info" | "neutral";

export function statusPacienteInfo(status: StatusPaciente): { label: string; variant: Variant } {
  return status === "ATIVO"
    ? { label: "Ativo", variant: "success" }
    : { label: "Inativo", variant: "neutral" };
}

export function statusSessaoInfo(status: StatusSessao): { label: string; variant: Variant } {
  switch (status) {
    case "AGENDADA":
      return { label: "Agendada", variant: "info" };
    case "REALIZADA":
      return { label: "Realizada", variant: "success" };
    case "CANCELADA":
      return { label: "Cancelada", variant: "danger" };
  }
}

export function statusPagamentoInfo(status: StatusPagamento): { label: string; variant: Variant } {
  return status === "PAGO"
    ? { label: "Pago", variant: "success" }
    : { label: "Pendente", variant: "warning" };
}
