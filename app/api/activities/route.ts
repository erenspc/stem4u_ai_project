import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Activity from '@/lib/models/Activity';

// GET /api/activities - Aktiviteleri getir (filtreleme ile)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    // Filtreleme parametreleri
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');
    const age = searchParams.get('age');
    const tags = searchParams.get('tags');
    
    let query: any = { isActive: true };
    
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (age) {
      const ageNum = parseInt(age);
      query['ageRange.min'] = { $lte: ageNum };
      query['ageRange.max'] = { $gte: ageNum };
    }
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    const activities = await Activity.find(query)
      .populate('createdBy', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Yeni aktivite oluştur
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const {
      title,
      description,
      type,
      ageRange,
      difficulty,
      content,
      tags,
      createdBy
    } = body;
    
    const activity = new Activity({
      title,
      description,
      type,
      ageRange,
      difficulty,
      content: content || {},
      tags: tags || [],
      createdBy,
    });
    
    await activity.save();
    
    const populatedActivity = await Activity.findById(activity._id)
      .populate('createdBy', 'name email')
      .select('-__v');
    
    return NextResponse.json(populatedActivity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
} 