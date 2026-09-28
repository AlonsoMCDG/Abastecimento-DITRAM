import type { TipoCombustivelFormData } from "./schemas/tipoCombustivel.form.zod";
import type { TipoCombustivelWriteDTO } from "./schemas/tipoCombustivel.write.zod";
import type { TipoCombustivelReadDTO } from "./schemas/tipoCombustivel.read.zod";

export function mapFormToWriteDTO(form: TipoCombustivelFormData): TipoCombustivelWriteDTO {
  return {
    nome: form.nome,
    ativo: form.ativo
  };
}

export function mapReadToForm(data: TipoCombustivelReadDTO): TipoCombustivelFormData {
  return {
    nome: data.nome,
    ativo: data.ativo
  };
}