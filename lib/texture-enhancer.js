/**
 * Texture Enhancer - Mejora Profesional Forense
 * Crestas negras sólidas sobre fondo blanco limpio con textura granular y poros
 */

const sharp = require('sharp');
const { addRealisticPores, addNaturalPores } = require('./pore-generator');

/**
 * MODO ESTÁNDAR - Mejora profesional
 */
async function enhanceFingerprint(imageBuffer) {
  try {
    // Paso 1: Convertir a escala de grises
    let enhanced = await sharp(imageBuffer)
      .grayscale()
      .toBuffer();
    
    // Paso 2: Normalización adaptativa
    enhanced = await sharp(enhanced)
      .normalize()
      .toBuffer();
    
    // Paso 3: Realce de crestas con sharpening
    enhanced = await sharp(enhanced)
      .sharpen({
        sigma: 2.0,
        m1: 0.7,
        m2: 1.3,
        x1: 5.0,
        y2: 15.0,
        y3: 25.0
      })
      .toBuffer();
    
    // Paso 4: Gamma correction
    enhanced = await sharp(enhanced)
      .modulate({
        brightness: 1.15,
        saturation: 1.0,
        hue: 0
      })
      .toBuffer();
    
    // Paso 5: Threshold para binarización limpia
    enhanced = await sharp(enhanced)
      .threshold(120)
      .toBuffer();
    
    // Paso 6: Invertir colores (fondo blanco, crestas negras)
    enhanced = await sharp(enhanced)
      .negate()
      .toBuffer();
    
    // Paso 7: Normalización final
    enhanced = await sharp(enhanced)
      .normalize()
      .toBuffer();
    
    // Paso 8: Agregar poros irregulares
    enhanced = await addRealisticPores(enhanced);
    
    return enhanced;
  } catch (error) {
    throw new Error(`Error mejorando textura: ${error.message}`)
  }
}

/**
 * MODO PRESERVAR - Máxima fidelidad
 */
async function preserveAndEnhance(imageBuffer) {
  try {
    // Convertir a escala de grises
    let enhanced = await sharp(imageBuffer)
      .grayscale()
      .normalize()
      .toBuffer();
    
    // Sharpening ligero
    enhanced = await sharp(enhanced)
      .sharpen({ 
        sigma: 1.2,
        m1: 0.4,
        m2: 0.9
      })
      .toBuffer();
    
    // Mejora de contraste mínima
    enhanced = await sharp(enhanced)
      .modulate({ 
        brightness: 1.08,
        saturation: 1.0
      })
      .toBuffer();
    
    // Threshold suave
    enhanced = await sharp(enhanced)
      .threshold(135)
      .toBuffer();
      // Invertir para fondo blanco
    enhanced = await sharp(enhanced)
      .negate()
      .toBuffer();
    
    // Agregar poros irregulares
    enhanced = await addRealisticPores(enhanced);
    
    return enhanced;
  } catch (error) {
    throw new Error(`Error en mejora con textura: ${error.message}`)}
}

/**
 * MODO TEXTURA - Granularidad visible profesional
 */
async function enhanceWithTexture(imageBuffer) {
  try {
    // Paso 1: Convertir a escala de grises
    let enhanced = await sharp(imageBuffer)
      .grayscale()
      .toBuffer();
    
    // Paso 2: Normalización
    enhanced = await sharp(enhanced)
      .normalize()
      .toBuffer();
    
    // Paso 3: Realce de crestas
    enhanced = await sharp(enhanced)
      .sharpen({ 
        sigma: 2.3,
        m1: 0.8,
        m2: 1.4,
        x1: 5.5,
        y2: 16.0,
        y3: 28.0
      })
      .toBuffer();
    
    // Paso 4: Gamma correction
    enhanced = await sharp(enhanced)
      .modulate({
        brightness: 1.18,
        saturation: 1.0,
        hue: 0
      })
      .toBuffer();
    
    // Paso 5: Threshold
    enhanced = await sharp(enhanced)
      .threshold(110)
      .toBuffer();
    
    // Paso 6: Median para textura granular
    enhanced = await sharp(enhanced)
      .median(2)
      .toBuffer();
    
    // Paso 7: Invertir para fondo blanco
    enhanced = await sharp(enhanced)
      .negate()
      .toBuffer();
    
    // Paso 8: Normalización
    enhanced = await sharp(enhanced)
      .normalize()
      .toBuffer();
    
    return enhanced;
  } catch (error) {
    throw new Error(`Error en mejora con textura: ${error.message}`);
  }
}

/**
 * MODO RELLENO - Crestas sólidas negras sobre fondo blanco
 */
