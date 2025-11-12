export interface IRepository<T> {
    getAll(): Promise<T[]| null>;
    find(query: Partial<T>): Promise<T | null>; 
    save(data: T): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
}

