import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Family from '@/lib/models/Family';

// GET /api/families - Tüm aileleri getir
export async function GET() {
  try {
    await connectDB();
    const families = await Family.find({})
      .populate('members', 'name email role')
      .select('-__v');
    return NextResponse.json(families);
  } catch (error) {
    console.error('Error fetching families:', error);
    return NextResponse.json(
      { error: 'Failed to fetch families' },
      { status: 500 }
    );
  }
}

// POST /api/families - Yeni aile oluştur
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { name, members, settings } = body;
    
    const family = new Family({
      name,
      members: members || [],
      settings: settings || {
        privacy: 'private',
        notifications: true
      }
    });
    
    await family.save();
    
    const populatedFamily = await Family.findById(family._id)
      .populate('members', 'name email role')
      .select('-__v');
    
    return NextResponse.json(populatedFamily, { status: 201 });
  } catch (error) {
    console.error('Error creating family:', error);
    return NextResponse.json(
      { error: 'Failed to create family' },
      { status: 500 }
    );
  }
} 