async function fillRidgesBlack(imageBuffer) {
  try {
    // Paso 1: Convertir a escala de grises
    let processed = await sharp(imageBuffer)
      .grayscale()
      .toBuffer();
    
    // Paso 2: Normalización
    processed = await sharp(processed)
      .normalize()
      .toBuffer();
    
    // Paso 3: Sharpening
    processed = await sharp(processed)
      .sharpen({
        sigma: 2.0,
        m1: 0.7,
        m2: 1.3
      })
      .toBuffer();
    
    // Paso 4: Binarización profesional
    processed = await sharp(processed)
      .threshold(100)
      .toBuffer();
    
    // Paso 5: Median para conectar crestas
    processed = await sharp(processed)
      .median(2)
      .toBuffer();
    
    // Paso 6: Invertir para fondo blanco
    processed = await sharp(processed)
      .negate()
      .toBuffer();
    
    // Paso 7: Normalización
    processed = await sharp(processed)
      .normalize()
      .toBuffer();
    
    // Paso 8: Agregar poros
    processed = await addRealisticPores(processed);
    
    return processed;
  } catch (error) {
    throw new Error(`Error en relleno de crestas: ${error.message}`)
  }
}

/**
 * MODO FORENSE - Procesamiento profesional multi-etapa
 */
async function forensicEnhance(imageBuffer) {
  try {
    // Paso 1: Conversión a escala de grises
    let processed = await sharp(imageBuffer)
      .grayscale()
      .toBuffer();
    
    // Paso 2: Normalización
    processed = await sharp(processed)
      .normalize()
      .toBuffer();
    
    // Paso 3: Sharpening profesional
    processed = await sharp(processed)
      .sharpen({
        sigma: 2.2,
        m1: 0.8,
        m2: 1.4,
        x1: 5.5,
        y2: 16.0,
        y3: 28.0
      })
      .toBuffer();
    
    // Paso 4: Mejora de contraste
    processed = await sharp(processed)
      .modulate({
        brightness: 1.16,
        saturation: 1.0
      })
      .toBuffer();
    
    // Paso 5: Median filter
    processed = await sharp(processed)
      .median(2)
      .toBuffer();
    
    // Paso 6: Binarización
    processed = await sharp(processed)
      .threshold(115)
      .toBuffer();
    
    // Paso 7: Invertir para fondo blanco
    processed = await sharp(processed)
      .negate()
      .toBuffer();
    
    // Paso 8: Normalización
    processed = await sharp(processed)
      .normalize()
      .toBuffer();
    
    // Paso 9: Agregar poros irregulares
    processed = await addRealisticPores(processed);
    
    return processed;
  } catch (error) {
    throw new Error(`Error en procesamiento forense: ${error.message}`)
  }
}

/**
 * MODO ULTRA PROFESIONAL - Textura granular realista
 */
async function ultraProfessionalEnhance(imageBuffer) {
  try {
    // Paso 1: Conversión a escala de grises
    let enhanced = await sharp(imageBuffer)
      .grayscale()
      .toBuffer();
    
    // Paso 2: Normalización
    enhanced = await sharp(enhanced)
      .normalize()
      .toBuffer();
    
    // Paso 3: Sharpening ultra fuerte
    enhanced = await sharp(enhanced)
      .sharpen({
        sigma: 2.6,
        m1: 0.9,
        m2: 1.6,
        x1: 6.0,
        y2: 18.0,
        y3: 32.0
      })
      .toBuffer();
    
    // Paso 4: Contraste máximo
    enhanced = await sharp(enhanced)
      .modulate({
        brightness: 1.22,
        saturation: 1.0
      })
      .toBuffer();
    
    // Paso 5: Threshold agresivo
    enhanced = await sharp(enhanced)
      .threshold(105)
      .toBuffer();
    
    // Paso 6: Granularidad visible
    enhanced = await sharp(enhanced)
      .median(3)
      .toBuffer();
    
    // Paso 7: Invertir para fondo blanco limpio
    enhanced = await sharp(enhanced)
      .negate()
      .toBuffer();
    
    // Paso 8: Normalización final
    enhanced = await sharp(enhanced)
      .normalize()
      .toBuffer();
    
    // Paso 9: Agregar poros irregulares realistas
    enhanced = await addNaturalPores(enhanced, 'high');
    
    return enhanced;
  } catch (error) {
    throw new Error(`Error en procesamiento ultra profesional: ${error.message}`);
  }
}

/**
 * Generar prompt dinámico
 */
function generateDynamicPrompt(analysis) {
  const {
    ridgeDensity,
    ridgeOrientation,
    pattern,
    bifurcations,
    terminations,
    poreSize,
    poreCount,
    textureGranularity
  } = analysis;
  
  return `Professional Forensic Fingerprint:
Pattern: ${pattern}
Ridge Density: ${ridgeDensity}%
Orientation: ${ridgeOrientation}
Bifurcations: ${bifurcations}
Terminations: ${terminations}
Pores: ${poreCount} (${poreSize}px avg)
Granularity: ${textureGranularity.granularity}%

OUTPUT: Black ridges on white background with realistic granular texture`;
}

module.exports = {
  enhanceFingerprint,
  preserveAndEnhance,
  enhanceWithTexture,
  fillRidgesBlack,
  forensicEnhance,
  ultraProfessionalEnhance,
  generateDynamicPrompt
};
