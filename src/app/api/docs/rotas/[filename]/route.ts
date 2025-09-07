import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // Validar o nome do arquivo para evitar path traversal
    if (!filename.match(/^[0-9]{2}-[a-z-]+\.md$/)) {
      return NextResponse.json(
        { error: 'Nome de arquivo inválido' },
        { status: 400 }
      );
    }

    // Caminho para o arquivo na pasta docs/rotas
    const filePath = join(process.cwd(), 'docs', 'rotas', filename);
    
    // Ler o arquivo
    const content = await readFile(filePath, 'utf-8');
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Erro ao ler arquivo:', error);
    return NextResponse.json(
      { error: 'Arquivo não encontrado' },
      { status: 404 }
    );
  }
}
