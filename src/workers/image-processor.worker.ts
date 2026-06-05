const ctx: Worker = self as any;

ctx.addEventListener('message', async (event: MessageEvent) => {
  const { imageBitmap } = event.data;
  
  if (!imageBitmap) {
    ctx.postMessage({ error: 'No se recibieron datos de imagen' });
    return;
  }

  const width = imageBitmap.width;
  const height = imageBitmap.height;
  
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');

  if (!context) {
    ctx.postMessage({ error: 'No se pudo inicializar el contexto Offscreen' });
    return;
  }

  context.drawImage(imageBitmap, 0, 0);
  
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    r = Math.min(255, r * 1.18);
    g = Math.min(255, g * 1.08);
    b = b * 0.82;

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  context.putImageData(imageData, 0, 0);

  const blurredCanvas = new OffscreenCanvas(width, height);
  const blurredCtx = blurredCanvas.getContext('2d');
  if (blurredCtx) {
    blurredCtx.drawImage(canvas, 0, 0);
    context.filter = 'blur(12px)';
    context.drawImage(blurredCanvas, 0, 0);
    context.filter = 'none';
  }

  const maskCanvas = new OffscreenCanvas(width, height);
  const maskCtx = maskCanvas.getContext('2d');
  if (maskCtx) {
    const gradient = maskCtx.createRadialGradient(centerX, centerY, Math.min(width, height) * 0.15, centerX, centerY, Math.min(width, height) * 0.45);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    maskCtx.fillStyle = gradient;
    maskCtx.fillRect(0, 0, width, height);

    blurredCanvas.getContext('2d')?.drawImage(imageBitmap, 0, 0);
    context.globalCompositeOperation = 'destination-out';
    context.drawImage(maskCanvas, 0, 0);
    context.globalCompositeOperation = 'destination-over';
    context.drawImage(blurredCanvas, 0, 0);
    context.globalCompositeOperation = 'source-over';
  }

  const glowGradient = context.createRadialGradient(centerX, centerY, Math.min(width, height) * 0.3, centerX, centerY, maxDistance);
  glowGradient.addColorStop(0, 'rgba(229, 169, 59, 0.0)');
  glowGradient.addColorStop(0.7, 'rgba(229, 169, 59, 0.25)');
  glowGradient.addColorStop(1, 'rgba(229, 169, 59, 0.0)');
  
  context.fillStyle = glowGradient;
  context.fillRect(0, 0, width, height);

  const processedBitmap = canvas.transferToImageBitmap();
  ctx.postMessage({ processedBitmap }, [processedBitmap]);
});