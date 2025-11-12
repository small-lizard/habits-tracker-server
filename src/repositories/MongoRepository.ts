import { IRepository } from './IRepository';
import { Document, Model } from 'mongoose';

export default class MongoRepository<T> implements IRepository<T> {
    private model: Model<any>;

    constructor(model: Model<any>) {
        this.model = model;
    }

    protected serialiseDocument(input: Document | Document[] | null) {
        if (!input) return null;

        if (Array.isArray(input)) {
            return input.map(document => ({ ...document.toObject(), _id: document._id?.toString() }));
        }

        return { ...input.toObject(), _id: input._id?.toString() };
    }

    async find(query: Partial<T>) {
        const document = await this.model.findOne(query);
        return this.serialiseDocument(document);
    }

    async getAll() {
        const document = await this.model.find();
        return this.serialiseDocument(document);
    }

    async save(data: T) {
        const document = await this.model.create(data);
        return this.serialiseDocument(document);
    }

    async update(id: string, data: Partial<T>) {
        const updated = await this.model.findByIdAndUpdate(id, data, { new: true });
        if (!updated) throw new Error('Document not found');
        return this.serialiseDocument(updated);
    }

    async delete(id: string) {
        const deleted = await this.model.findByIdAndDelete(id);
        if (!deleted) throw new Error('Document not found');
        return this.serialiseDocument(deleted);
    }
}