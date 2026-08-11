import type { InstituicaoFormData } from "./schemas/instituicao.form.zod";
import type { InstituicaoWriteDTO } from "./schemas/instituicao.write.zod";
import type { InstituicaoReadDTO } from "./schemas/instituicao.read.zod";

export function mapFormToWriteDTO(form: InstituicaoFormData): InstituicaoWriteDTO {
  return {
    nome: form.nome,
    tipo: form.tipo,
    secretaria_id: form.secretaria_id,
    ativo: form.ativo
  };
}

export function mapReadToForm(data: InstituicaoReadDTO): InstituicaoFormData {
  return {
    nome: data.nome,
    tipo: data.tipo,
    secretaria_id: data.secretaria_id,
    ativo: data.ativo
  };
}