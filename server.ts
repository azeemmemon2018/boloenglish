import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory audio cache to make sentence playback instantaneous
const audioCache = new Map<string, { audioBase64: string; mimeType: string }>();

let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI();
  }
} catch (err) {
  console.warn('GoogleGenAI initialization warning:', err);
}

/**
 * High-reliability native Urdu speech synthesis via Google Translate audio service.
 * Zero rate limits, zero 429 quota errors, authentic native Urdu pronunciation.
 */
async function fetchGoogleTranslateTts(text: string, lang: string): Promise<{ audioBase64: string; mimeType: string } | null> {
  try {
    const targetLang = lang.startsWith('ur') ? 'ur' : 'en';
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${targetLang}&client=tw-ob`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength < 50) return null;

    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return { audioBase64: base64, mimeType: 'audio/mpeg' };
  } catch {
    return null;
  }
}

/**
 * Secondary fallback to Gemini TTS with strict 429 catch protection
 */
async function fetchGeminiTts(text: string, lang: string, voice?: string): Promise<{ audioBase64: string; mimeType: string } | null> {
  if (!ai) return null;

  try {
    const isUrdu = lang.startsWith('ur') || lang === 'ur-PK';
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: isUrdu
                  ? 'Authentic native Pakistani Urdu accent, clear and direct pronunciation'
                  : 'Clear natural en-US English',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || (isUrdu ? 'Kore' : 'Puck') },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return { audioBase64: base64Audio, mimeType: 'audio/wav' };
    }
  } catch (error: any) {
    // Gracefully handle 429 or quota exhaustion without throwing unhandled errors
    if (error?.status === 'RESOURCE_EXHAUSTED' || error?.code === 429 || error?.message?.includes('429')) {
      console.warn('Gemini TTS quota limit reached, seamlessly falling back to native TTS.');
    }
  }
  return null;
}

// Urdu & English TTS API endpoint with multi-tier quota-resilient architecture
app.post('/api/tts', async (req, res) => {
  try {
    const { text, lang = 'ur-PK', voice = 'Kore' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cleanText = text.trim();
    const cacheKey = `v3:${lang}:${voice}:${cleanText}`;

    // Return from in-memory cache if available
    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      return res.json({ ...cached, cached: true });
    }

    // 1. Primary: Use high-speed native Urdu TTS service (zero quota limit, zero 429 errors)
    let result = await fetchGoogleTranslateTts(cleanText, lang);

    // 2. Secondary fallback: Gemini TTS if Google TTS was unreachable
    if (!result) {
      result = await fetchGeminiTts(cleanText, lang, voice);
    }

    if (result) {
      // Store in memory cache
      if (audioCache.size > 500) {
        const keys = Array.from(audioCache.keys());
        for (let i = 0; i < 150; i++) audioCache.delete(keys[i]);
      }
      audioCache.set(cacheKey, result);

      return res.json(result);
    }

    // If both server synthesis paths fail, inform client to use local browser Web Speech API
    return res.json({ fallbackToClient: true, audioBase64: null });
  } catch (error: any) {
    // Never crash with 500 - let client smoothly fall back to local Web Speech API
    console.warn('TTS request error handled smoothly:', error?.message);
    return res.json({ fallbackToClient: true, audioBase64: null });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// Mount Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bilingual App Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
