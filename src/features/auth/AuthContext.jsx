/**
 * AuthContext Module
 * 
 * This module provides a React Context for managing authentication state throughout the application.
 * It integrates with Firebase Authentication and Firestore to handle:
 * - User login/logout functionality
 * - Real-time tracking of the current user's authentication state
 * - Fetching and storing the user's role ('admin' or 'member') from Firestore upon login
 * - Exposing auth state and methods via the `useAuth` hook and `AuthProvider` component
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'admin' or 'member'
    const [userProfile, setUserProfile] = useState(null); // Firestore profile data
    const [loading, setLoading] = useState(true);

    // Function to Login
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Function to Signup
    async function signup(email, password, displayName) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        // Create user document in Firestore
        const userDocRef = doc(db, "users", user.uid);
        const newProfile = {
            email: user.email,
            displayName: displayName || "",
            role: "member",
            createdAt: new Date().toISOString()
        };

        await setDoc(userDocRef, newProfile);

        // Update local state immediately
        setUserRole("member");
        setUserProfile(newProfile);
        setCurrentUser(user);

        return result;
    }

    // Function to Logout
    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        // Firebase listener: triggers whenever auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    // If user is logged in, fetch their Role from Firestore 'users' collection
                    const userDocRef = doc(db, "users", user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserRole(data.role);
                        setUserProfile(data);
                    } else {
                        // If user exists in Auth but not DB, create a default profile
                        console.warn("User document not found, creating default profile.");
                        const newProfile = {
                            email: user.email,
                            role: "member",
                            createdAt: new Date().toISOString()
                        };
                        await setDoc(userDocRef, newProfile);
                        setUserRole("member");
                        setUserProfile(newProfile);
                    }
                    setCurrentUser(user);
                } else {
                    setCurrentUser(null);
                    setUserRole(null);
                    setUserProfile(null);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                // Fallback to member role if there's a permission issue or other error
                // This allows the app to load even if Firestore rules are blocking read
                setCurrentUser(user);
                setUserRole("member");
                setUserProfile(null);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        userProfile,
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
