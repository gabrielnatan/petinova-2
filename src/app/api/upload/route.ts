import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

// POST /api/upload - Upload de arquivos
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'
    const entityId = formData.get('entityId') as string
    const entityType = formData.get('entityType') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      )
    }

    // Validar tamanho do arquivo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB permitido' },
        { status: 400 }
      )
    }

    // Validar tipo do arquivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido' },
        { status: 400 }
      )
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    
    // Definir caminho do upload baseado na pasta
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
    const filePath = join(uploadDir, uniqueFileName)

    // Criar diretório se não existir
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch {
      // Diretório já existe
    }

    // Salvar arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL pública do arquivo
    const fileUrl = `/uploads/${folder}/${uniqueFileName}`

    // Salvar informações do arquivo no banco (opcional)
    const fileRecord = await saveFileRecord({
      originalName: file.name,
      fileName: uniqueFileName,
      filePath: fileUrl,
      fileSize: file.size,
      fileType: file.type,
      folder,
      entityId,
      entityType,
      userId: user.userId,
      clinicId: user.clinicId
    })

    return NextResponse.json({
      message: 'Arquivo enviado com sucesso',
      file: {
        id: fileRecord?.id,
        originalName: file.name,
        fileName: uniqueFileName,
        url: fileUrl,
        size: file.size,
        type: file.type,
        folder,
        entityId,
        entityType,
        uploadedAt: new Date().toISOString()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/upload - Listar arquivos
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    // const entityId = searchParams.get('entityId')
    // const entityType = searchParams.get('entityType')
    // const folder = searchParams.get('folder')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Se não temos sistema de banco para arquivos, retornar vazio
    // Em uma implementação real, buscaria no banco de dados
    return NextResponse.json({
      files: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    })

  } catch (error) {
    console.error('Erro ao listar arquivos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função auxiliar para salvar registro do arquivo no banco
async function saveFileRecord(data: {
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  folder: string;
  entityId?: string;
  entityType?: string;
  userId: string;
  clinicId: string;
}) {
  // Implementar quando tivermos model de File no Prisma
  // Por ora, apenas retornamos um objeto simulado
  return {
    id: uuidv4(),
    ...data,
    createdAt: new Date()
  }
}

// DELETE /api/upload/[id] - Deletar arquivo
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')
    const folder = searchParams.get('folder') || 'general'

    if (!fileName) {
      return NextResponse.json(
        { error: 'Nome do arquivo não fornecido' },
        { status: 400 }
      )
    }

    // Remover arquivo do sistema de arquivos
    const filePath = join(process.cwd(), 'public', 'uploads', folder, fileName)
    
    try {
      const { unlink } = await import('fs/promises')
      await unlink(filePath)
    } catch (error) {
      console.error('Erro ao remover arquivo:', error)
      // Arquivo pode já ter sido removido, continuar
    }

    // Remover registro do banco (implementar quando necessário)
    
    return NextResponse.json({
      message: 'Arquivo removido com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar arquivo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}