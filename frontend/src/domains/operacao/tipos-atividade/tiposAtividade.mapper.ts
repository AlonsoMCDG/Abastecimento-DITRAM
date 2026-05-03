import type { TipoAtividadeFormData } from "./schemas/tipoAtividade.form.zod";
import type { TipoAtividadeWriteDTO } from "./schemas/tipoAtividade.write.zod";
import type { TipoAtividadeReadDTO } from "./schemas/tipoAtividade.read.zod";

// Como não há XORs complexos nesta entidade, o mapeamento é direto (1:1),
// mas mantemos o padrão arquitetural para o caso do modelo crescer no futuro.

export function mapFormToWriteDTO(form: TipoAtividadeFormData): TipoAtividadeWriteDTO {
  return {
    nome: form.nome,
    ativo: form.ativo
  };
}

export function mapReadToForm(data: TipoAtividadeReadDTO): TipoAtividadeFormData {
  return {
    nome: data.nome,
    ativo: data.ativo
  };
}