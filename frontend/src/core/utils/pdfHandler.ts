export async function processPdfBlob(
  pdfBlob: Blob, 
  filename: string,
  action: 'open' | 'print'
) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const blobUrl = URL.createObjectURL(pdfBlob);

  // =========================================================
  // FLUXO 1: AÇÃO DE IMPRIMIR (Funciona no PC e no Celular)
  // =========================================================
  if (action === 'print') {
    const iframe = document.createElement('iframe');
    
    // TRUQUE DE MESTRE PARA CELULAR (Especialmente iOS Safari):
    // Nunca use 'display: none', senão o celular imprime uma folha em branco.
    // Usamos position absolute e tamanho zero para esconder o iframe na tela.
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.src = blobUrl;
    
    document.body.appendChild(iframe);
    
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        // Dispara a tela de impressão nativa do SO (iOS, Android, Windows, Mac)
        iframe.contentWindow?.print(); 
      } catch (e) {
        console.error("Falha ao abrir a tela de impressão", e);
        // Fallback de segurança se o navegador barrar o print via iframe
        if (isMobile) window.location.assign(blobUrl);
      }
      
      // Limpa a memória após 5 minutos (tempo de folga enquanto o usuário configura a impressora)
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        URL.revokeObjectURL(blobUrl);
      }, 300000); 
    };
    
    return; // Encerra aqui se a ação for de imprimir
  }

  // =========================================================
  // FLUXO 2: AÇÃO DE VISUALIZAR (Open)
  // =========================================================
  if (isMobile) {
    // Para mobile, navegar para o PDF evita avisos de vírus
    const newTab = window.open(blobUrl, '_blank');

    if (!newTab) {
      // Se bloqueou popup, navega na aba atual (o usuário clica em Voltar depois)
      window.location.assign(blobUrl);
    }
    
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    return;
  }

  // Fluxo de visualizar no PC
  const pdfWindow = window.open(blobUrl, '_blank');
  
  if (!pdfWindow) {
    // Fallback: bloqueio de pop-up agressivo no PC força download limpo
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}