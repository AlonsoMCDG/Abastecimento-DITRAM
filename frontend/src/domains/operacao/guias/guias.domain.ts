import type { GuiaAbastecimentoWriteDTO } from "./schemas/guia.write.zod"

export function validarVeiculoGuia(data: GuiaAbastecimentoWriteDTO) {
  const count = [
    data.veiculo_id != null,
    !!data.tipo_veiculo,
    !!data.veiculo_descricao
  ].filter(Boolean).length

  if (count !== 1) {
    throw new Error("Regra de veículo inválida")
  }
}

export function calcularDistancia(
  inicial: number,
  final: number
) {
  const distancia = final - inicial
  if (distancia < 0) throw new Error("Distância inválida")
  return distancia
}