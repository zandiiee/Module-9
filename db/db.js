import {db} from '../firebase lesson/config.js'
import {collection, doc, addDoc, getDoc, getDocs, deleteDoc, updateDoc, setDoc, writeBatch} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';
import { onSnapshot } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

export async function getAllData(collectionName){
    const snapshot = await getDocs(collection(db, collectionName))

    return snapshot.docs.map((document)=>({
        id:document.id,
        ...document.data()


    })) 
}

// save data with an automatically generated ID
export async function saveData(collectionName, data) {
    const docRef = await addDoc(
        collection (db, collectionName),
        data
    );

    return docRef.id
}

// save data using a specific document ID
export async function saveDataWithId( collectionName, id, data) { 
    await setDoc(doc(db, collectionName, id), data);
    return id;
}

//retrieve one document by ID
export async function getDataById( collectionName, id) {
    const snapshot = await getDoc(
        doc(db, collectionName, id)
    );

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...snapshot.data()

    };

}

//update an existing document
export async function updateData(collectionName, id, data) {
    await updateDoc(
        doc(db, collectionName, id),
        data
    );
}

// delete a document
export async function deleteData(collectionName, id) {
    await deleteDoc(
        doc(db, collectionName, id)
    );
}


export async function borrowMultipleBooks(userId, bookIds) {
    if (!userId) throw new Error("No user logged in.");
    if (!Array.isArray(bookIds) || bookIds.length === 0) {
        throw new Error("No books selected.");
    }

    const batch = writeBatch(db);
    const colRef = collection(db, "booksBorrowed");
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString().split("T")[0];

    bookIds.forEach((bookId) => {
        const newRef = doc(colRef); // auto ID, guaranteed unique
        batch.set(newRef, {
            userId,
            bookId,
            status: "Borrowed",
            borrowedAt: new Date().toISOString(),
            dueDate
        });
    });

    await batch.commit();
    return bookIds.length;
}

export function listenToData(collectionName, callback) {
    return onSnapshot(collection(db, collectionName), (snapshot) => {
        const data = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data()
        }));
        callback(data);
    });
}