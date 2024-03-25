// Interface for the DAO methods
export interface IBaseDao<T> {
    create(item: T): Promise<T>;
    update(id: string, item: T): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    get(id: string): Promise<T | null>;
    getAll(): Promise<[T[], Pagination]>;
}

export interface Pagination{
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}