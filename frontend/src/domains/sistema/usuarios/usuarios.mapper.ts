import type { UsuarioFormData, PerfilEditFormData } from "./schemas/usuario.form.zod";
import type { UsuarioWriteDTO } from "./schemas/usuario.write.zod";
import type { UsuarioReadDTO } from "./schemas/usuario.read.zod";

export function mapFormToWriteDTO(form: UsuarioFormData | PerfilEditFormData): UsuarioWriteDTO {
  return {
    first_name: form.first_name,
    last_name: form.last_name,
    cpf: form.cpf, // O Zod já limpou a máscara!
    email: form.email,
    password: form.password,
  };
}

export function mapReadToForm(data: UsuarioReadDTO): Partial<PerfilEditFormData> {
  return {
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    cpf: data.cpf,
    email: data.email || '',
    password: '',
    password2: '',
  };
}