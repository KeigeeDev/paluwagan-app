/**
 * Transaction Service
 * Handles Firestore operations for HULOG (deposits) and UTANG (loans) requests,
 * including interest calculation logic and role-based transaction retrieval.
 */
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    doc,
    updateDoc,
    getDoc,
    writeBatch,
    setDoc
} from "firebase/firestore";
import { db } from "../../config/firebase";

const COLLECTION_NAME = "transactions";

// Helper to get current Fiscal Year
export const getFiscalYear = () => new Date().getFullYear();

/**
 * Archive a Fiscal Year
 * Sets 'isArchived: true' for all transactions in the given year.
 * Ideally, only 'paid' or 'rejected' transactions should be archived,
 * but for now, we allow archiving the whole block.
 */
export const archiveFiscalYear = async (year) => {
    try {
        const batch = writeBatch(db);
        const q = query(
            collection(db, COLLECTION_NAME),
            where("fiscalYear", "==", Number(year))
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) return { success: true, count: 0 };

        snapshot.forEach((doc) => {
            batch.update(doc.ref, { isArchived: true });
        });

        await batch.commit();
        return { success: true, count: snapshot.size };
    } catch (error) {
        console.error("Error archiving year:", error);
        return { success: false, error };
    }
};

/**
 * Creates a HULOG request
 */
export const requestHulog = async (uid, amount, displayName, memberId = null) => {
    try {
        await addDoc(collection(db, COLLECTION_NAME), {
            uid,
            memberId, // Link to specific sub-account if applicable
            beneficiaryName: displayName,
            type: "HULOG",
            amount: Number(amount),
            status: "pending", // Default status
            date: Timestamp.now(),
            fiscalYear: getFiscalYear(),
            isArchived: false,
        });
        return { success: true };
    } catch (error) {
        console.error("Error requesting hulog:", error);
        return { success: false, error };
    }
};

/**
 * Creates an UTANG request
 * Implements Logic #5: 3% Member / 5% Non-member
 * Implements Logic #5: Immediate 1-month interest application
 */
export const requestUtang = async (uid, amount, beneficiaryType, beneficiaryName, memberId = null) => {
    try {
        const principal = Number(amount);

        // Determine Interest Rate
        // If beneficiary is the member themselves, 3%. If "non-member" (friend/relative), 5%.
        const rate = beneficiaryType === "member" ? 0.03 : 0.05;

        // Calculate Initial Interest (1st Month)
        const initialInterest = principal * rate;

        // Initial Balance = Principal + 1st Month Interest
        const initialBalance = principal + initialInterest;

        await addDoc(collection(db, COLLECTION_NAME), {
            uid,
            memberId, // Link to specific sub-account
            type: "UTANG",
            beneficiaryType, // 'member' or 'non-member'
            beneficiaryName,
            principal: principal,
            balance: initialBalance, // Stores the amount WITH interest
            totalInterest: initialInterest, // Track total accumulated interest
            interestRate: rate,
            status: "pending",
            date: Timestamp.now(),
            lastInterestApplied: Timestamp.now(), // Marker for future monthly calculations
            fiscalYear: getFiscalYear(),
            isArchived: false,
        });
        return { success: true };
    } catch (error) {
        console.error("Error requesting utang:", error);
        return { success: false, error };
    }
};

/**
 * Fetch Transactions
 * Admin: Gets ALL (optionally filtered by year)
 * Member: Gets OWN only
 */
