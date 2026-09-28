import type { PessoaFormData } from "./schemas/pessoa.form.zod";
import type { PessoaWriteDTO } from "./schemas/pessoa.write.zod";
import type { PessoaReadDTO } from "./schemas/pessoa.read.zod";

export function mapFormToWriteDTO(form: PessoaFormData): PessoaWriteDTO {
  return {
    nome: form.nome,
    cpf: form.cpf, // O Zod já limpou a formatação (pontos e traços) no step de transform do FormSchema
    ativo: form.ativo
  };
}

export function mapReadToForm(data: PessoaReadDTO): PessoaFormData {
  return {
    nome: data.nome,
    cpf: data.cpf,
    ativo: data.ativo
  };
}