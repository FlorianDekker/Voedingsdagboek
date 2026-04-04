import { GoogleGenAI } from '@google/genai';

const STORAGE_KEY = 'gemini-api-key';

export function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function setApiKey(key) {
  if (key) localStorage.setItem(STORAGE_KEY, key);
  else localStorage.removeItem(STORAGE_KEY);
}

export function hasApiKey() {
  return !!localStorage.getItem(STORAGE_KEY);
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const max = 1024;
      let { width, height } = img;
      if (width > max || height > max) {
        if (width > height) { height = Math.round(height * max / width); width = max; }
        else { width = Math.round(width * max / height); height = max; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, mimeType: 'image/jpeg' });
    };
    img.onerror = () => reject(new Error('Kon de foto niet laden'));
    img.src = URL.createObjectURL(file);
  });
}

export async function analyzeMealPhoto(base64, mimeType) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Stel eerst een API-sleutel in via Instellingen');

  const ai = new GoogleGenAI({ apiKey });

  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: `Analyseer deze foto van een maaltijd. Geef je antwoord als JSON met deze structuur:
{"name": "korte naam van de maaltijd", "ingredients": ["ingredient1", "ingredient2", ...]}

Regels:
- Alle namen in het Nederlands
- Ingrediënten in kleine letters
- Schat de zichtbare ingrediënten zo goed mogelijk in
- Geef alleen geldig JSON terug, geen andere tekst` }
        ]
      }]
    });
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      throw new Error('Ongeldige API-sleutel. Controleer je sleutel in Instellingen.');
    }
    if (err.status === 429) {
      throw new Error('Daglimiet bereikt. Probeer het morgen opnieuw.');
    }
    throw new Error('Geen internetverbinding. Probeer opnieuw.');
  }

  const text = typeof response.text === 'function' ? response.text() : (response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '');

  // Extract JSON from possible markdown code fences
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Kon de foto niet herkennen. Probeer een duidelijkere foto.');

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Kon de foto niet herkennen. Probeer een duidelijkere foto.');
  }

  if (!parsed.name || !Array.isArray(parsed.ingredients) || parsed.ingredients.length === 0) {
    throw new Error('Kon geen ingrediënten herkennen. Probeer een duidelijkere foto.');
  }

  return {
    name: parsed.name,
    ingredients: parsed.ingredients.map(i => String(i).toLowerCase()),
  };
}
