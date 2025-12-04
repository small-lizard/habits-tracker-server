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

        const mapDoc = (document: Document) => {
            const obj = document.toObject();
            obj.id = obj._id.toString();
            delete obj._id;
            return obj;
        };

        if (Array.isArray(input)) {
            return input.map(mapDoc);
        }

        return mapDoc(input);
    }

    async find(query: Partial<T>) {
        const document = await this.model.findOne(query);

        return document;
    }

    async getAll(userId: string) {
        const document = await this.model.find({ userId });

        return this.serialiseDocument(document);
    }

    async save(data: T) {
        const { id } = data as { id: string };

        const dataInfo = {
            ...data,
            _id: id
        }

        const document = await this.model.create(dataInfo);

        return this.serialiseDocument(document);
    }


    async findById(id: string) {
        const document = await this.model.find({_id: id});

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