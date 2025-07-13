import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ 
      message: 'MongoDB bağlantısı başarılı!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    return NextResponse.json(
      { error: 'MongoDB bağlantısı başarısız' },
      { status: 500 }
    );
  }
} 