import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'

interface ImageOptimizationOptions {
  quality?: number
  format?: 'jpeg' | 'png' | 'webp' | 'avif'
  width?: number
  height?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  blur?: number
  sharpen?: boolean
}

interface OptimizedImageInfo {
  originalSize: number
  optimizedSize: number
  format: string
  width: number
  height: number
  compressionRatio: number
  path: string
}

class ImageOptimizer {
  private static instance: ImageOptimizer
  private cache = new Map<string, OptimizedImageInfo>()

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer()
    }
    return ImageOptimizer.instance
  }

  async optimizeImage(
    inputPath: string,
    outputPath: string,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageInfo> {
    try {
      const {
        quality = 80,
        format = 'webp',
        width,
        height,
        fit = 'inside',
        blur = 0,
        sharpen = false
      } = options

      // Verificar se já existe versão otimizada
      const cacheKey = `${inputPath}-${JSON.stringify(options)}`
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!
      }

      // Ler arquivo original
      const originalBuffer = await fs.readFile(inputPath)
      const originalStats = await fs.stat(inputPath)
      const originalSize = originalStats.size

      // Obter informações da imagem original
      const originalImage = sharp(originalBuffer)
      const originalMetadata = await originalImage.metadata()

      // Configurar pipeline de otimização
      let pipeline = originalImage

      // Redimensionar se especificado
      if (width || height) {
        pipeline = pipeline.resize(width, height, { fit })
      }

      // Aplicar blur se especificado
      if (blur > 0) {
        pipeline = pipeline.blur(blur)
      }

      // Aplicar sharpening se especificado
      if (sharpen) {
        pipeline = pipeline.sharpen()
      }

      // Otimizar baseado no formato
      let optimizedBuffer: Buffer
      let finalFormat: string

      switch (format) {
        case 'webp':
          optimizedBuffer = await pipeline.webp({ quality }).toBuffer()
          finalFormat = 'webp'
          break
        case 'avif':
          optimizedBuffer = await pipeline.avif({ quality }).toBuffer()
          finalFormat = 'avif'
          break
        case 'jpeg':
          optimizedBuffer = await pipeline.jpeg({ quality }).toBuffer()
          finalFormat = 'jpeg'
          break
        case 'png':
          optimizedBuffer = await pipeline.png({ quality }).toBuffer()
          finalFormat = 'png'
          break
        default:
          optimizedBuffer = await pipeline.webp({ quality }).toBuffer()
          finalFormat = 'webp'
      }

      // Salvar arquivo otimizado
      await fs.writeFile(outputPath, optimizedBuffer)

      // Obter informações da imagem otimizada
      const optimizedImage = sharp(optimizedBuffer)
      const optimizedMetadata = await optimizedImage.metadata()

      const optimizedSize = optimizedBuffer.length
      const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100

      const result: OptimizedImageInfo = {
        originalSize,
        optimizedSize,
        format: finalFormat,
        width: optimizedMetadata.width || 0,
        height: optimizedMetadata.height || 0,
        compressionRatio,
        path: outputPath
      }

      // Cache do resultado
      this.cache.set(cacheKey, result)

      return result

    } catch (error) {
      console.error('Erro ao otimizar imagem:', error)
      throw new Error(`Falha na otimização da imagem: ${error}`)
    }
  }

  async generateResponsiveImages(
    inputPath: string,
    outputDir: string,
    sizes: number[] = [320, 640, 1024, 1920]
  ): Promise<OptimizedImageInfo[]> {
    try {
      const results: OptimizedImageInfo[] = []

      for (const size of sizes) {
        const outputPath = path.join(
          outputDir,
          `${path.basename(inputPath, path.extname(inputPath))}-${size}.webp`
        )

        const result = await this.optimizeImage(inputPath, outputPath, {
          width: size,
          format: 'webp',
          quality: 80
        })

        results.push(result)
      }

      return results

    } catch (error) {
      console.error('Erro ao gerar imagens responsivas:', error)
      throw new Error(`Falha na geração de imagens responsivas: ${error}`)
    }
  }

  async generateThumbnail(
    inputPath: string,
    outputPath: string,
    size: number = 150
  ): Promise<OptimizedImageInfo> {
    return this.optimizeImage(inputPath, outputPath, {
      width: size,
      height: size,
      fit: 'cover',
      format: 'webp',
      quality: 70
    })
  }

  async generatePlaceholder(
    inputPath: string,
    outputPath: string,
    width: number = 20,
    height: number = 20,
    blur: number = 10
  ): Promise<OptimizedImageInfo> {
    return this.optimizeImage(inputPath, outputPath, {
      width,
      height,
      blur,
      format: 'webp',
      quality: 30
    })
  }

  async getImageInfo(imagePath: string): Promise<{
    width: number
    height: number
    format: string
    size: number
    aspectRatio: number
  }> {
    try {
      const buffer = await fs.readFile(imagePath)
      const image = sharp(buffer)
      const metadata = await image.metadata()
      const stats = await fs.stat(imagePath)

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: stats.size,
        aspectRatio: (metadata.width || 1) / (metadata.height || 1)
      }

    } catch (error) {
      console.error('Erro ao obter informações da imagem:', error)
      throw new Error(`Falha ao obter informações da imagem: ${error}`)
    }
  }

  async convertFormat(
    inputPath: string,
    outputPath: string,
    format: 'jpeg' | 'png' | 'webp' | 'avif'
  ): Promise<OptimizedImageInfo> {
    return this.optimizeImage(inputPath, outputPath, { format })
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats(): {
    size: number
    keys: string[]
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Função helper para otimização automática
export async function optimizeImageFile(
  inputPath: string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageInfo> {
  const optimizer = ImageOptimizer.getInstance()
  const outputPath = inputPath.replace(/\.[^.]+$/, '.optimized.webp')
  
  return optimizer.optimizeImage(inputPath, outputPath, options)
}

// Função helper para imagens responsivas
export async function generateResponsiveImageSet(
  inputPath: string,
  outputDir: string
): Promise<OptimizedImageInfo[]> {
  const optimizer = ImageOptimizer.getInstance()
  return optimizer.generateResponsiveImages(inputPath, outputDir)
}

// Função helper para thumbnails
export async function generateThumbnail(
  inputPath: string,
  size: number = 150
): Promise<OptimizedImageInfo> {
  const optimizer = ImageOptimizer.getInstance()
  const outputPath = inputPath.replace(/\.[^.]+$/, `.thumb-${size}.webp`)
  
  return optimizer.generateThumbnail(inputPath, outputPath, size)
}

// Função helper para placeholders
export async function generatePlaceholder(
  inputPath: string,
  width: number = 20,
  height: number = 20
): Promise<OptimizedImageInfo> {
  const optimizer = ImageOptimizer.getInstance()
  const outputPath = inputPath.replace(/\.[^.]+$/, '.placeholder.webp')
  
  return optimizer.generatePlaceholder(inputPath, outputPath, width, height)
}

export { ImageOptimizer }