export const fetchTransactions = async (userRole, uid, fiscalYear = null) => {
    try {
        const ref = collection(db, COLLECTION_NAME);
        const constraints = [];

        if (userRole !== 'admin') {
            constraints.push(where("uid", "==", uid));
        }

        if (fiscalYear) {
            constraints.push(where("fiscalYear", "==", Number(fiscalYear)));
        } else {
            // Only apply orderBy if NOT filtering by fiscalYear to prevent "Missing Index" error.
            // When filtering by custom field, Firestore requires a Composite Index if also sorting.
            constraints.push(orderBy("date", "desc"));
        }

        const q = query(ref, ...constraints);
        const snapshot = await getDocs(q);

        let transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Manual Sort if using Fiscal Year filter
        if (fiscalYear) {
            transactions.sort((a, b) => b.date.toMillis() - a.date.toMillis());
        }

        return transactions;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
};

/**
 * Requests a Payment for an existing Loan (Utang)
 * Creates a new transaction of type 'PAYMENT' with status 'pending'
 * Admin must approve this to deduct from the Utang balance.
 */
export const requestPayment = async (uid, relatedTransactionId, amount, beneficiaryName, memberId = null) => {
    try {
        await addDoc(collection(db, COLLECTION_NAME), {
            uid,
            memberId, // Link to specific sub-account
            relatedTransactionId, // Link to the original UTANG transaction
            type: "PAYMENT",
            beneficiaryName,
            amount: Number(amount),
            status: "pending",
            date: Timestamp.now(),
            fiscalYear: getFiscalYear(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error requesting payment:", error);
        return { success: false, error };
    }
};

/**
 * Admin: Approve a Payment
 * 1. Checks if payment exists and is pending.
 * 2. Fetches related Utang.
 * 3. Deducts amount from Utang balance.
 * 4. Updates Utang status if paid.
 * 5. Updates Payment status to 'approved'.
 */
export const approvePayment = async (paymentId) => {
    try {
        const paymentRef = doc(db, COLLECTION_NAME, paymentId);
        const paymentSnap = await getDoc(paymentRef);

        if (!paymentSnap.exists()) return { success: false, error: "Payment not found" };
        const paymentData = paymentSnap.data();

        if (paymentData.type !== 'PAYMENT' || paymentData.status !== 'pending') {
            return { success: false, error: "Invalid payment request" };
        }

        const utangRef = doc(db, COLLECTION_NAME, paymentData.relatedTransactionId);
        const utangSnap = await getDoc(utangRef);

        if (!utangSnap.exists()) return { success: false, error: "Related Utang not found" };
        const utangData = utangSnap.data();

        const newBalance = utangData.balance - paymentData.amount;
        // Float precision fix if needed, but simple subtraction usually ok for now.
        // Better: Math.round((utangData.balance - paymentData.amount) * 100) / 100

        const utangStatus = newBalance <= 0.01 ? "paid" : "approved"; // 0.01 tolerance

        // Update Utang
        await updateDoc(utangRef, {
            balance: newBalance,
            status: utangStatus,
            lastPaymentDate: Timestamp.now()
        });

        // Update Payment
        await updateDoc(paymentRef, {
            status: 'approved'
        });

        return { success: true };
    } catch (error) {
        console.error("Approve Payment Error:", error);
        return { success: false, error };
    }
};

/**
 * Admin: Apply Monthly Interest
 * - Scans all 'approved' (unpaid) loans
 * - Adds Interest (Principal * Rate) to Balance
 * - Updates 'lastInterestApplied' date
 */
export const runMonthlyInterestCheck = async () => {
    try {
        const q = query(
            collection(db, "transactions"),
            where("type", "==", "UTANG"),
            where("status", "==", "approved") // Only active loans
        );

        const snapshot = await getDocs(q);
        const updates = [];
        const now = new Date();

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const lastDate = data.lastInterestApplied.toDate();

            // Calculate difference in days
            const diffTime = Math.abs(now - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If more than 30 days have passed since last interest
            if (diffDays >= 30) {
                // Calculation: Interest based on ORIGINAL Principal (Standard Paluwagan logic)
                const interestToAdd = data.principal * data.interestRate;
                const newBalance = data.balance + interestToAdd;

                const currentTotalInterest = data.totalInterest || 0;
                const newTotalInterest = currentTotalInterest + interestToAdd;

                updates.push(updateDoc(docSnap.ref, {
                    balance: newBalance,
                    totalInterest: newTotalInterest,
                    lastInterestApplied: Timestamp.now() // Reset timer
                }));
            }
        });

        await Promise.all(updates);
        return { success: true, count: updates.length };
    } catch (error) {
        console.error("Interest Error:", error);
        return { success: false, error };
    }
};

/**
 * Get Starting Balance for a Fiscal Year
 */
export const getStartingBalance = async (year) => {
    try {
        const docRef = doc(db, "financial_years", String(year));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().startingBalance || 0;
        }
        return 0;
    } catch (error) {
        console.error("Error fetching starting balance:", error);
        return 0;
    }
};

/**
 * Set Starting Balance for a Fiscal Year
 */
export const setStartingBalance = async (year, amount) => {
    try {
        const docRef = doc(db, "financial_years", String(year));
        await setDoc(docRef, {
            startingBalance: Number(amount),
            fiscalYear: Number(year),
            updatedAt: Timestamp.now()
        }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Error setting starting balance:", error);
        return { success: false, error };
    }
};
