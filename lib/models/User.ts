import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  role: 'parent' | 'child' | 'teacher';
  familyId?: mongoose.Types.ObjectId;
  preferences: {
    age?: number;
    interests?: string[];
    learningLevel?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['parent', 'child', 'teacher'],
    required: true,
  },
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
  },
  preferences: {
    age: {
      type: Number,
      min: 0,
      max: 100,
    },
    interests: [{
      type: String,
      trim: true,
    }],
    learningLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 