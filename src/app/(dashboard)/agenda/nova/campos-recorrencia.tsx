"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RECORRENCIA, RECORRENCIA_LABEL, type Recorrencia } from "@/lib/types";

export function CamposRecorrencia() {
  const [recorrencia, setRecorrencia] = useState<Recorrencia>("NENHUMA");

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="recorrencia">Recorrência</Label>
        <Select
          name="recorrencia"
          value={recorrencia}
          onValueChange={(valor) => setRecorrencia(valor as Recorrencia)}
        >
          <SelectTrigger id="recorrencia" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RECORRENCIA.map((opcao) => (
              <SelectItem key={opcao} value={opcao}>
                {RECORRENCIA_LABEL[opcao]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {recorrencia !== "NENHUMA" && (
        <div className="space-y-1.5">
          <Label htmlFor="repeticoes">Quantas sessões criar</Label>
          <Input
            id="repeticoes"
            name="repeticoes"
            type="number"
            min={1}
            max={52}
            defaultValue={12}
          />
          <p className="text-xs text-ink-soft">
            Todas no mesmo horário. Depois dá para remarcar ou cancelar cada uma
            separadamente.
          </p>
        </div>
      )}
    </>
  );
}
