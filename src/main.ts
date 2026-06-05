import { PWAManager } from './modules/pwa-manager';
import { UIController } from './modules/ui-controller';

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UIController();

  PWAManager.registerServiceWorker();
  PWAManager.monitorConnection((isOnline: boolean) => {
    ui.updateNetworkUI(isOnline);
  });
});