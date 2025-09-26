import { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import type { FirestoreError } from 'firebase/firestore';
import { db } from '../lib/firebase/config';

interface UseFirestoreCollectionOptions {
  collectionName: string;
  constraints?: QueryConstraint[];
  dependencies?: any[];
}

interface UseFirestoreCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: FirestoreError | null;
  refetch: () => void;
}

export function useFirestoreCollection<T extends { id: string }>(
  options: UseFirestoreCollectionOptions
): UseFirestoreCollectionResult<T> {
  const { collectionName, constraints = [], dependencies = [] } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((doc) => {
          const docData = doc.data();
          // Convert Firestore timestamps to Date objects
          const convertedData: any = { id: doc.id };

          Object.keys(docData).forEach(key => {
            const value = docData[key];
            if (value?.toDate) {
              convertedData[key] = value.toDate();
            } else {
              convertedData[key] = value;
            }
          });

          items.push(convertedData as T);
        });

        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // Use JSON.stringify to compare array contents, not references
  }, [collectionName, refetchTrigger, JSON.stringify(constraints), JSON.stringify(dependencies)]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return { data, loading, error, refetch };
}