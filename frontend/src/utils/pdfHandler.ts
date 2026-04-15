export async function processPdfBlob(
  pdfBlob: Blob, 
  filename: string,
  action: 'open' | 'print'
) {
  const file = new File([pdfBlob], filename, { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(pdfBlob);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // =========================================================
  // FLUXO 1: É CELULAR (Mobile)
  // =========================================================
  if (isMobile) {
    // Tenta a Web Share API. A gaveta do celular já possui a opção "Imprimir" nativa.
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename });
        return;
      } catch (error: any) {
        if (error.name !== 'AbortError') console.warn("Share API falhou", error);
      }
    }
    
    // Fallback: Se o celular for muito antigo, força o download.
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.click();
    return;
  }

  // =========================================================
  // FLUXO 2: É COMPUTADOR (Desktop)
  // =========================================================
  if (action === 'print') {
    // IMPRIMIR DIRETO: Cria um iframe invisível, injeta o PDF e chama a impressora
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    
    iframe.onload = () => {
      iframe.contentWindow?.print();
      // Remove o iframe invisível da memória após 5 segundos
      setTimeout(() => document.body.removeChild(iframe), 5000);
    };
    return;
  } 
  
  if (action === 'open') {
    // ABRIR EM NOVA ABA
    const pdfWindow = window.open(blobUrl, '_blank');
    if (!pdfWindow) {
      // Ocorreu bloqueio severo de Pop-up. Força o download como plano B.
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
    }
  }
}