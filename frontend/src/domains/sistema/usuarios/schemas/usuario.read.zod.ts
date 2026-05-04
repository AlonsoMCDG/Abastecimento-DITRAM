import { z } from "zod";

export const usuarioReadSchema = z.object({
  id: z.number(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  cpf: z.string(),
  email: z.string().nullable(),
  is_staff: z.boolean(),
  is_superuser: z.boolean(),
  is_active: z.boolean(),
  
  // Permissões
  can_write_cadastros: z.boolean().default(false),
  can_write_frota: z.boolean().default(false),
  can_create_guia_abastecimento: z.boolean().default(false),
  can_edit_guia_abastecimento: z.boolean().default(false),
  can_delete_guia_abastecimento: z.boolean().default(false),
});

export type UsuarioReadDTO = z.infer<typeof usuarioReadSchema>;