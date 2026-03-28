/**
 * Pore Generator - Genera poros BLANCOS dentro de crestas NEGRAS
 * Binarización estricta: SOLO blanco y negro, sin grises
 */

const sharp = require('sharp');

/**
 * Agregar poros BLANCOS dentro de crestas NEGRAS
 * Intensidad controla la cantidad de poros
 */
async function addRealisticPores(imageBuffer, poreIntensity = 1.0) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width;
    const height = metadata.height;
    
    // Calcular cantidad de poros
    const imageArea = width * height;
    const basePoreCount = Math.max(300, Math.floor(imageArea / 200)); // Base muy densa
    const poreCount = Math.floor(basePoreCount * poreIntensity);
    
    console.log(`[PORE-GENERATOR] Generando ${poreCount} poros blancos (intensidad: ${poreIntensity}x)`);
    
    // Crear SVG con poros BLANCOS irregulares
    let svgPores = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    for (let i = 0; i < poreCount; i++) {
      // Posición aleatoria
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      // Tamaño variable pero PEQUEÑO (0.5-3 píxeles)
      const sizeRand = Math.random();
      let size;
      if (sizeRand < 0.6) {
        size = Math.random() * 0.8 + 0.5; // Pequeños: 0.5-1.3
      } else if (sizeRand < 0.85) {
        size = Math.random() * 0.8 + 1.3; // Medianos: 1.3-2.1
      } else {
        size = Math.random() * 0.9 + 2.1; // Grandes: 2.1-3.0
      }
      
      // Forma IRREGULAR (no círculos perfectos)
      // Usar polígonos irregulares para simular poros reales
      const points = generateIrregularPore(x, y, size);
      svgPores += `<polygon points="${points}" fill="white" />`;
    }
    
    svgPores += '</svg>';
    
    // Convertir SVG a buffer
    const svgBuffer = Buffer.from(svgPores);
    
    // Aplicar poros a la imagen
    const result = await sharp(imageBuffer)
      .composite([
        {
          input: svgBuffer,
          blend: 'over'
        }
      ])
      .toBuffer();
    
    // BINARIZAR: Convertir a SOLO blanco y negro, sin grises
    const binarized = await sharp(result)
      .grayscale()
      .threshold(128) // Threshold en 128: < 128 = negro, >= 128 = blanco
      .toBuffer();
    
    return binarized;
  } catch (error) {
    console.warn('Advertencia al agregar poros:', error.message);
    return imageBuffer;
  }
}

/**
 * Generar forma IRREGULAR para poro (no círculo perfecto)
 */
function generateIrregularPore(centerX, centerY, baseSize) {
  const numPoints = Math.floor(Math.random() * 3) + 4; // 4-6 puntos para forma irregular
  const points = [];
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    // Variar el radio para cada punto (forma irregular)
    const radiusVariation = 0.5 + Math.random() * 0.5;
    const radius = baseSize * radiusVariation;
    
    const px = centerX + Math.cos(angle) * radius;
    const py = centerY + Math.sin(angle) * radius;
    
    points.push(`${px},${py}`);
  }
  
  return points.join(' ');
}

/**
 * Agregar poros con distribución natural ultra densa
 */
