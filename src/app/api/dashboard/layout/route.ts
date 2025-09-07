import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const dashboardLayout = await prisma.dashboardLayout.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      layout: dashboardLayout?.layout || null,
    });
  } catch (error) {
    console.error('Erro ao buscar layout do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { layout } = await request.json();

    if (!layout) {
      return NextResponse.json(
        { error: 'Layout é obrigatório' },
        { status: 400 }
      );
    }

    const dashboardLayout = await prisma.dashboardLayout.upsert({
      where: { userId },
      update: { layout },
      create: {
        userId,
        layout,
      },
    });

    return NextResponse.json({
      success: true,
      layout: dashboardLayout.layout,
    });
  } catch (error) {
    console.error('Erro ao salvar layout do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
