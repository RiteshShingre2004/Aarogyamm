import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<{ isNewUser: boolean }>;
    signInWithEmail: (e: string, p: string) => Promise<{ isNewUser: boolean }>;
    resolveMfaSignIn: (resolver: any, assertion: any) => Promise<{ isNewUser: boolean }>;
    signUpWithEmail: (e: string, p: string, n: string) => Promise<{ isNewUser: boolean }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signInWithGoogle = async (): Promise<{ isNewUser: boolean }> => {
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseUser = result.user;

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
            await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                createdAt: serverTimestamp(),
                profile: { onboardingComplete: false },
                metrics: {},
                progress: {
                    currentDay: 1,
                    completedDays: [],
                    workoutsCompleted: 0,
                    totalCaloriesBurned: 0,
                    streakDays: 0,
                    points: 0,
                },
                weightLog: [],
                moodLog: [],
            });
            return { isNewUser: true };
        }

        const data = userSnap.data();
        const onboardingComplete = data?.profile?.onboardingComplete === true;
        return { isNewUser: !onboardingComplete };
    };

    const signInWithEmail = async (email: string, pass: string): Promise<{ isNewUser: boolean }> => {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        const firebaseUser = result.user;
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (!userSnap.exists()) {
            return { isNewUser: true };
        }
        const data = userSnap.data();
        const onboardingComplete = data?.profile?.onboardingComplete === true;
        return { isNewUser: !onboardingComplete };
    };

    const resolveMfaSignIn = async (resolver: any, assertion: any): Promise<{ isNewUser: boolean }> => {
        const result = await resolver.resolveSignIn(assertion);
        const firebaseUser = result.user;
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (!userSnap.exists()) {
            return { isNewUser: true };
        }
        const data = userSnap.data();
        const onboardingComplete = data?.profile?.onboardingComplete === true;
        return { isNewUser: !onboardingComplete };
    };

    const signUpWithEmail = async (email: string, pass: string, name: string): Promise<{ isNewUser: boolean }> => {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        const firebaseUser = result.user;
        
        await updateProfile(firebaseUser, { displayName: name });
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userDocRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: name,
            photoURL: null,
            createdAt: serverTimestamp(),
            profile: { onboardingComplete: false },
            metrics: {},
            progress: {
                currentDay: 1,
                completedDays: [],
                workoutsCompleted: 0,
                totalCaloriesBurned: 0,
                streakDays: 0,
                points: 0,
            },
            weightLog: [],
            moodLog: [],
        });
        
        return { isNewUser: true };
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, resolveMfaSignIn, signUpWithEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
