/**
 * Monta um link wa.me a partir de um telefone brasileiro em formato livre
 * (ex.: "(11) 98888-1234") com uma mensagem pré-preenchida.
 */
export function linkWhatsApp(telefone: string, mensagem: string): string {
  let digitos = telefone.replace(/\D/g, "");

  // Sem código do país: assume Brasil (DDD + número = 10 ou 11 dígitos)
  if (digitos.length === 10 || digitos.length === 11) {
    digitos = `55${digitos}`;
  }

  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensagem)}`;
}
