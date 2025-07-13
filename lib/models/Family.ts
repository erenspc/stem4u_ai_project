import mongoose, { Schema, Document } from 'mongoose';

export interface IFamily extends Document {
  name: string;
  members: mongoose.Types.ObjectId[];
  settings: {
    privacy: 'public' | 'private';
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FamilySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  settings: {
    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

export default mongoose.models.Family || mongoose.model<IFamily>('Family', FamilySchema); 