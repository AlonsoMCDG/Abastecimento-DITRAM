import { z } from "zod";

export const usuarioWriteSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  cpf: z.string(),
  email: z.string().nullable().optional(),
  password: z.string().optional(), // No create é required via API, mas tratamos na page
});

export type UsuarioWriteDTO = z.infer<typeof usuarioWriteSchema>;