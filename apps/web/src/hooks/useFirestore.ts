/**
 * Generic Firestore Hooks
 * Real-time data synchronization with Firestore
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';

export interface FirestoreError {
  code: string;
  message: string;
}

/**
 * Hook to subscribe to a single Firestore document
 */
export function useDocument<T = DocumentData>(
  collectionName: string,
  documentId: string | null | undefined,
  options?: {
    enabled?: boolean;
    onError?: (error: FirestoreError) => void;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    // Skip if disabled or no document ID
    if (!options?.enabled ?? true === false || !documentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const docRef = doc(db, collectionName, documentId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = {
            id: snapshot.id,
            ...snapshot.data(),
          } as T;
          setData(docData);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        const firestoreError: FirestoreError = {
          code: err.code || 'unknown',
          message: err.message || 'An error occurred',
        };
        setError(firestoreError);
        setLoading(false);
        options?.onError?.(firestoreError);
      }
    );

    return () => unsubscribe();
  }, [collectionName, documentId, options?.enabled]);

  return {
    data,
    loading,
    error,
    refetch: () => {
      // Firestore subscriptions auto-refresh
      setLoading(true);
    },
  };
}

/**
 * Hook to subscribe to a Firestore collection with queries
 */
export function useCollection<T = DocumentData>(
  collectionName: string,
  constraints?: QueryConstraint[],
  options?: {
    enabled?: boolean;
    onError?: (error: FirestoreError) => void;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  // Serialize constraints for dependency array
  const constraintsKey = JSON.stringify(
    constraints?.map((c) => c.type) || []
  );

  useEffect(() => {
    // Skip if disabled
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const collectionRef = collection(db, collectionName);
    const q = constraints?.length
      ? query(collectionRef, ...constraints)
      : query(collectionRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        setLoading(false);
      },
      (err) => {
        const firestoreError: FirestoreError = {
          code: err.code || 'unknown',
          message: err.message || 'An error occurred',
        };
        setError(firestoreError);
        setLoading(false);
        options?.onError?.(firestoreError);
      }
    );

    return () => unsubscribe();
  }, [collectionName, constraintsKey, options?.enabled]);

  return {
    data,
    loading,
    error,
    refetch: () => {
      // Firestore subscriptions auto-refresh
      setLoading(true);
    },
  };
}

/**
 * Hook for paginated Firestore queries
 */
export function usePaginatedCollection<T = DocumentData>(
  collectionName: string,
  pageSize: number = 10,
  constraints?: QueryConstraint[],
  options?: {
    enabled?: boolean;
    onError?: (error: FirestoreError) => void;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  const loadInitial = useCallback(() => {
    // Skip if disabled
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setData([]);
    setLastDoc(null);

    const collectionRef = collection(db, collectionName);
    const queryConstraints = [
      ...(constraints || []),
      limit(pageSize),
    ];

    const q = query(collectionRef, ...queryConstraints);

    // Unsubscribe from previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        setData(docs);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === pageSize);
        setLoading(false);
      },
      (err) => {
        const firestoreError: FirestoreError = {
          code: err.code || 'unknown',
          message: err.message || 'An error occurred',
        };
        setError(firestoreError);
        setLoading(false);
        options?.onError?.(firestoreError);
      }
    );
  }, [collectionName, pageSize, constraints, options?.enabled]);

  const loadMore = useCallback(() => {
    if (!hasMore || !lastDoc || loading) return;

    setLoading(true);

    const collectionRef = collection(db, collectionName);
    const queryConstraints = [
      ...(constraints || []),
      startAfter(lastDoc),
      limit(pageSize),
    ];

    const q = query(collectionRef, ...queryConstraints);

    onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        setData((prev) => [...prev, ...docs]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === pageSize);
        setLoading(false);
      },
      (err) => {
        const firestoreError: FirestoreError = {
          code: err.code || 'unknown',
          message: err.message || 'An error occurred',
        };
        setError(firestoreError);
        setLoading(false);
        options?.onError?.(firestoreError);
      }
    );
  }, [hasMore, lastDoc, loading, collectionName, pageSize, constraints]);

  useEffect(() => {
    loadInitial();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [loadInitial]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh: loadInitial,
  };
}

/**
 * Hook for real-time count of documents
 */
export function useCollectionCount(
  collectionName: string,
  constraints?: QueryConstraint[],
  options?: {
    enabled?: boolean;
  }
) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    const collectionRef = collection(db, collectionName);
    const q = constraints?.length
      ? query(collectionRef, ...constraints)
      : query(collectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCount(snapshot.size);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName, constraints, options?.enabled]);

  return { count, loading };
}

/**
 * Hook for real-time aggregation
 */
export function useAggregation<T = any>(
  collectionName: string,
  aggregator: (docs: DocumentData[]) => T,
  constraints?: QueryConstraint[],
  options?: {
    enabled?: boolean;
  }
) {
  const [result, setResult] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    const collectionRef = collection(db, collectionName);
    const q = constraints?.length
      ? query(collectionRef, ...constraints)
      : query(collectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const aggregatedResult = aggregator(docs);
      setResult(aggregatedResult);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName, aggregator, constraints, options?.enabled]);

  return { result, loading };
}

// Helper function to import startAfter
import { startAfter } from 'firebase/firestore';

export { where, orderBy, limit } from 'firebase/firestore';