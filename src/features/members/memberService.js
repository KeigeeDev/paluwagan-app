import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    Timestamp
} from "firebase/firestore";
import { db } from "../../config/firebase";

const USERS_COLLECTION = "users";
const MEMBERS_SUBCOLLECTION = "members";

/**
 * Add a new linked member to a user's account
 * @param {string} userId - The main auth user ID
 * @param {object} memberData - { name, relationship, etc }
 */
export const addLinkedMember = async (userId, memberData) => {
    try {
        console.log("Adding linked member for UserID:", userId);
        const membersRef = collection(db, USERS_COLLECTION, userId, MEMBERS_SUBCOLLECTION);
        const docRef = await addDoc(membersRef, {
            ...memberData,
            createdAt: Timestamp.now()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding linked member:", error);
        return { success: false, error };
    }
};

/**
 * Get all linked members for a user
 * @param {string} userId 
 */
export const getLinkedMembers = async (userId) => {
    try {
        const membersRef = collection(db, USERS_COLLECTION, userId, MEMBERS_SUBCOLLECTION);
        const q = query(membersRef, orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching linked members:", error);
        return [];
    }
};
