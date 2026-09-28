import { z } from "zod";

export const usuarioFormSchema = z.object({
  first_name: z.string().min(2, "Nome é obrigatório."),
  last_name: z.string().min(2, "Sobrenome é obrigatório."),
  cpf: z.string()
    .transform(val => val.replace(/\D/g, ''))
    .pipe(z.string().length(11, "CPF deve ter 11 dígitos.")),
  email: z.string().email("E-mail inválido.").or(z.literal('').transform(() => null)).optional(),
  password: z.string().optional(),
});

export type UsuarioFormData = z.infer<typeof usuarioFormSchema>;

// --- SCHEMA ESPECÍFICO PARA O PERFIL (Com confirmação de senha) ---
export const perfilEditFormSchema = usuarioFormSchema.extend({
  password2: z.string().optional(),
}).refine(data => data.password === data.password2, {
  message: "As senhas não conferem.",
  path: ["password2"], // O erro vai acender o campo "password2" no UI
});

export type PerfilEditFormData = z.infer<typeof perfilEditFormSchema>;