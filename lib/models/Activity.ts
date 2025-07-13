import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description: string;
  type: 'game' | 'quiz' | 'lesson' | 'exercise';
  ageRange: {
    min: number;
    max: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  content: {
    questions?: Array<{
      question: string;
      options?: string[];
      correctAnswer?: number;
      explanation?: string;
    }>;
    materials?: string[];
    instructions?: string;
  };
  tags: string[];
  createdBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['game', 'quiz', 'lesson', 'exercise'],
    required: true,
  },
  ageRange: {
    min: {
      type: Number,
      required: true,
      min: 0,
    },
    max: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  content: {
    questions: [{
      question: {
        type: String,
        required: true,
      },
      options: [String],
      correctAnswer: Number,
      explanation: String,
    }],
    materials: [String],
    instructions: String,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema); 