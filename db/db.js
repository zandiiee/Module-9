
// Import the Firestore database from your Firebase configuration file.
import {db} from '../firebase lesson/config.js'

// Import the Firestore functions used to save, retrieve, update, delete,
// and manage documents in the database.
import {collection, doc, addDoc, getDoc, getDocs, deleteDoc, updateDoc, setDoc, writeBatch} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

// Import the function used to listen for real-time changes in Firestore.
import { onSnapshot } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';


// Create an asynchronous function to retrieve all documents from a collection.
// collectionName specifies which Firestore collection to retrieve.
export async function getAllData(collectionName){

    // Get all documents stored in the specified collection.
    const snapshot = await getDocs(collection(db, collectionName))

    // Convert the documents into an array of objects.
    // Each object contains the document ID and its saved data.
    return snapshot.docs.map((document)=>({
        id:document.id,
        ...document.data()
    }))
}


// Save data with an automatically generated document ID.
export async function saveData(collectionName, data) {

    // Add a new document containing the supplied data to the collection.
    // Firestore automatically generates a unique document ID.
    const docRef = await addDoc(
        collection (db, collectionName),
        data
    );

    // Return the ID of the newly created document.
    return docRef.id
}


// Save data using a specific document ID.
export async function saveDataWithId( collectionName, id, data) {

    // Create or replace the document with the specified ID in the collection.
    await setDoc(doc(db, collectionName, id), data);

    // Return the document ID used to save the data.
    return id;
}


// Retrieve one document using its collection name and document ID.
export async function getDataById( collectionName, id) {

    // Request the specified document from Firestore.
    const snapshot = await getDoc(
        doc(db, collectionName, id)
    );

    // Check whether the requested document exists.
    // Return null if the document cannot be found.
    if (!snapshot.exists()) {
        return null;
    }

    // Return the document ID together with the document's saved data.
    return {
        id: snapshot.id,
        ...snapshot.data()
    };
}


// Update an existing document in Firestore.
export async function updateData(collectionName, id, data) {

    // Find the document using its collection name and ID,
    // then update it with the supplied data.
    await updateDoc(
        doc(db, collectionName, id),
        data
    );
}


// Delete a document from Firestore.
export async function deleteData(collectionName, id) {

    // Find the document using its collection name and ID,
    // then permanently delete that document.
    await deleteDoc(
        doc(db, collectionName, id)
    );
}


// Borrow multiple books for one user.
// userId identifies the user, and bookIds contains the IDs of the selected books.
export async function borrowMultipleBooks(userId, bookIds) {

    // Stop the function if no user ID was provided.
    if (!userId) throw new Error("No user logged in.");

    // Check that bookIds is an array containing at least one book ID.
    // Stop the function if no books were selected.
    if (!Array.isArray(bookIds) || bookIds.length === 0) {
        throw new Error("No books selected.");
    }

    // Create a batch to group multiple Firestore write operations together.
    const batch = writeBatch(db);

    // Reference the collection where borrowed book records will be stored.
    const colRef = collection(db, "booksBorrowed");

    // Calculate a due date 14 days from the current date.
    // Convert the date to a string and keep only the YYYY-MM-DD portion.
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString().split("T")[0];

    // Loop through every selected book ID.
    bookIds.forEach((bookId) => {

        // Create a new document reference with an automatically generated,
        // unique ID for this individual borrowing record.
        const newRef = doc(colRef);

        // Add the borrowing information to the batch.
        // Each book receives its own separate document.
        batch.set(newRef, {

            // Store the ID of the user borrowing the book.
            userId,

            // Store the ID of the book being borrowed.
            bookId,

            // Record the current borrowing status.
            status: "Borrowed",

            // Store the date and time when the borrowing record is created.
            borrowedAt: new Date().toISOString(),

            // Store the date when the book is due to be returned.
            dueDate
        });
    });

    // Save all the borrowing records to Firestore together.
    await batch.commit();

    // Return the number of books processed.
    return bookIds.length;
}


// Listen for real-time changes to a Firestore collection.
// collectionName identifies the collection, and callback handles the updated data.
export function listenToData(collectionName, callback) {

    // Subscribe to the collection so Firestore can notify the app of changes.
    // The listener runs when the collection's data changes.
    return onSnapshot(collection(db, collectionName), (snapshot) => {

        // Convert the collection's documents into an array of objects.
        // Each object contains its document ID and saved data.
        const data = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data()
        }));

        // Pass the latest collection data to the callback function.
        callback(data);
    });
}
