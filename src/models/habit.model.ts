import mongoose, { Schema } from 'mongoose';

const habitSchema = new Schema(
  {
    userId: { type: String, required: true },
    id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    template: {
      type: [Boolean],
      required: true,
    },
    selectedColor: { type: String, required: true },
    weeks: {
      type: Object as () => Record<string, number[]>,
      default: {},
    }
  },
  //   { versionKey: false }
);

export default mongoose.model('Habit', habitSchema, 'habits');
