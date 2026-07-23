/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserRole, UserProfile } from '../types';

// Check if we are running with mocked settings
const hasConfig = firebaseConfig.apiKey !== 'MOCK_API_KEY' && !firebaseConfig.apiKey.includes('YOUR_');

// Clean up any stale local preference to guarantee Firestore is strictly used everywhere
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('vitor_engmec_db_mode');
  } catch (e) {
    // ignore
  }
}

// Always use real Firebase Firestore as database
export let isRealFirebase = hasConfig;

export function getIsRealFirebase() {
  return hasConfig;
}

// Setup live connection state bindings
export let isFirebaseUnreachable = false;
let unreachableListeners: ((unreachable: boolean) => void)[] = [];

export function onFirebaseUnreachableChange(cb: (unreachable: boolean) => void) {
  unreachableListeners.push(cb);
  cb(isFirebaseUnreachable);
  return () => {
    unreachableListeners = unreachableListeners.filter(l => l !== cb);
  };
}

export function setFirebaseUnreachable(unreachable: boolean) {
  isFirebaseUnreachable = unreachable;
  unreachableListeners.forEach(cb => cb(unreachable));
}

export type ModeChangeListener = (enabled: boolean) => void;
let modeListeners: ModeChangeListener[] = [];

export function onModeChange(cb: ModeChangeListener) {
  modeListeners.push(cb);
  return () => {
    modeListeners = modeListeners.filter(l => l !== cb);
  };
}

export function setRealFirebaseEnabled(enabled: boolean) {
  isRealFirebase = hasConfig;
  modeListeners.forEach(cb => cb(isRealFirebase));
}

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);

// Initialize Firestore with experimentalForceLongPolling to bypass websocket blocks/iframe sandbox connection hangs
// We detect if we are running in an iframe (which has IndexedDB/storage limitations and blocks third-party cookies)
// If we are in an iframe, we force memoryLocalCache to guarantee a smooth experience without connection hangs.
export let db;
try {
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: isIframe ? memoryLocalCache() : persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (error) {
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
}

// Test connection strictly as requested by Firebase Integration Guidelines, enhanced with low timeout
async function testConnection() {
  if (!isRealFirebase) {
    setFirebaseUnreachable(false);
    return;
  }
  
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('timeout')), 4500)
  );

  try {
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeoutPromise
    ]);
    setFirebaseUnreachable(false);
  } catch (error: any) {
    // If the server answered 'permission-denied', it is reachable! That is a success confirmation of server response.
    if (error && (error.code === 'permission-denied' || error.message?.includes('permission-denied') || error.message?.includes('PERMISSION_DENIED'))) {
      setFirebaseUnreachable(false);
    } else {
      console.warn("Please check your Firebase configuration: Firestore backend is currently unreachable. Error details:", error);
      setFirebaseUnreachable(true);
    }
  }
}
testConnection();

// Define error helper strictly with instructed schema
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Global Google Authenticator logic
const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}
