import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { ImageOptimizer } from '@/lib/image-optimization'
import { promises as fs } from 'fs'
import path from 'path'

// POST /api/optimize-images - Otimizar imagem
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas ADMIN pode otimizar imagens
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    const options = JSON.parse(formData.get('options') as string || '{}')

    if (!file) {
      return NextResponse.json({ error: 'Nenhuma imagem fornecida' }, { status: 400 })
    }

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Arquivo deve ser uma imagem' }, { status: 400 })
    }

    // Criar diretório temporário
    const tempDir = path.join(process.cwd(), 'temp', 'images')
    await fs.mkdir(tempDir, { recursive: true })

    // Salvar arquivo temporário
    const buffer = Buffer.from(await file.arrayBuffer())
    const inputPath = path.join(tempDir, `input-${Date.now()}-${file.name}`)
    await fs.writeFile(inputPath, buffer)

    // Otimizar imagem
    const optimizer = ImageOptimizer.getInstance()
    const outputPath = path.join(tempDir, `optimized-${Date.now()}-${file.name}`)
    
    const result = await optimizer.optimizeImage(inputPath, outputPath, options)

    // Ler arquivo otimizado
    const optimizedBuffer = await fs.readFile(outputPath)

    // Limpar arquivos temporários
    await fs.unlink(inputPath)
    await fs.unlink(outputPath)

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        path: undefined // Não retornar path do servidor
      },
      message: `Imagem otimizada com sucesso. Redução de ${result.compressionRatio.toFixed(2)}%`
    })

  } catch (error) {
    console.error('Erro ao otimizar imagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/optimize-images - Listar imagens otimizadas
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas ADMIN pode ver imagens otimizadas
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const optimizer = ImageOptimizer.getInstance()
    const cacheStats = optimizer.getCacheStats()

    return NextResponse.json({
      cacheStats,
      message: 'Estatísticas do cache de otimização'
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