async function addNaturalPores(imageBuffer, poreIntensity = 'medium') {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width;
    const height = metadata.height;
    
    // Convertir intensidad a multiplicador
    let intensityMultiplier = 1.0;
    if (typeof poreIntensity === 'number') {
      intensityMultiplier = poreIntensity;
    } else if (poreIntensity === 'high') {
      intensityMultiplier = 2.0;
    } else if (poreIntensity === 'low') {
      intensityMultiplier = 0.5;
    }
    
    console.log(`[NATURAL-PORES] Intensidad: ${intensityMultiplier}x`);
    
    // Densidad de poros - EXTREMADAMENTE ALTA
    let basePoreCount = Math.floor((width * height) / 180); // 1 poro cada 180 píxeles
    const poreCount = Math.floor(basePoreCount * intensityMultiplier);
    
    console.log(`[NATURAL-PORES] Generando ${poreCount} poros naturales blancos`);
    
    // Generar SVG con poros BLANCOS distribuidos naturalmente
    let svgPores = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Crear clusters de poros para distribución realista
    const clusterCount = Math.floor(poreCount / 25);
    
    for (let c = 0; c < clusterCount; c++) {
      // Centro del cluster aleatorio
      const clusterX = Math.random() * width;
      const clusterY = Math.random() * height;
      const clusterRadius = Math.random() * 50 + 10;
      
      // Poros dentro del cluster
      const poresPerCluster = Math.floor(Math.random() * 40) + 10;
      
      for (let p = 0; p < poresPerCluster; p++) {
        // Distribución dentro del cluster
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * clusterRadius;
        
        const x = clusterX + Math.cos(angle) * distance;
        const y = clusterY + Math.sin(angle) * distance;
        
        // Asegurar que está dentro de los límites
        if (x < 0 || x > width || y < 0 || y > height) continue;
        
        // Tamaño variable
        const sizeRand = Math.random();
        let size;
        if (sizeRand < 0.5) {
          size = Math.random() * 0.7 + 0.4; // Pequeños
        } else if (sizeRand < 0.8) {
          size = Math.random() * 0.8 + 1.1; // Medianos
        } else {
          size = Math.random() * 1.0 + 1.9; // Grandes
        }
        
        // Forma irregular
        const points = generateIrregularPore(x, y, size);
        svgPores += `<polygon points="${points}" fill="white" />`;
      }
    }
    
    // Agregar poros dispersos adicionales
    const dispersePores = Math.floor(poreCount * 0.3);
    for (let i = 0; i < dispersePores; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      const size = Math.random() * 2.0 + 0.4;
      const points = generateIrregularPore(x, y, size);
      svgPores += `<polygon points="${points}" fill="white" />`;
    }
    
    svgPores += '</svg>';
    
    // Convertir SVG a buffer
    const svgBuffer = Buffer.from(svgPores);
    
    // Aplicar poros
    const result = await sharp(imageBuffer)
      .composite([
        {
          input: svgBuffer,
          blend: 'over'
        }
      ])
      .toBuffer();
    
    // BINARIZAR: SOLO blanco y negro
    const binarized = await sharp(result)
      .grayscale()
      .threshold(128)
      .toBuffer();
    
    return binarized;
  } catch (error) {
    console.warn('Advertencia al agregar poros naturales:', error.message);
    return imageBuffer;
  }
}

/**
 * Parsear prompt para detectar solicitudes de poros
 */
function parsePromptForPoreIntensity(prompt) {
  if (!prompt) return 1.0;
  
  const lowerPrompt = prompt.toLowerCase();
  
  // Detectar palabras clave para MÁS poros
  if (lowerPrompt.includes('mas poros') || lowerPrompt.includes('más poros') || 
      lowerPrompt.includes('many pores') || lowerPrompt.includes('increase pores') ||
      lowerPrompt.includes('poros densos') || lowerPrompt.includes('poros abundantes') ||
      lowerPrompt.includes('more pores')) {
    return 2.5;
  }
  
  if (lowerPrompt.includes('mucho mas poros') || lowerPrompt.includes('muchísimos poros') ||
      lowerPrompt.includes('extreme pores') || lowerPrompt.includes('ultra pores') ||
      lowerPrompt.includes('many more pores') || lowerPrompt.includes('poros extremos')) {
    return 4.0;
  }
  
  if (lowerPrompt.includes('menos poros') || lowerPrompt.includes('fewer pores') ||
      lowerPrompt.includes('reduce pores') || lowerPrompt.includes('less pores')) {
    return 0.5;
  }
  
  if (lowerPrompt.includes('poros minimos') || lowerPrompt.includes('minimal pores') ||
      lowerPrompt.includes('very few pores')) {
    return 0.2;
  }
  
  // Detectar números explícitos
  const percentMatch = prompt.match(/(\d+)%/);
  if (percentMatch) {
    const multiplier = parseInt(percentMatch[1]) / 100;
    if (multiplier > 0 && multiplier <= 5) {
      return multiplier;
    }
  }
  
  // Detectar multiplicadores
  const multiMatch = prompt.match(/(\d+(?:\.\d+)?)\s*x/i);
  if (multiMatch) {
    const multiplier = parseFloat(multiMatch[1]);
    if (multiplier > 0 && multiplier <= 5) {
      return multiplier;
    }
  }
  
  return 1.0;
}

/**
 * Generar número aleatorio con distribución gaussiana
 */
function gaussianRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

module.exports = {
  addRealisticPores,
  addNaturalPores,
  gaussianRandom,
  parsePromptForPoreIntensity
};
