/**
 * Real Pore Detector - Detecta poros REALES de la imagen
 * Basado en análisis de características de imagen, no generación sintética
 */

const sharp = require('sharp');

/**
 * Detectar poros REALES en la imagen
 * Los poros aparecen como depresiones (áreas más claras) en las crestas (áreas oscuras)
 */
async function detectRealPores(imageBuffer) {
  try {
    // Obtener metadata
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width;
    const height = metadata.height;
    
    // Convertir a escala de grises y obtener datos de píxeles
    const greyBuffer = await sharp(imageBuffer)
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const data = greyBuffer.data;
    const channels = greyBuffer.info.channels;
    
    // Detectar poros: buscar píxeles claros rodeados de píxeles oscuros
    const pores = [];
    const visited = new Set();
    
    for (let i = 0; i < data.length; i += channels) {
      const pixelIndex = i / channels;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);
      
      // Saltar si ya fue visitado
      if (visited.has(pixelIndex)) continue;
      
      const pixelValue = data[i];
      
      // Buscar píxeles claros (potenciales poros)
      if (pixelValue > 180) {
        // Verificar si está rodeado de píxeles oscuros
        let darkNeighbors = 0;
        const neighbors = getNeighbors(x, y, width, height, 3);
        
        for (const neighbor of neighbors) {
          const neighborIndex = neighbor.y * width + neighbor.x;
          const neighborValue = data[neighborIndex * channels];
          if (neighborValue < 100) {
            darkNeighbors++;
          }
        }
        
        // Si tiene suficientes vecinos oscuros, es un poro
        if (darkNeighbors > 4) {
          // Usar BFS para obtener el tamaño del poro
          const porePixels = bfsCluster(x, y, width, height, data, channels, visited);
          
          if (porePixels.length > 2 && porePixels.length < 500) {
            const centroid = calculateCentroid(porePixels);
            const size = Math.sqrt(porePixels.length);
            
            pores.push({
              x: centroid.x,
              y: centroid.y,
              size: size,
              pixelCount: porePixels.length
            });
          }
        }
      }
    }
    
    console.log(`[REAL-PORE-DETECTOR] Detectados ${pores.length} poros reales`);
    
    return {
      pores: pores,
      count: pores.length,
      averageSize: pores.length > 0 ? pores.reduce((sum, p) => sum + p.size, 0) / pores.length : 0
    };
  } catch (error) {
    console.error('Error detectando poros reales:', error.message);
    return { pores: [], count: 0, averageSize: 0 };
  }
}

/**
 * Realzar poros REALES detectados
 */
async function enhanceRealPores(imageBuffer, poreIntensity = 1.0) {
  try {
    // Detectar poros reales
    const poreData = await detectRealPores(imageBuffer);
    
    if (poreData.count === 0) {
      console.log('[ENHANCE-REAL-PORES] No se detectaron poros, retornando imagen original');
      return imageBuffer;
    }
    
    console.log(`[ENHANCE-REAL-PORES] Realzando ${poreData.count} poros con intensidad ${poreIntensity}x`);
    
    // Crear SVG para realzar poros
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width;
    const height = metadata.height;
    
    let svgEnhance = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Para cada poro detectado, crear un círculo de realce
    for (const pore of poreData.pores) {
      const enhancedSize = pore.size * (0.8 + poreIntensity * 0.3);
      const opacity = Math.min(0.8, 0.3 + poreIntensity * 0.2);
      
      // Círculo de realce blanco (poro)
      svgEnhance += `<circle cx="${pore.x}" cy="${pore.y}" r="${enhancedSize}" fill="white" opacity="${opacity}" />`;
      
      // Borde oscuro para definición
      svgEnhance += `<circle cx="${pore.x}" cy="${pore.y}" r="${enhancedSize}" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="0.5" />`;
    }
    
    svgEnhance += '</svg>';
    
    // Aplicar realce
    const svgBuffer = Buffer.from(svgEnhance);
    const enhanced = await sharp(imageBuffer)
      .composite([
        {
          input: svgBuffer,
          blend: 'overlay'
        }
      ])
      .toBuffer();
    
    return enhanced;
  } catch (error) {
    console.error('Error realzando poros reales:', error.message);
    return imageBuffer;
  }
}

/**
 * Obtener vecinos de un píxel
 */
function getNeighbors(x, y, width, height, radius = 1) {
  const neighbors = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        neighbors.push({ x: nx, y: ny });
      }
    }
  }
  return neighbors;
}

/**
 * BFS para agrupar píxeles conectados (cluster de poro)
 */
function bfsCluster(startX, startY, width, height, data, channels, visited) {
  const cluster = [];
  const queue = [[startX, startY]];
  const localVisited = new Set([`${startX},${startY}`]);
  
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const pixelIndex = y * width + x;
    
    if (pixelIndex < 0 || pixelIndex * channels >= data.length) continue;
    
    const pixelValue = data[pixelIndex * channels];
    
    // Agregar si es claro (parte del poro)
    if (pixelValue > 150) {
      cluster.push({ x, y });
      visited.add(pixelIndex);
      
      // Agregar vecinos a la cola
      const neighbors = getNeighbors(x, y, width, height, 1);
      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (!localVisited.has(key)) {
          localVisited.add(key);
          queue.push([neighbor.x, neighbor.y]);
        }
      }
    }
  }
  
  return cluster;
}

/**
 * Calcular centroide de un cluster
 */
function calculateCentroid(pixels) {
  if (pixels.length === 0) return { x: 0, y: 0 };
  
  const sumX = pixels.reduce((sum, p) => sum + p.x, 0);
  const sumY = pixels.reduce((sum, p) => sum + p.y, 0);
  
  return {
    x: sumX / pixels.length,
    y: sumY / pixels.length
  };
}

module.exports = {
  detectRealPores,
  enhanceRealPores
};
