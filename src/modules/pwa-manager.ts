export class PWAManager {
  public static registerServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          console.log('ServiceWorker registrado con éxito: ', reg.scope);
        } catch (error) {
          console.error('Fallo al registrar el ServiceWorker: ', error);
        }
      });
    }
  }

  public static monitorConnection(onStatusChange: (isOnline: boolean) => void): void {
    const updateStatus = () => {
      onStatusChange(navigator.onLine);
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  }
}