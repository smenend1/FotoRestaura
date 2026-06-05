// Lógica de la Interfaz y Control de Eventos Nativa
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('main-canvas');
  const ctx = canvas.getContext('2d');
  const processBtn = document.getElementById('process-btn');
  const downloadBtn = document.getElementById('download-btn');
  const emptyState = document.getElementById('empty-state');
  const loadingOverlay = document.getElementById('loading-overlay');
  const connectionStatus = document.getElementById('connection-status');
  const fileInput = document.getElementById('image-input');

  let currentBitmap = null;
  let worker = null;

  // Inicializar Web Worker usando ruta relativa compatible
  try {
    worker = new Worker('src/workers/image-processor.worker.js');
    
    worker.addEventListener('message', (event) => {
      const { processedBitmap, error } = event.data;
      loadingOverlay.classList.add('hidden');

      if (error) {
        alert('Error en el Worker: ' + error);
        return;
      }

      if (processedBitmap && ctx) {
        canvas.width = processedBitmap.width;
        canvas.height = processedBitmap.height;
        ctx.drawImage(processedBitmap, 0, 0);
        downloadBtn.disabled = false;
      }
    });
  } catch (e) {
    console.error("No se pudo iniciar el Web Worker en segundo plano", e);
  }

  // Escuchar la carga de imágenes
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      currentBitmap = await createImageBitmap(file);
      
      emptyState.classList.add('hidden');
      canvas.classList.remove('hidden');
      
      canvas.width = currentBitmap.width;
      canvas.height = currentBitmap.height;
      ctx.drawImage(currentBitmap, 0, 0);
      
      processBtn.disabled = false;
      downloadBtn.disabled = true;
    } catch (err) {
      alert("Error al abrir la imagen en el móvil: " + err);
    }
  });

  // Procesar imagen
  processBtn.addEventListener('click', () => {
    if (!currentBitmap || !worker) return;

    loadingOverlay.classList.remove('hidden');
    // Transferir mapa de bits al hilo secundario de forma eficiente
    worker.postMessage({ imageBitmap: currentBitmap }, [currentBitmap]);
    currentBitmap = null; 
    processBtn.disabled = true;
  });

  // Descargar resultado
  downloadBtn.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `cinematic_${Date.now()}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Registro del Service Worker para soporte PWA Offline e Instalación
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('PWA lista para uso offline.', reg.scope))
      .catch(err => console.error('Error al registrar ServiceWorker', err));
  }

  // Monitor de Conexión Nata
  const updateOnlineStatus = () => {
    if (navigator.onLine) {
      connectionStatus.textContent = "Online";
      connectionStatus.className = "status-badge online";
    } else {
      connectionStatus.textContent = "Offline Mode";
      connectionStatus.className = "status-badge offline";
    }
  };
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
});
