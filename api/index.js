import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar funciones del código original
import { analyzeRidges } from '../lib/ridge-analyzer.js';
import { enhanceFingerprint, preserveAndEnhance, enhanceWithTexture, fillRidgesBlack, forensicEnhance, ultraProfessionalEnhance } from '../lib/texture-enhancer.js';
import { parsePromptForPoreIntensity } from '../lib/pore-generator.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

export default async function handler(req, res) {
  try {
    console.log('[HANDLER] Request:', req.method, req.url);

    // Procesar según la ruta
    if (req.url === '/' && req.method === 'GET') {
      return res.status(200).sendFile(path.join(__dirname, '../public/index.html'));
    }

    if (req.url === '/api/health' && req.method === 'GET') {
      return res.json({ status: 'ok', version: '1.0.0' });
    }

    if (req.url === '/api/process' && req.method === 'POST') {
      console.log('[PROCESS] Starting...');
      console.log('[PROCESS] Body type:', typeof req.body);
      console.log('[PROCESS] Body length:', req.body?.length);

      if (!req.body || req.body.length === 0) {
        return res.status(400).json({ error: 'No image data' });
      }

      try {
        // Analizar
        console.log('[PROCESS] Analyzing...');
        const analysis = await analyzeRidges(req.body);
        console.log('[PROCESS] Analysis done:', analysis);

        // Mejorar
        console.log('[PROCESS] Enhancing...');
        const mode = req.query.mode || 'standard';
        let enhanced;

        switch (mode) {
          case 'preserve':
            enhanced = await preserveAndEnhance(req.body);
            break;
          case 'texture':
            enhanced = await enhanceWithTexture(req.body);
            break;
          case 'fill':
            enhanced = await fillRidgesBlack(req.body);
            break;
          case 'forensic':
            enhanced = await forensicEnhance(req.body);
            break;
          case 'ultra':
            enhanced = await ultraProfessionalEnhance(req.body);
            break;
          default:
            enhanced = await enhanceFingerprint(req.body);
        }

        console.log('[PROCESS] Enhanced type:', typeof enhanced);
        console.log('[PROCESS] Enhanced length:', enhanced?.length);

        if (!enhanced || enhanced.length === 0) {
          return res.status(400).json({ error: 'Invalid enhanced buffer' });
        }

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename="fingerprint-processed.png"');
        res.send(enhanced);

      } catch (processError) {
        console.error('[PROCESS] Processing error:', processError.message);
        console.error('[PROCESS] Stack:', processError.stack);
        return res.status(500).json({ error: processError.message });
      }
    }

    res.status(404).json({ error: 'Not found' });

  } catch (err) {
    console.error('[HANDLER] REAL ERROR:', err.message);
    console.error('[HANDLER] Stack:', err.stack);
    console.error('[HANDLER] Type:', err.constructor.name);

    res.status(500).json({
      error: err.message,
      type: err.constructor.name,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}
