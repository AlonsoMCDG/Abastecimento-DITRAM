import { createCrudApi } from "../../../../core/api/crudFactory";
import { ENDPOINTS } from "../../../../core/api/endpoints";

import {
  veiculoReadSchema,
  veiculoWriteSchema,
  type VeiculoListParams,
} from "../schemas/veiculo.dto";


// Cria os métodos base (listar, buscar, criar, atualizar, deletar)
const baseCrud = createCrudApi<
  typeof veiculoReadSchema,
  typeof veiculoWriteSchema,
  VeiculoListParams
>({
  endpoint: ENDPOINTS.frota.veiculos,
  readSchema: veiculoReadSchema,
  writeSchema: veiculoWriteSchema,
});


// API de Veículos
export const veiculosApi = {
  ...baseCrud,
};