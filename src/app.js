document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('main-canvas');
  const ctx = canvas.getContext('2d');
  const processBtn = document.getElementById('process-btn');
  const downloadBtn = document.getElementById('download-btn');
  const emptyState = document.getElementById('empty-state');
  const loadingOverlay = document.getElementById('loading-overlay');
  const connectionStatus = document.getElementById('connection-status');
  const fileInput = document.getElementById('image-input');

  let currentBase64 = null;

  // ¡PEGA AQUÍ TU URL DE VERCEL! Recuerda mantener el /api/process-image al final
  const VERCEL_BACKEND_URL = "https://TU_PROYECTO_DE_VERCEL.vercel.app/api/process-image";

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      currentBase64 = reader.result;
      
      const img = new Image();
      img.onload = () => {
        emptyState.classList.add('hidden');
        canvas.classList.remove('hidden');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        processBtn.disabled = false;
        downloadBtn.disabled = true;
      };
      img.src = currentBase64;
    };
    reader.readAsDataURL(file);
  });

  processBtn.addEventListener('click', async () => {
    if (!currentBase64) return;

    loadingOverlay.classList.remove('hidden');
    processBtn.disabled = true;

    try {
      const response = await fetch(VERCEL_BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: currentBase64 })
      });

      const data = await response.json();
      loadingOverlay.classList.add('hidden');

      if (data.error) {
        alert("Aviso de la IA: " + data.error);
        processBtn.disabled = false;
        return;
      }

      if (data.processedImageUrl) {
        const processedImageObj = new Image();
        processedImageObj.crossOrigin = "anonymous"; 
        processedImageObj.onload = () => {
          canvas.width = processedImageObj.width;
          canvas.height = processedImageObj.height;
          ctx.drawImage(processedImageObj, 0, 0);
          downloadBtn.disabled = false; 
        };
        processedImageObj.src = data.processedImageUrl;
      }
    } catch (err) {
      loadingOverlay.classList.add('hidden');
      processBtn.disabled = false;
      alert("Error de comunicación: " + err.message);
    }
  });

  downloadBtn.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `cinematic_ia_${Date.now()}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.error(err));
  }
});
