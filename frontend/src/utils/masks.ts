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

  PLACA: {
    mask: [
      { mask: 'aaa-0000' }, // Padrão Antigo (3 letras, hífen, 4 números)
      { mask: 'aaa0a00' }   // Padrão Mercosul (3 letras, 1 número, 1 letra, 2 números)
    ],
    // O 'prepare' intercepta a tecla digitada e transforma em maiúscula na hora
    prepare: (char: string) => char.toUpperCase()
  },
  
  // Exemplo de strings simples
  CPF: '000.000.000-00',
  CNPJ: '00.000.000/0000-00',
  TELEFONE: '(00) 00000-0000',
};