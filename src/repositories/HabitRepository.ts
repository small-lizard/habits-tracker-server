import { IRepository } from './IRepository';
import HttpError from '../utils/HttpError';

class HabitRepository {

    private database: IRepository<any>;

    constructor(database: IRepository<any>) {
        this.database = database;
    }

    async addHabit(habitData: any) {
        if (!habitData.userId) {
            throw new HttpError(400, 'UserId is required');
        }

        const createdHabit = await this.database.save(habitData);
        return createdHabit;
    }

    async updateHabit(habitData: any) {
        const updatedHabit = await this.database.update(habitData.id, habitData);
        return updatedHabit;
    }

    async delete(id: string) {
        const doc = await this.database.find({id});
        if (!doc) throw new Error('Document not found');
        
        return this.database.delete(doc.id);
    }

    async getByUser() {
        return this.database.getAll();
    }
}

export default HabitRepository;