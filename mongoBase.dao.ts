import { Model, Query } from 'mongoose';
import { Pagination, IBaseDao } from './types';

// Base DAO class to be inherited by other DAOs
export abstract class MongoBaseDao<T> implements IBaseDao<T> {
    protected model: Model<T>;
    public total: number = 0;

    // Constructor to inject the model
    constructor(schema: Model<T>) {
        this.model = schema;
    }

    // Create a new document in the database
    async create(item: T): Promise<T> {
        try {
            return await this.model.create(item);
        } catch (error) {
            throw error;
        }
    }

    // Update an existing document in the database
    async update(id: string, item: Partial<T>): Promise<T | null> {
        try {
            return await this.model.findByIdAndUpdate(id, item, { new: true });
        } catch (error) {
            throw error;
        }
    }

    // Delete a document from the database
    async delete(id: string): Promise<boolean> {
        try {
            const deleted = await this.model.deleteOne({ "_id": Object(id) });
            return !!deleted;
        } catch (error) {
            throw error;
        }
    }

    // Get a document from the database by ID
    async get(id: string): Promise<T | null> {
        try {
            return await this.model.findById(id);
        } catch (error) {
            throw error;
        }
    }

    // Get a document from the database by ID
    async findOne(filter: any): Promise<T | null> {
        try {
            return await this.model.findOne(filter);
        } catch (error) {
            throw error;
        }
    }

    // Get a document from the database by ID
    async find(object: any): Promise<T[] | null> {
        try {
            return await this.model.find(object);
        } catch (error) {
            throw error;
        }
    }

    // Get all documents from the database
    async getAll(
        page: number = 1,
        pageSize: number = 10,
        search: object = {},
        sort: string = '_id:-1',
        select?: string
    ): Promise<[T[], Pagination]> {
        try {
            // Calculate the number of records to skip based on the page number and page size
            const skip = (page - 1) * pageSize;

            // Creating a query to find documents in the database that match the search criteria
            let query: Query<T[], T> = this.model.find(search);

            // Selecting specific fields if select parameter is provided
            if (select !== undefined) {
                const selectArray = select.split(',');
                const selectObject = selectArray.reduce((acc: any, val) => {
                    acc[val] = 1; // Marking each selected field to include in the query result
                    return acc;
                }, {});
                query.select(selectObject);
            }

            let pagination: Pagination = {} as Pagination;
            // Paginating the query results based on skip and pageSize
            if (page > 0){
                // Set pagination
                let queryCount: Query<T[], T> = this.model.find(search);
                this.total = (await queryCount.exec()).length;
                pagination = await this.paginate(page, pageSize);

                query = query.skip(skip).limit(pageSize);
            }
            
            // Executing the query and retrieving the records
            const records = await query.exec();

            // Returning the retrieved records
            return [records, pagination];
        } catch (error) {
            throw error;
        }
    }

    // Function to paginate results
    // Parameters:
    // - page: The current page number
    // - pageSize: The number of items per page
    // - total: The total number of items
    // Returns:
    // An object containing pagination information
    async paginate(page: number, pageSize: number): Promise<Pagination> {
        // Calculating the total number of pages
        const totalPages = Math.ceil(this.total / pageSize);

        // Constructing the pagination object
        const pagination: Pagination = {
            page,
            pageSize,
            total: this.total,
            totalPages
        };

        return pagination; // Returning the pagination object
    }
}
