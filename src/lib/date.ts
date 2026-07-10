import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDataHora(data: Date) {
  const texto = format(data, "EEE, d 'de' MMM 'às' HH:mm", { locale: ptBR });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatHora(data: Date) {
  return format(data, "HH:mm");
}

export function formatDiaCurto(data: Date) {
  return format(data, "EEEEEE", { locale: ptBR });
}

export function formatDiaCompleto(data: Date) {
  return format(data, "d 'de' MMMM", { locale: ptBR });
}

export function inicioSemana(data: Date) {
  return startOfWeek(data, { weekStartsOn: 1 });
}

export function diasDaSemana(inicio: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(inicio, i));
}

export function proximaSemana(data: Date) {
  return addWeeks(data, 1);
}

export function semanaAnterior(data: Date) {
  return addWeeks(data, -1);
}

export function parseDataParam(valor: string | undefined): Date {
  if (!valor) return new Date();
  const data = parseISO(valor);
  return Number.isNaN(data.getTime()) ? new Date() : data;
}

export function formatDataParam(data: Date) {
  return format(data, "yyyy-MM-dd");
}

export function inicioMes(data: Date) {
  return startOfMonth(data);
}

export function fimMes(data: Date) {
  return endOfMonth(data);
}

export function proximoMes(data: Date) {
  return addMonths(data, 1);
}

export function mesAnterior(data: Date) {
  return addMonths(data, -1);
}

export function formatMes(data: Date) {
  const texto = format(data, "MMMM 'de' yyyy", { locale: ptBR });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatMesParam(data: Date) {
  return format(data, "yyyy-MM");
}

export function parseMesParam(valor: string | undefined): Date {
  if (!valor) return new Date();
  const data = parseISO(`${valor}-01`);
  return Number.isNaN(data.getTime()) ? new Date() : data;
}

export function formatDataCurta(data: Date) {
  return format(data, "d 'de' MMM", { locale: ptBR });
}
