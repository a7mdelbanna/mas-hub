import { vi } from 'vitest';

/**
 * Firebase Service Mocks for Testing
 * Provides consistent mocks for Firebase services across all test files
 */

// ==================== FIREBASE AUTH MOCKS ====================

export const mockFirebaseAuth = {
  currentUser: null,
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  updatePassword: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenResult: vi.fn(),
};

export const mockUser = {
  uid: 'test-user-id',
  email: 'test@mas.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  emailVerified: true,
  phoneNumber: '+1234567890',
  getIdToken: vi.fn().mockResolvedValue('mock-token'),
  getIdTokenResult: vi.fn().mockResolvedValue({
    token: 'mock-token',
    claims: { role: 'employee' },
  }),
  updateProfile: vi.fn(),
  updatePassword: vi.fn(),
  reload: vi.fn(),
};

export const mockUserCredential = {
  user: mockUser,
  credential: null,
  operationType: 'signIn' as const,
  providerId: 'password',
};

// ==================== FIRESTORE MOCKS ====================

export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAt: vi.fn(),
  endAt: vi.fn(),
  onSnapshot: vi.fn(),
  runTransaction: vi.fn(),
  writeBatch: vi.fn(),
};

export const mockDocumentSnapshot = {
  id: 'test-doc-id',
  exists: vi.fn().mockReturnValue(true),
  data: vi.fn().mockReturnValue({ test: 'data' }),
  get: vi.fn(),
  ref: { id: 'test-doc-id', path: 'test/test-doc-id' },
};

export const mockQuerySnapshot = {
  size: 1,
  empty: false,
  docs: [mockDocumentSnapshot],
  forEach: vi.fn(),
  docChanges: vi.fn().mockReturnValue([]),
};

export const mockCollectionReference = {
  id: 'test-collection',
  path: 'test-collection',
  parent: null,
  doc: vi.fn().mockReturnValue(mockDocumentSnapshot),
  add: vi.fn(),
  get: vi.fn().mockResolvedValue(mockQuerySnapshot),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  onSnapshot: vi.fn(),
};

export const mockDocumentReference = {
  id: 'test-doc-id',
  path: 'test-collection/test-doc-id',
  parent: mockCollectionReference,
  get: vi.fn().mockResolvedValue(mockDocumentSnapshot),
  set: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  onSnapshot: vi.fn(),
  collection: vi.fn().mockReturnValue(mockCollectionReference),
};

// ==================== FIREBASE FUNCTIONS MOCKS ====================

export const mockFunctions = {
  httpsCallable: vi.fn(),
  connectFunctionsEmulator: vi.fn(),
};

export const mockHttpsCallable = vi.fn();

// ==================== FIREBASE STORAGE MOCKS ====================

export const mockStorage = {
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  uploadString: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
  listAll: vi.fn(),
  getMetadata: vi.fn(),
  updateMetadata: vi.fn(),
};

export const mockStorageReference = {
  bucket: 'test-bucket',
  fullPath: 'test/path',
  name: 'test-file.jpg',
  root: null,
  storage: mockStorage,
  put: vi.fn(),
  putString: vi.fn(),
  getDownloadURL: vi.fn().mockResolvedValue('https://example.com/file.jpg'),
  delete: vi.fn(),
  getMetadata: vi.fn(),
  updateMetadata: vi.fn(),
  child: vi.fn().mockReturnThis(),
  parent: null,
};

// ==================== FIREBASE ADMIN MOCKS (for backend tests) ====================

export const mockFirebaseAdmin = {
  auth: () => ({
    verifyIdToken: vi.fn().mockResolvedValue({
      uid: 'test-user-id',
      email: 'test@mas.com',
      role: 'employee',
    }),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    getUserByEmail: vi.fn(),
    setCustomUserClaims: vi.fn(),
    listUsers: vi.fn(),
  }),
  firestore: () => ({
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({ test: 'data' }),
          id: 'test-doc-id',
        }),
        set: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        collection: vi.fn().mockReturnThis(),
      }),
      add: vi.fn(),
      get: vi.fn().mockResolvedValue({
        docs: [{
          id: 'test-doc-id',
          data: () => ({ test: 'data' }),
        }],
        size: 1,
        empty: false,
      }),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    }),
    runTransaction: vi.fn(),
    batch: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      commit: vi.fn().mockResolvedValue(),
    }),
  }),
  storage: () => ({
    bucket: vi.fn().mockReturnValue({
      file: vi.fn().mockReturnValue({
        save: vi.fn(),
        download: vi.fn(),
        delete: vi.fn(),
        getSignedUrl: vi.fn().mockResolvedValue(['https://example.com/signed-url']),
      }),
    }),
  }),
  messaging: () => ({
    send: vi.fn(),
    sendMulticast: vi.fn(),
    subscribeToTopic: vi.fn(),
    unsubscribeFromTopic: vi.fn(),
  }),
};

// ==================== MOCK SETUP FUNCTIONS ====================

/**
 * Setup Firebase Auth mocks for authentication tests
 */
export const setupAuthMocks = () => {
  mockFirebaseAuth.onAuthStateChanged.mockImplementation((callback) => {
    callback(mockUser);
    return vi.fn(); // Unsubscribe function
  });

  mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);
  mockFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
  mockFirebaseAuth.signOut.mockResolvedValue();
  mockFirebaseAuth.sendPasswordResetEmail.mockResolvedValue();

  return {
    auth: mockFirebaseAuth,
    user: mockUser,
    userCredential: mockUserCredential,
  };
};

/**
 * Setup Firestore mocks for database operations
 */
