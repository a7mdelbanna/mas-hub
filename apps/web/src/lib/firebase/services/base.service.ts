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
  QueryConstraint,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { DocumentData, WithFieldValue, UpdateData } from 'firebase/firestore';
import { db } from '../firebase';

export interface BaseEntity {
  id: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export class BaseService<T extends BaseEntity> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected getCollection() {
    return collection(db, this.collectionName);
  }

  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  protected convertTimestamps(data: any): T {
    const converted = { ...data };
    
    // Convert Firestore timestamps to Date objects
    if (data.createdAt?.toDate) {
      converted.createdAt = data.createdAt.toDate();
    }
    if (data.updatedAt?.toDate) {
      converted.updatedAt = data.updatedAt.toDate();
    }
    
    return converted as T;
  }

  async getById(id: string): Promise<T | null> {
    try {
      const docSnap = await getDoc(this.getDocRef(id));
      if (docSnap.exists()) {
        return this.convertTimestamps({ id: docSnap.id, ...docSnap.data() });
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${this.collectionName} by id:`, error);
      throw error;
    }
  }

  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const q = query(this.getCollection(), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => 
        this.convertTimestamps({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error(`Error getting all ${this.collectionName}:`, error);
      throw error;
    }
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const docRef = doc(this.getCollection());
      const dataWithTimestamps: any = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(docRef, dataWithTimestamps);
      const created = await this.getById(docRef.id);
      if (!created) {
        throw new Error('Failed to create document');
      }
      return created;
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> {
    try {
      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(this.getDocRef(id), updateData);
      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Document not found after update');
      }
      return updated;
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(this.getDocRef(id));
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Helper method to build queries
  buildConstraints(filters: Record<string, any>): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'orderBy') {
          constraints.push(orderBy(value.field, value.direction || 'asc'));
        } else if (key === 'limit') {
          constraints.push(limit(value));
        } else {
          constraints.push(where(key, '==', value));
        }
      }
    });
    
    return constraints;
  }
}