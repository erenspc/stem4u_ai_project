import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// GET /api/users - Tüm kullanıcıları getir
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}).select('-__v');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Yeni kullanıcı oluştur
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { email, name, role, preferences } = body;
    
    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    const user = new User({
      email,
      name,
      role,
      preferences: preferences || {},
    });
    
    await user.save();
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 