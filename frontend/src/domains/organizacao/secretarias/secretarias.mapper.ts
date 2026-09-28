import type { SecretariaFormData } from "./schemas/secretaria.form.zod";
import type { SecretariaWriteDTO } from "./schemas/secretaria.write.zod";
import type { SecretariaReadDTO } from "./schemas/secretaria.read.zod";

export function mapFormToWriteDTO(form: SecretariaFormData): SecretariaWriteDTO {
  return {
    nome: form.nome,
    sigla: form.sigla.toUpperCase(), // Garante a sigla em maiúsculo já no envio
    ativo: form.ativo
  };
}

export function mapReadToForm(data: SecretariaReadDTO): SecretariaFormData {
  return {
    nome: data.nome,
    sigla: data.sigla,
    ativo: data.ativo
  };
}