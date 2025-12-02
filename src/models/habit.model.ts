import mongoose, { InferSchemaType, Schema } from 'mongoose';

const habitSchema = new Schema(
  {
    userId: { type: String, required: true },
    id: { type: String, required: true },
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
  }, {
  _id: false
},);

export type Habit = InferSchemaType<typeof habitSchema>;

export const HabitModel = mongoose.model<Habit>('Habit', habitSchema);