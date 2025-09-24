import * as admin from 'firebase-admin';
import { db } from '../config/firebase';
import { nanoid } from 'nanoid';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: WhereCondition[];
  select?: string[];
  includeDeleted?: boolean;
}

export interface WhereCondition {
  field: string;
  operator: FirebaseFirestore.WhereFilterOp;
  value: any;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface BaseEntity {
  id?: string;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: FirebaseFirestore.Timestamp | null;
  deletedBy?: string | null;
}

export class BaseRepository<T extends BaseEntity> {
  protected collection: FirebaseFirestore.CollectionReference;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.collection = db.collection(collectionName);
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>, userId?: string): Promise<T> {
    const id = data.id || nanoid();
    const now = admin.firestore.Timestamp.now();

    const document: T = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    } as T;

    await this.collection.doc(id).set(document);
    return document;
  }

  /**
   * Create multiple documents in a batch
   */
  async createBatch(items: Partial<T>[], userId?: string): Promise<T[]> {
    const batch = db.batch();
    const now = admin.firestore.Timestamp.now();
    const documents: T[] = [];

    for (const item of items) {
      const id = item.id || nanoid();
      const document: T = {
        ...item,
        id,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
      } as T;

      batch.set(this.collection.doc(id), document);
      documents.push(document);
    }

    await batch.commit();
    return documents;
  }

  /**
   * Get a document by ID
   */
  async findById(id: string, includeDeleted: boolean = false): Promise<T | null> {
    const doc = await this.collection.doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as T;

    if (!includeDeleted && data.deletedAt) {
      return null;
    }

    return { ...data, id: doc.id };
  }

  /**
   * Get multiple documents by IDs
   */
  async findByIds(ids: string[], includeDeleted: boolean = false): Promise<T[]> {
    if (ids.length === 0) {
      return [];
    }

    // Firestore 'in' query limited to 10 items
    const chunks = this.chunkArray(ids, 10);
    const results: T[] = [];

    for (const chunk of chunks) {
      const snapshot = await this.collection
        .where(admin.firestore.FieldPath.documentId(), 'in', chunk)
        .get();

      for (const doc of snapshot.docs) {
        const data = doc.data() as T;
        if (includeDeleted || !data.deletedAt) {
          results.push({ ...data, id: doc.id });
        }
      }
    }

    return results;
  }

  /**
   * Find documents with conditions
   */
  async find(options: QueryOptions = {}): Promise<T[]> {
    let query = this.buildQuery(options);

    const snapshot = await query.get();
    const results: T[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data() as T;
      results.push({ ...data, id: doc.id });
    }

    return results;
  }

  /**
   * Find documents with pagination
   */
  async findPaginated(options: QueryOptions = {}): Promise<PaginatedResult<T>> {
    const page = Math.max(1, Math.floor((options.offset || 0) / (options.limit || 20)) + 1);
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = this.buildCountQuery(options);
    const countSnapshot = await countQuery.get();
    const total = countSnapshot.size;

    // Get paginated data
    const dataOptions = { ...options, limit, offset };
    const data = await this.find(dataOptions);

    return {
      data,
      total,
      page,
      limit,
      hasNext: offset + limit < total,
      hasPrevious: page > 1,
    };
  }

  /**
   * Find one document matching conditions
   */
  async findOne(options: QueryOptions = {}): Promise<T | null> {
    const results = await this.find({ ...options, limit: 1 });
    return results[0] || null;
  }

  /**
   * Update a document
   */
  async update(id: string, data: Partial<T>, userId?: string): Promise<T> {
    const now = admin.firestore.Timestamp.now();

    const updateData = {
      ...data,
      updatedAt: now,
      updatedBy: userId,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    await this.collection.doc(id).update(updateData);

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Document with id ${id} not found after update`);
    }

    return updated;
  }

  /**
   * Update multiple documents
   */
  async updateBatch(updates: { id: string; data: Partial<T> }[], userId?: string): Promise<void> {
    const batch = db.batch();
    const now = admin.firestore.Timestamp.now();

    for (const { id, data } of updates) {
      const updateData = {
        ...data,
        updatedAt: now,
        updatedBy: userId,
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      batch.update(this.collection.doc(id), updateData);
    }

    await batch.commit();
  }

  /**
   * Soft delete a document
   */
  async softDelete(id: string, userId?: string): Promise<void> {
    const now = admin.firestore.Timestamp.now();

    await this.collection.doc(id).update({
      deletedAt: now,
      deletedBy: userId,
      updatedAt: now,
      updatedBy: userId,
    });
  }

  /**
   * Hard delete a document
   */
  async hardDelete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  /**
   * Restore a soft-deleted document
   */
  async restore(id: string, userId?: string): Promise<T> {
    const now = admin.firestore.Timestamp.now();

    await this.collection.doc(id).update({
      deletedAt: null,
      deletedBy: null,
      updatedAt: now,
      updatedBy: userId,
    });

    const restored = await this.findById(id);
    if (!restored) {
      throw new Error(`Document with id ${id} not found after restore`);
    }

    return restored;
  }

  /**
   * Check if document exists
   */
  async exists(id: string, includeDeleted: boolean = false): Promise<boolean> {
    const doc = await this.collection.doc(id).get();

    if (!doc.exists) {
      return false;
    }

    if (!includeDeleted) {
      const data = doc.data() as T;
      return !data.deletedAt;
    }

    return true;
  }

  /**
   * Count documents matching conditions
   */
  async count(options: QueryOptions = {}): Promise<number> {
    const query = this.buildCountQuery(options);
    const snapshot = await query.get();
    return snapshot.size;
  }

  /**
   * Execute a transaction
   */
  async transaction<R>(
    callback: (transaction: FirebaseFirestore.Transaction) => Promise<R>
  ): Promise<R> {
    return db.runTransaction(callback);
  }

  /**
   * Build Firestore query from options
   */
  protected buildQuery(options: QueryOptions): FirebaseFirestore.Query {
    let query: FirebaseFirestore.Query = this.collection;

    // Add where conditions
    if (options.where) {
      for (const condition of options.where) {
        query = query.where(condition.field, condition.operator, condition.value);
      }
    }

    // Filter out deleted documents
    if (!options.includeDeleted) {
      query = query.where('deletedAt', '==', null);
    }

    // Add ordering
    if (options.orderBy) {
      query = query.orderBy(options.orderBy, options.orderDirection || 'asc');
    }

    // Add pagination
    if (options.offset) {
      query = query.offset(options.offset);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    return query;
  }

  /**
   * Build query for counting (without limit/offset)
   */
  protected buildCountQuery(options: QueryOptions): FirebaseFirestore.Query {
    let query: FirebaseFirestore.Query = this.collection;

    // Add where conditions
    if (options.where) {
      for (const condition of options.where) {
        query = query.where(condition.field, condition.operator, condition.value);
      }
    }

    // Filter out deleted documents
    if (!options.includeDeleted) {
      query = query.where('deletedAt', '==', null);
    }

    return query;
  }

  /**
   * Chunk array into smaller arrays
   */
  protected chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToChanges(
    callback: (data: T[]) => void,
    options: QueryOptions = {}
  ): () => void {
    const query = this.buildQuery(options);

    const unsubscribe = query.onSnapshot((snapshot) => {
      const data: T[] = [];
      snapshot.forEach((doc) => {
        data.push({ ...doc.data(), id: doc.id } as T);
      });
      callback(data);
    });

    return unsubscribe;
  }

  /**
   * Get next counter value for sequential numbering
   */
  async getNextCounter(counterName: string): Promise<number> {
    const counterRef = db.collection('counters').doc(`${this.collectionName}_${counterName}`);

    const counter = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(counterRef);
      let nextValue = 1;

      if (doc.exists) {
        nextValue = (doc.data()?.value || 0) + 1;
      }

      transaction.set(counterRef, { value: nextValue }, { merge: true });
      return nextValue;
    });

    return counter;
  }

  /**
   * Generate unique document number
   */
  async generateDocumentNumber(prefix: string, dateFormat: boolean = true): Promise<string> {
    const counter = await this.getNextCounter('document_number');

    if (dateFormat) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${prefix}-${year}${month}-${String(counter).padStart(4, '0')}`;
    }

    return `${prefix}-${String(counter).padStart(8, '0')}`;
  }

  /**
   * Aggregate data
   */
  async aggregate(
    field: string,
    operation: 'sum' | 'avg' | 'min' | 'max' | 'count',
    options: QueryOptions = {}
  ): Promise<number> {
    const query = this.buildQuery(options);
    const snapshot = await query.get();

    if (snapshot.empty) {
      return 0;
    }

    const values = snapshot.docs.map((doc) => {
      const data = doc.data();
      return data[field] || 0;
    });

    switch (operation) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return values.length;
      default:
        return 0;
    }
  }
}