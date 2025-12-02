import { IRepository } from './IRepository';
import { Document, Model } from 'mongoose';

export default class MongoRepository<T> implements IRepository<T> {
    private model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    protected serialiseDocument(input: Document | Document[] | null) {
        if (!input) {
            throw new Error('Document not found');
        }

        if (Array.isArray(input)) {
            return input.map(document => ({ ...document.toObject(), id: document.id.toString() }));
        }

        return { ...input.toObject(), id: input.id.toString() };
    }

    async find(query: Partial<T>) {
        const document = await this.model.findOne(query);

        return this.serialiseDocument(document);
    }

    async getAll(userId: string) {
        const document = await this.model.find({ userId });

        return this.serialiseDocument(document);
    }

    async save(data: T) {
        const document = await this.model.create(data);

        return this.serialiseDocument(document);
    }

    async findById(id: string) {
        const document = await this.model.find({ id: id });

        return this.serialiseDocument(document);
    }

    async update(id: string, data: Partial<T>) {
        const updated = await this.model.findByIdAndUpdate(id, data, { new: true });

        return this.serialiseDocument(updated);
    }

    async delete(id: string) {
        const deleted = await this.model.findByIdAndDelete(id);

        return this.serialiseDocument(deleted);
    }

    async deleteAllById(userId: string) {
        await this.model.deleteMany({ userId });
    }
}