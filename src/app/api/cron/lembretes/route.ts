import { NextRequest, NextResponse } from "next/server";
import { enviarLembretesDoDia } from "@/lib/email";

export async function GET(request: NextRequest) {
  const segredo = process.env.CRON_SECRET;
  if (segredo) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${segredo}`) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
  }

  const resultado = await enviarLembretesDoDia();
  return NextResponse.json(resultado);
}
