import mongoose, { Document, Schema } from 'mongoose';

export interface IChecklistItem {
  _id?: mongoose.Types.ObjectId;
  text: string;
  completed: boolean;
  type?: 'task' | 'expanse';
  optionId?: string;
  amount?: number;
}

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  dueDate: Date;
  checklist: IChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new Schema<IChecklistItem>({
  text: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  type: { type: String, enum: ['task', 'expanse'], default: 'task' },
  optionId: { type: String },
  amount: { type: Number },
});

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    checklist: { type: [ChecklistItemSchema], default: [] },
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1, dueDate: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
