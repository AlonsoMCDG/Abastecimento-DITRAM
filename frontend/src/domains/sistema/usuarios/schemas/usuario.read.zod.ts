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

});

export type UsuarioReadDTO = z.infer<typeof usuarioReadSchema>;