export const setupFirestoreMocks = () => {
  mockFirestore.collection.mockReturnValue(mockCollectionReference);
  mockFirestore.doc.mockReturnValue(mockDocumentReference);
  mockFirestore.getDoc.mockResolvedValue(mockDocumentSnapshot);
  mockFirestore.getDocs.mockResolvedValue(mockQuerySnapshot);
  mockFirestore.addDoc.mockResolvedValue(mockDocumentReference);
  mockFirestore.updateDoc.mockResolvedValue();
  mockFirestore.deleteDoc.mockResolvedValue();

  mockFirestore.query.mockReturnValue(mockCollectionReference);
  mockFirestore.where.mockReturnValue(mockCollectionReference);
  mockFirestore.orderBy.mockReturnValue(mockCollectionReference);
  mockFirestore.limit.mockReturnValue(mockCollectionReference);

  mockFirestore.runTransaction.mockImplementation(async (callback) => {
    return await callback({
      get: vi.fn().mockResolvedValue(mockDocumentSnapshot),
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    });
  });

  mockFirestore.writeBatch.mockReturnValue({
    set: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    commit: vi.fn().mockResolvedValue(),
  });

  return {
    db: mockFirestore,
    collection: mockCollectionReference,
    doc: mockDocumentReference,
    snapshot: mockDocumentSnapshot,
    querySnapshot: mockQuerySnapshot,
  };
};

/**
 * Setup Firebase Functions mocks
 */
export const setupFunctionsMocks = () => {
  mockFunctions.httpsCallable.mockReturnValue(mockHttpsCallable);
  mockHttpsCallable.mockResolvedValue({ data: { success: true } });

  return {
    functions: mockFunctions,
    httpsCallable: mockHttpsCallable,
  };
};

/**
 * Setup Firebase Storage mocks
 */
export const setupStorageMocks = () => {
  mockStorage.ref.mockReturnValue(mockStorageReference);
  mockStorage.uploadBytes.mockResolvedValue({
    ref: mockStorageReference,
    metadata: {
      bucket: 'test-bucket',
      fullPath: 'test/path',
      size: 1024,
      contentType: 'image/jpeg',
    },
  });
  mockStorage.getDownloadURL.mockResolvedValue('https://example.com/file.jpg');

  return {
    storage: mockStorage,
    ref: mockStorageReference,
  };
};

/**
 * Setup all Firebase mocks at once
 */
export const setupAllFirebaseMocks = () => {
  const auth = setupAuthMocks();
  const firestore = setupFirestoreMocks();
  const functions = setupFunctionsMocks();
  const storage = setupStorageMocks();

  return {
    ...auth,
    ...firestore,
    ...functions,
    ...storage,
  };
};

// ==================== FIREBASE EMULATOR UTILITIES ====================

/**
 * Mock Firebase emulator connection for testing
 */
export const mockFirebaseEmulators = {
  auth: {
    useEmulator: vi.fn(),
  },
  firestore: {
    useEmulator: vi.fn(),
  },
  functions: {
    useEmulator: vi.fn(),
  },
  storage: {
    useEmulator: vi.fn(),
  },
};

/**
 * Setup Firebase emulator mocks for integration testing
 */
export const setupEmulatorMocks = () => {
  // Mock emulator connection functions
  Object.values(mockFirebaseEmulators).forEach(emulator => {
    emulator.useEmulator.mockImplementation(() => {
      // Simulate emulator connection
      console.log('Connected to Firebase emulator');
    });
  });

  return mockFirebaseEmulators;
};

// ==================== TESTING UTILITIES ====================

/**
 * Reset all Firebase mocks between tests
 */
export const resetFirebaseMocks = () => {
  vi.clearAllMocks();

  // Reset auth state
  mockFirebaseAuth.currentUser = null;

  // Reset mock implementations
  Object.values(mockFirebaseAuth).forEach(mock => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      mock.mockReset();
    }
  });

  Object.values(mockFirestore).forEach(mock => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      mock.mockReset();
    }
  });

  Object.values(mockFunctions).forEach(mock => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      mock.mockReset();
    }
  });

  Object.values(mockStorage).forEach(mock => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      mock.mockReset();
    }
  });
};

/**
 * Create a mock Firebase error
 */
export const createFirebaseError = (code: string, message: string) => {
  const error = new Error(message) as any;
  error.code = code;
  return error;
};

/**
 * Common Firebase error codes for testing
 */
export const FirebaseErrorCodes = {
  AUTH: {
    INVALID_EMAIL: 'auth/invalid-email',
    USER_NOT_FOUND: 'auth/user-not-found',
    WRONG_PASSWORD: 'auth/wrong-password',
    TOO_MANY_REQUESTS: 'auth/too-many-requests',
    NETWORK_REQUEST_FAILED: 'auth/network-request-failed',
  },
  FIRESTORE: {
    PERMISSION_DENIED: 'permission-denied',
    NOT_FOUND: 'not-found',
    ALREADY_EXISTS: 'already-exists',
    RESOURCE_EXHAUSTED: 'resource-exhausted',
    UNAUTHENTICATED: 'unauthenticated',
  },
  STORAGE: {
    OBJECT_NOT_FOUND: 'storage/object-not-found',
    UNAUTHORIZED: 'storage/unauthorized',
    RETRY_LIMIT_EXCEEDED: 'storage/retry-limit-exceeded',
    QUOTA_EXCEEDED: 'storage/quota-exceeded',
  },
} as const;

export default {
  setupAllFirebaseMocks,
  setupAuthMocks,
  setupFirestoreMocks,
  setupFunctionsMocks,
  setupStorageMocks,
  setupEmulatorMocks,
  resetFirebaseMocks,
  createFirebaseError,
  FirebaseErrorCodes,
};