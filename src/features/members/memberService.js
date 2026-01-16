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
            status: 'pending', // Default status for new sub-members
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

/**
 * Admin: Fetch ALL users and their linked members
 * Used for the Members Page to show a flat or nested list of all participants
 */
export const fetchAllMembersWithSubMembers = async () => {
    try {
        const usersRef = collection(db, USERS_COLLECTION);
        const usersSnap = await getDocs(usersRef);

        const allData = [];

        // For each user (Main Member), fetch their details AND their sub-members
        for (const userDoc of usersSnap.docs) {
            const userData = { id: userDoc.id, ...userDoc.data(), type: 'MAIN' };
            allData.push(userData);

            // Fetch sub-members
            const subMembers = await getLinkedMembers(userDoc.id);
            subMembers.forEach(sub => {
                allData.push({
                    ...sub,
                    parentId: userDoc.id,
                    parentName: userData.displayName || userData.email,
                    type: 'SUB'
                });
            });
        }

        return allData;
    } catch (error) {
        console.error("Error fetching all members:", error);
        return [];
    }
};

/**
 * Admin: Approve a Sub-member
 */
export const approveSubMember = async (parentId, subMemberId) => {
    try {
        const ref = doc(db, USERS_COLLECTION, parentId, MEMBERS_SUBCOLLECTION, subMemberId);
        await updateDoc(ref, { status: 'approved' });
        return { success: true };
    } catch (error) {
        console.error("Error approving member:", error);
        return { success: false, error };
    }
};

/**
 * Admin: Reject a Sub-member
 */
export const rejectSubMember = async (parentId, subMemberId) => {
    try {
        const ref = doc(db, USERS_COLLECTION, parentId, MEMBERS_SUBCOLLECTION, subMemberId);
        await updateDoc(ref, { status: 'rejected' });
        return { success: true };
    } catch (error) {
        console.error("Error rejecting member:", error);
        return { success: false, error };
    }
};
