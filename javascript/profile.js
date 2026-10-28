import { deleteData } from "../db/db.js";
import { getAllData } from "../db/db.js";
import { getUser } from "../Auth/auth.js";
import { getUserProfile } from "../Auth/auth.js";

document.getElementById("borrowedBooks").addEventListener("click", async (event) => {
    const button = event.target.closest(".returnButton");
    if (!button) return;

    try {
        await deleteData("booksBorrowed", button.dataset.id);
        alert("Book returned successfully!");
        displayBorrowedBooks();
    } catch (error) {
        console.error(error);
        alert("Could not return the book.");
    }
});

// ─── Render the borrowed books list ──────────────────────────────────
async function displayBorrowedBooks() {
    const table = document.getElementById("borrowedBooks");
    const userUid = await getUser();

    if (!userUid) {
        table.innerHTML = `<tr><td colspan="4">Please log in.</td></tr>`;
        return;
    }

    try {
        const books = await getAllData("booksBorrowed");

        // Only show this user's active borrows
        const mine = books.filter(
            (b) => b.userId === userUid && b.status === "Borrowed"
        );

        table.innerHTML = "";

        if (mine.length === 0) {
            table.innerHTML = `<tr><td colspan="4">You have no borrowed books.</td></tr>`;
            return;
        }

        mine.forEach((book) => {
            table.innerHTML += `
                <tr>
                    <td>
                        <div class="book-info">
                            <div class="book-cover">
                                <i class="fa-solid fa-book"></i>
                            </div>
                            <div>
                                <div class="book-title">${book.title || "Unknown Title"}</div>
                                <div class="book-author">${book.author || "Unknown Author"}</div>
                            </div>
                        </div>
                    </td>

                    <td>
                        <div class="info-value">
                            ${book.dueDate || "No due date"}
                        </div>
                    </td>

                    <td>
                        <span class="status-badge status-available">
                            Active
                        </span>
                    </td>

                    <td>
                        <button
                            class="returnButton"
                            data-id="${book.id}"
                            type="button">
                            Return Book
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Failed to load borrowed books:", error);
        table.innerHTML = `<tr><td colspan="4">Could not load books.</td></tr>`;
    }
}

async function displayUserInfo() {
    const profile = await getUserProfile();

    const nameEl = document.getElementById("profileName");
    const emailEl = document.getElementById("profileEmail");

    if (profile && nameEl && emailEl) {
        // 1. Set the Name (just plain text inside the H1)
        nameEl.textContent = profile.name || "Unknown User";

        // 2. Set the Email (keeping the envelope icon intact!)
        emailEl.innerHTML = `<i class="fa-regular fa-envelope"></i> ${profile.email || "No email"}`;
    }
}

// Initial render
displayBorrowedBooks();
displayUserInfo();