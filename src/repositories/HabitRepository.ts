import { IRepository } from '@repositories/IRepository.js';
import { Habit } from '@models/habit.model.js';

export class HabitRepository {

    private repository: IRepository<Habit>;

    constructor(repository: IRepository<Habit>) {
        this.repository = repository;
    }

    public async addHabit(habitData: Habit) {
        return await this.repository.save(habitData);
    }

    public async updateHabit(habitData: Habit) {
        return await this.repository.update(habitData.id, habitData);
    }

    public async delete(id: string) {
        return await this.repository.delete(id);
    }

    public async getByUser(userId: string) {
        return await this.repository.getAll(userId)
    }

    public async deleteAllByUserId(userId: string) {
        return this.repository.deleteAllById(userId);
    }

    public async sync(userId: string, habits: Habit[]) {
        for (const habit of habits) {
            await this.repository.save({ ...habit, userId })
        }
    }
}