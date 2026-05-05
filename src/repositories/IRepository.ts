export interface IRepository<T> {
    getAll(id: string): Promise<T[]| null>;
    find(query: Partial<T>): Promise<T | null>; 
    save(data: Omit<T, 'id'> & { id?: string }): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<T | null>;
    deleteAllById(userId: string): Promise<void>;
}

