export default async function handler(req, res) {
  // Configuración de permisos de seguridad (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Usa el método POST.' });

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Falta la imagen.' });

    // Cargar tu clave secreta guardada en Vercel
    const FAL_KEY = process.env.IMAGE_IA_API_KEY;
    if (!FAL_KEY) return res.status(500).json({ error: 'Falta configurar la API Key en Vercel.' });

    const promptText = "Apply a warm, cinematic music-video style with strong golden backlighting (rim light) behind the subject, creating a soft halo on hair and shoulders. Keep the face clearly and evenly lit with soft frontal light. Use a shallow depth of field with a blurred background and rich amber/gold tones for a moody atmosphere. Preserve the subject's original features, pose, outfit, background, and gender exactly. Enhance sharpness and skin detail with a realistic upscale, maintaining natural outdoor daylight and proper exposure.";

    // Petición directa al servidor de IA de Fal.ai (Modelo optimizado para edición estructural img2img)
    const response = await fetch("https://queue.fal.run/fal-ai/flux/dev/image-to-image", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image_url: imageBase64,
        prompt: promptText,
        strength: 0.4, // Mantiene tus rasgos intactos y solo altera el fondo, luces y nitidez
        guidance_scale: 7.5,
        num_inference_steps: 30,
        enable_safety_checker: true
      })
    });

    const result = await response.json();
    
    // Si Fal.ai usa sistema de cola, esperamos a que termine
    let statusUrl = result.status_url;
    let finalResult = result;
    
    if (statusUrl) {
      while (finalResult.status === "IN_QUEUE" || finalResult.status === "IN_PROGRESS") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const check = await fetch(statusUrl, { headers: { "Authorization": `Key ${FAL_KEY}` } });
        finalResult = await check.json();
      }
    }

    if (finalResult.image && finalResult.image.url) {
      return res.status(200).json({ processedImageUrl: finalResult.image.url });
    } else if (finalResult.images && finalResult.images[0]) {
      return res.status(200).json({ processedImageUrl: finalResult.images[0].url });
    } else {
      return res.status(500).json({ error: "La IA no devolvió ninguna imagen." });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor backend: ' + error.message });
  }
}

