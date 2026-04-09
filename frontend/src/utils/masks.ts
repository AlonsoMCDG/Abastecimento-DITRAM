export const MASKS = {
  // Objeto para campos monetários ou hodômetros (2 casas)
  DECIMAL: {
    mask: Number,
    scale: 2,
    thousandsSeparator: '.',
    radix: ',',
    padFractionalZeros: true,
    normalizeZeros: true,
    mapToRadix: ['.'],
    min: 0
  },
  
  // Objeto específico para combustível (3 casas decimais)
  COMBUSTIVEL: {
    mask: Number,
    scale: 3,
    thousandsSeparator: '.',
    radix: ',',
    padFractionalZeros: true,
    normalizeZeros: true,
    mapToRadix: ['.'],
    min: 0
  },

  // Exemplo de strings simples
  CPF: '000.000.000-00',
  CNPJ: '00.000.000/0000-00',
  TELEFONE: '(00) 00000-0000',
  PLACA: 'aaa-0000'
};