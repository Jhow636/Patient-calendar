import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { criarPaciente } from "@/lib/actions/pacientes";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = { title: "Novo paciente" };

export default function NovoPacientePage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/pacientes">
            <ChevronLeft data-icon="inline-start" />
            Pacientes
          </Link>
        </Button>
        <h1 className="mt-1 text-xl font-semibold text-ink">Novo paciente</h1>
      </div>

      <Card>
        <CardContent>
          <form action={criarPaciente} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" required autoFocus />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contato@exemplo.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" placeholder="(11) 98888-1234" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="valorSessao">Valor da sessão (R$)</Label>
              <Input
                id="valorSessao"
                name="valorSessao"
                type="number"
                step="0.01"
                min="0"
                placeholder="150.00"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prontuario">Prontuário</Label>
              <Textarea
                id="prontuario"
                name="prontuario"
                rows={6}
                placeholder="Histórico clínico do paciente, diagnósticos, tratamentos anteriores..."
              />
            </div>

            <SubmitButton className="w-full">Salvar paciente</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
