# Cinematic PWA Studio

Una aplicación web progresiva (PWA) de rendimiento optimizado diseñada para procesar imágenes en el cliente mediante Web Workers asíncronos. Aplica un estilo de video musical cálido con tonos ámbar, iluminación perimetral dorada (*rim light*) y efecto bokeh/profundidad de campo.

## Características
- **Procesamiento Asíncrono:** Utiliza un Web Worker dedicado y objetos transferibles (`ImageBitmap`) para no bloquear el hilo principal.
- **Modo Offline-First:** Arquitectura de Service Worker con caché local completa.
- **Interactiva:** Carga de imágenes locales, previsualización en tiempo real y descarga local nativa.

## Estructura del Proyecto
El código está modularizado bajo principios SOLID y tipado en TypeScript.

## Cómo ejecutar en local
1. Extrae el contenido en una carpeta.
2. Abre la carpeta en tu editor de código (por ejemplo, VS Code).
3. Utiliza un servidor local como `Live Server` o un bundler como `Vite` (`npm run dev`) para servir los archivos a través de HTTP/HTTPS, asegurando que el Service Worker y los Web Workers puedan inicializarse correctamente.
