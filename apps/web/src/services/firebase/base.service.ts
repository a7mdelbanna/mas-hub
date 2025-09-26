/**
 * Base Firebase Service
 * Common patterns and utilities for all Firebase services
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import type {
  QueryConstraint,
  Unsubscribe,
  Transaction,
  FirestoreError,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';

export interface BaseDocument {
  id: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface QueryOptions {
  where?: Array<{ field: string; operator: string; value: any }>;
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: any;
}

export type SubscriptionCallback<T> = (data: T[], error?: ServiceError) => void;

export class BaseService<T extends BaseDocument> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Convert Firestore document to typed object
   */
  protected toObject(doc: any): T {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    } as T;
  }

  /**
   * Handle Firestore errors
   */
  protected handleError(error: any): ServiceError {
    console.error(`[${this.collectionName}] Error:`, error);

    // Map common Firestore errors to user-friendly messages
    const errorMap: Record<string, string> = {
      'permission-denied': 'You do not have permission to perform this action',
      'not-found': 'The requested resource was not found',
      'already-exists': 'This resource already exists',
      'invalid-argument': 'Invalid data provided',
      'deadline-exceeded': 'Operation timed out',
      'resource-exhausted': 'Too many requests. Please try again later',
      'unauthenticated': 'You must be logged in to perform this action',
      'unavailable': 'Service temporarily unavailable',
      'cancelled': 'Operation was cancelled',
      'data-loss': 'Data loss occurred. Please try again',
      'unknown': 'An unknown error occurred',
    };

    const code = error.code || 'unknown';
    const message = errorMap[code] || error.message || 'An error occurred';

    return {
      code,
      message,
      details: error,
    };
  }

  /**
   * Get a single document by ID
   */
  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this.toObject(docSnap);
      }
      return null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get multiple documents with optional query
   */
  async getMany(options?: QueryOptions): Promise<T[]> {
    try {
      const constraints: QueryConstraint[] = [];

      // Add where clauses
      if (options?.where) {
        for (const w of options.where) {
          constraints.push(where(w.field, w.operator as any, w.value));
        }
      }

      // Add order by clauses
      if (options?.orderBy) {
        for (const o of options.orderBy) {
          constraints.push(orderBy(o.field, o.direction));
        }
      }

      // Add limit
      if (options?.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => this.toObject(doc));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>, userId?: string): Promise<T> {
    try {
      const docRef = doc(collection(db, this.collectionName));
      const now = serverTimestamp();

      const newData = {
        ...data,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
        createdBy: userId || 'system',
        updatedBy: userId || 'system',
      };

      await setDoc(docRef, newData);

      return {
        ...newData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing document
   */
  async update(id: string, data: Partial<T>, userId?: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);

      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: userId || 'system',
      };

      // Remove undefined values and id field
      delete (updateData as any).id;
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      await updateDoc(docRef, updateData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a document
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Subscribe to real-time updates for a single document
   */
  subscribeToDocument(
    id: string,
    callback: (data: T | null, error?: ServiceError) => void
  ): () => void {
    const docRef = doc(db, this.collectionName, id);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback(this.toObject(docSnap));
        } else {
          callback(null);
        }
      },
      (error) => {
        callback(null, this.handleError(error));
      }
    );
  }

  /**
   * Subscribe to real-time updates for a collection
   */
  subscribeToCollection(
    options: QueryOptions | undefined,
    callback: SubscriptionCallback<T>
  ): () => void {
    const constraints: QueryConstraint[] = [];

    // Add where clauses
    if (options?.where) {
      for (const w of options.where) {
        constraints.push(where(w.field, w.operator as any, w.value));
      }
    }

    // Add order by clauses
    if (options?.orderBy) {
      for (const o of options.orderBy) {
        constraints.push(orderBy(o.field, o.direction));
      }
    }

    // Add limit
    if (options?.limit) {
      constraints.push(limit(options.limit));
    }

    const q = query(collection(db, this.collectionName), ...constraints);

    return onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => this.toObject(doc));
        callback(data);
      },
      (error) => {
        callback([], this.handleError(error));
      }
    );
  }

  /**
   * Batch operations
   */
  async batchOperation(
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      id?: string;
      data?: Partial<T>;
    }>,
    userId?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      const now = serverTimestamp();

      for (const op of operations) {
        if (op.type === 'create' && op.data) {
          const docRef = doc(collection(db, this.collectionName));
          batch.set(docRef, {
            ...op.data,
            id: docRef.id,
            createdAt: now,
            updatedAt: now,
            createdBy: userId || 'system',
            updatedBy: userId || 'system',
          });
        } else if (op.type === 'update' && op.id && op.data) {
          const docRef = doc(db, this.collectionName, op.id);
          batch.update(docRef, {
            ...op.data,
            updatedAt: now,
            updatedBy: userId || 'system',
          });
        } else if (op.type === 'delete' && op.id) {
          const docRef = doc(db, this.collectionName, op.id);
          batch.delete(docRef);
        }
      }

      await batch.commit();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Transaction operation
   */
  async runTransaction<R>(
    updateFunction: (transaction: any) => Promise<R>
  ): Promise<R> {
    try {
      return await runTransaction(db, updateFunction);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if a document exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Count documents matching query
   */
  async count(options?: QueryOptions): Promise<number> {
    try {
      const docs = await this.getMany(options);
      return docs.length;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default BaseService;