import mongoose, { Document, Schema } from 'mongoose';

interface IOption { id: string; value: string; }

interface ITaskGroup   { id: string; title: string; tasks: IOption[]; }
interface IExpenseGroup { id: string; title: string; expenses: IOption[]; }

export interface IOptions extends Document {
  userId: mongoose.Types.ObjectId;
  taskGroups: ITaskGroup[];
  expenseGroups: IExpenseGroup[];
  currency: string;
}

const OptionSchema = new Schema<IOption>(
  { id: { type: String, required: true }, value: { type: String, required: true } },
  { _id: false }
);

const TaskGroupSchema = new Schema<ITaskGroup>(
  { id: { type: String, required: true }, title: { type: String, required: true }, tasks: [OptionSchema] },
  { _id: false }
);

const ExpenseGroupSchema = new Schema<IExpenseGroup>(
  { id: { type: String, required: true }, title: { type: String, required: true }, expenses: [OptionSchema] },
  { _id: false }
);

const OptionsSchema = new Schema<IOptions>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    taskGroups:    { type: [TaskGroupSchema],    default: [] },
    expenseGroups: { type: [ExpenseGroupSchema], default: [] },
    currency:      { type: String, default: 'USD' },
  },
  { timestamps: true }
);

export const Options = mongoose.model<IOptions>('Options', OptionsSchema);
