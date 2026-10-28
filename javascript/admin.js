import { getAllData } from "../db/db.js"; // Make sure this path is correct!

// ─── 1. LOAD THE 4 TOP CARDS ──────────────────────────────────────────
async function loadAdminStats() {
    try {
        // Fetch all data in parallel for speed
        const [allBooks, allBorrows, allUsers] = await Promise.all([
            getAllData("Books"),
            getAllData("booksBorrowed"),
            getAllData("users")
        ]);

        // 1. Total Library Books
        const totalBooks = allBooks.length;
        document.getElementById("totalBooksCount").textContent = totalBooks.toLocaleString();

        // 2. Currently Borrowed
        const activeBorrows = allBorrows.filter(b => b.status === "Borrowed");
        const totalBorrowed = activeBorrows.length;
        document.getElementById("borrowedBooksCount").textContent = totalBorrowed.toLocaleString();

        // 3. Available Books
        const availableBooks = totalBooks - totalBorrowed;
        document.getElementById("availableBooksCount").textContent = Math.max(0, availableBooks).toLocaleString();

        // 4. Total Active Members
        const totalMembers = allUsers.length;
        document.getElementById("totalMembersCount").textContent = totalMembers.toLocaleString();

        // Progress bar
        const memberGoal = 2000; 
        let progressPercentage = (totalMembers / memberGoal) * 100;
        if (progressPercentage > 100) progressPercentage = 100; 
        document.getElementById("membersProgressBar").style.width = `${progressPercentage}%`;

    } catch (error) {
        console.error("Error loading admin stats:", error);
    }
}

// ─── 2. LOAD RECENT ACTIVITY LIST ─────────────────────────────────────
async function loadRecentActivity() {
    const container = document.getElementById("circulationList");
    if (!container) return;

    try {
        const [borrows, books] = await Promise.all([
            getAllData("booksBorrowed"),
            getAllData("Books")
        ]);

        // Sort newest first
        const sortedBorrows = borrows.sort((a, b) => {
            return new Date(b.borrowedAt) - new Date(a.borrowedAt);
        });

        // Get top 5
        const recentBorrows = sortedBorrows.slice(0, 5); 
        container.innerHTML = ""; 

        if (recentBorrows.length === 0) {
            container.innerHTML = "<p>No recent activity.</p>";
            return;
        }

        recentBorrows.forEach(borrow => {
            const bookDetails = books.find(b => b.id === borrow.bookId);
            const coverImage = bookDetails?.Cover || "./images/libra_logo.png";

            const borrowedDate = borrow.borrowedAt 
                ? new Date(borrow.borrowedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                : "Unknown";
                
            const dueDate = borrow.dueDate 
                ? new Date(borrow.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                : "No due date";

            container.innerHTML += `
                <article class="book-activity-card" style="display: flex; gap: 20px; margin-bottom: 30px; align-items: flex-start;">
                    <div>
                        <img src="${coverImage}" width="100" style="border-radius: 4px;">
                    </div>
                    <div>
                        <h2 style="margin-top: 0; margin-bottom: 10px;">${borrow.title || "Unknown Title"}</h2>
                        <p style="margin: 5px 0;">By ${borrow.author || "Unknown Author"}</p>
                        <p style="margin: 5px 0; color: #555;">Borrowed: ${borrowedDate}</p>
                        <p style="margin: 5px 0; color: #555;">Due: ${dueDate}</p>
                        <span style="font-size: 12px; padding: 3px 8px; background: #e0e0e0; border-radius: 12px;">
                            ${borrow.status || "Borrowed"}
                        </span>
                    </div>
                </article>
            `;
        });

    } catch (error) {
        console.error("Error loading recent activity:", error);
        container.innerHTML = "<p>Could not load recent activity.</p>";
    }
}


    async function loadAdminUpdates() {
    try {
        // Fetch borrowed books and users
        const [borrows, users] = await Promise.all([
            getAllData("booksBorrowed"),
            getAllData("users")
        ]);

        // ─── 1. Returned Books ───
        // We count how many records have the status "Returned"
        const returnedBooks = borrows.filter(b => b.status === "Returned");
        document.getElementById("returnedBooksText").textContent = 
            `${returnedBooks.length.toLocaleString()} books have been returned recently.`;

        // ─── 2. Staff Check-in ───
        // Since we don't have a "clock-in" system, we will show the total active members
        const totalMembers = users.length;
        document.getElementById("staffCheckinText").textContent = 
            `${totalMembers.toLocaleString()} members are currently registered in the system.`;

    } catch (error) {
        console.error("Error loading admin updates:", error);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    loadAdminStats();
    loadRecentActivity();
    loadAdminUpdates(); // <-- Add this
});