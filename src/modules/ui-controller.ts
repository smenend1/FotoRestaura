export class UIController {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private processBtn: HTMLButtonElement;
  private downloadBtn: HTMLButtonElement;
  private emptyState: HTMLDivElement;
  private loadingOverlay: HTMLDivElement;
  private connectionStatus: HTMLSpanElement;
  
  private currentBitmap: ImageBitmap | null = null;
  private worker: Worker;

  constructor() {
    this.canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.processBtn = document.getElementById('process-btn') as HTMLButtonElement;
    this.downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;
    this.emptyState = document.getElementById('empty-state') as HTMLDivElement;
    this.loadingOverlay = document.getElementById('loading-overlay') as HTMLDivElement;
    this.connectionStatus = document.getElementById('connection-status') as HTMLSpanElement;
    
    this.worker = new Worker(new URL('../workers/image-processor.worker.ts', import.meta.url), { type: 'module' });
    this.initListeners();
  }

  private initListeners(): void {
    const fileInput = document.getElementById('image-input') as HTMLInputElement;
    
    fileInput.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        await this.handleImageUpload(target.files[0]);
      }
    });

    this.processBtn.addEventListener('click', () => this.applyCinematicFilter());
    this.downloadBtn.addEventListener('click', () => this.downloadProcessedImage());

    this.worker.addEventListener('message', (event: MessageEvent) => {
      const { processedBitmap, error } = event.data;
      this.toggleLoading(false);

      if (error) {
        alert('Error en el procesamiento: ' + error);
        return;
      }

      if (processedBitmap && this.ctx) {
        this.canvas.width = processedBitmap.width;
        this.canvas.height = processedBitmap.height;
        this.ctx.drawImage(processedBitmap, 0, 0);
        this.downloadBtn.disabled = false;
      }
    });
  }

  private async handleImageUpload(file: File): Promise<void> {
    try {
      this.currentBitmap = await createImageBitmap(file);
      this.emptyState.classList.add('hidden');
      this.canvas.classList.remove('hidden');
      
      this.canvas.width = this.currentBitmap.width;
      this.canvas.height = this.currentBitmap.height;
      this.ctx?.drawImage(this.currentBitmap, 0, 0);
      
      this.processBtn.disabled = false;
      this.downloadBtn.disabled = true;
    } catch (err) {
      console.error("Error al generar el mapa de bits", err);
    }
  }

  private applyCinematicFilter(): void {
    if (!this.currentBitmap) return;

    this.toggleLoading(true);
    this.worker.postMessage({ imageBitmap: this.currentBitmap }, [this.currentBitmap]);
    this.currentBitmap = null; 
    this.processBtn.disabled = true;
  }

  private downloadProcessedImage(): void {
    const dataUrl = this.canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `cinematic_gold_\${Date.now()}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public toggleLoading(show: boolean): void {
    if (show) this.loadingOverlay.classList.remove('hidden');
    else this.loadingOverlay.classList.add('hidden');
  }

  public updateNetworkUI(isOnline: boolean): void {
    if (isOnline) {
      this.connectionStatus.textContent = "Online";
      this.connectionStatus.className = "status-badge online";
    } else {
      this.connectionStatus.textContent = "Offline Mode";
      this.connectionStatus.className = "status-badge offline";
    }
  }
}