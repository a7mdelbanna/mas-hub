import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import type { FirestoreError } from 'firebase/firestore';
import { db } from '../lib/firebase/config';

interface UseFirestoreDocumentOptions {
  collectionName: string;
  documentId: string | null;
  enabled?: boolean;
}

interface UseFirestoreDocumentResult<T> {
  data: T | null;
  loading: boolean;
  error: FirestoreError | null;
  refetch: () => void;
}

export function useFirestoreDocument<T extends { id: string }>(
  options: UseFirestoreDocumentOptions
): UseFirestoreDocumentResult<T> {
  const { collectionName, documentId, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (!enabled || !documentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const docRef = doc(db, collectionName, documentId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const docData = docSnapshot.data();
          // Convert Firestore timestamps to Date objects
          const convertedData: any = { id: docSnapshot.id };

          Object.keys(docData).forEach(key => {
            const value = docData[key];
            if (value?.toDate) {
              convertedData[key] = value.toDate();
            } else {
              convertedData[key] = value;
            }
          });

          setData(convertedData as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching document ${documentId} from ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, documentId, enabled, refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return { data, loading, error, refetch };
}