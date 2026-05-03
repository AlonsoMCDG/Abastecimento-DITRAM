import type { RotaFormData } from "./schemas/rota.form.zod";
import type { RotaWriteDTO } from "./schemas/rota.write.zod";
import type { RotaReadDTO } from "./schemas/rota.read.zod";

export function mapFormToWriteDTO(form: RotaFormData): RotaWriteDTO {
  return {
    nome: form.nome,
    secretaria: form.secretaria_id,
    distancia_km: form.distancia_km,
    detalhes: form.detalhes,
    ativa: form.ativa
  };
}

export function mapReadToForm(data: RotaReadDTO): Partial<RotaFormData> {
  return {
    nome: data.nome,
    secretaria_id: data.secretaria_id,
    distancia_km: data.distancia_km,
    detalhes: data.detalhes,
    ativa: data.ativa
  };
}