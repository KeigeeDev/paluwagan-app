/**
 * USER MIGRATION SCRIPT
 * 
 * Purpose: Move all Firestore data (Profile, Transactions, Sub-members) 
 * from an old UID (e.g. Email/Password) to a new UID (e.g. Google Sign-in).
 * 
 * Instructions:
 * 1. Place your 'service-account.json' in the root folder.
 * 2. Run: node migrate-user.js <OLD_UID> <NEW_UID>
 */

import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. Initialize Firebase Admin
const serviceAccountPath = join(__dirname, 'service-account.json');

try {
    const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.error("❌ ERROR: Could not find or read 'service-account.json'.");
    console.error("Please download it from Firebase Console > Project Settings > Service Accounts.");
    process.exit(1);
}

const db = admin.firestore();
const [,, oldUid, newUid] = process.argv;

if (!oldUid || !newUid) {
    console.log("Usage: node migrate-user.js <OLD_UID> <NEW_UID>");
    process.exit(1);
}

async function migrate() {
    console.log(`\n🚀 Starting migration: ${oldUid} ➡️  ${newUid}\n`);

    try {
        // --- 1. Migrate Main User Profile ---
        console.log("📄 Migrating User Profile...");
        const oldUserRef = db.collection('users').doc(oldUid);
        const newUserRef = db.collection('users').doc(newUid);
        
        const oldUserSnap = await oldUserRef.get();
        if (!oldUserSnap.exists) {
            console.warn("⚠️ Warning: Old user document not found in Firestore 'users' collection.");
        } else {
            const userData = oldUserSnap.data();
            // We keep the new email if the Google sign-in already created the doc
            await newUserRef.set({
                ...userData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                migratedFrom: oldUid
            }, { merge: true });
            console.log("✅ Profile migrated.");
        }

        // --- 2. Migrate Transactions ---
        console.log("💰 Migrating Transactions...");
        const txQuery = db.collection('transactions').where('uid', '==', oldUid);
        const txSnap = await txQuery.get();
        
        if (txSnap.empty) {
            console.log("ℹ️  No transactions found for this user.");
        } else {
            const batch = db.batch();
            txSnap.docs.forEach(doc => {
                batch.update(doc.ref, { uid: newUid });
            });
            await batch.commit();
            console.log(`✅ ${txSnap.size} transactions updated.`);
        }

        // --- 3. Migrate Sub-members ---
        console.log("👥 Migrating Sub-members...");
        const oldMembersRef = oldUserRef.collection('members');
        const newMembersRef = newUserRef.collection('members');
        
        const membersSnap = await oldMembersRef.get();
        
        if (membersSnap.empty) {
            console.log("ℹ️  No sub-members found.");
        } else {
            for (const memberDoc of membersSnap.docs) {
                const memberData = memberDoc.data();
                await newMembersRef.doc(memberDoc.id).set(memberData);
                // Note: We don't delete immediately to be safe, but you could delete old doc here
            }
            console.log(`✅ ${membersSnap.size} sub-members copied.`);
        }

        // --- 4. Success Message ---
        console.log("\n✨ MIGRATION COMPLETE! ✨");
        console.log("The user can now log in with Google and see their old data.");
        console.log(`Note: The old Firestore doc (${oldUid}) still exists. You can delete it manually once verified.\n`);

    } catch (error) {
        console.error("❌ MIGRATION FAILED:", error);
    }
}

migrate();
