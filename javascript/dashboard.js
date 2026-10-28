import { getAllData, saveData } from "../db/db.js";
import { getUserProfile, getUser } from "../Auth/auth.js";

let userUid = null;

// ─── 1. SHUFFLE HELPER ────────────────────────────────────────────────
function shuffleArray(array) {
    const shuffled = [...array]; 
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ─── 2. LOAD USER INFO ────────────────────────────────────────────────
async function handleUser() {
    const profile = await getUserProfile(); 
    
    if (profile) {
        userUid = profile.uid;
        const welcomeHeader = document.getElementById("welcomeUser");
        if (welcomeHeader) {
            welcomeHeader.textContent = `Welcome, ${profile.name}!`;
        }
    }
}

// ─── 3. LOAD MAIN DASHBOARD CARDS ─────────────────────────────────────
async function loadDashboard() {
    await handleUser();

    try {
        const [books, borrows] = await Promise.all([
            getAllData("Books"),
            getAllData("booksBorrowed")
        ]);

        const alreadyBorrowedBookIds = new Set(
            borrows
                .filter((b) => b.userId === userUid && b.status === "Borrowed")
                .map((b) => b.bookId)
        );

        // Shuffle books and grab 3 random ones they haven't borrowed
        const availableBooks = books.filter(book => !alreadyBorrowedBookIds.has(book.id));
        const randomBooks = shuffleArray(availableBooks).slice(0, 3);

        const containerIds = ["FBheader", "SBheader", "TBheader"];

        containerIds.forEach((id, index) => {
            const container = document.getElementById(id);
            const book = randomBooks[index];

            if (!container) return;

            if (!book) {
                container.innerHTML = "<p>No book available.</p>";
                return;
            }

            const isBorrowed = alreadyBorrowedBookIds.has(book.id);

            // Build the card with Borrow, Reserve, and Favourite buttons
            container.innerHTML = `
                <div class="bookimage">
                    <img
                        src="${book.Cover || "./images/libra_logo.png"}"
                        width="100px"
                        alt="${book.Title || "Book cover"}"
                    >
                </div>

                <h2>${book.Title || "Unknown Title"}</h2>
                <p>By ${book.Author || "Unknown Author"} - Published ${book["Year published"] || "N/A"}</p>

                <p>Borrowed: ${isBorrowed ? "Yes" : "No"}</p>
                <p>Due: ${isBorrowed
                    ? (borrows.find(
                        (b) => b.userId === userUid &&
                               b.bookId === book.id &&
                               b.status === "Borrowed"
                      )?.dueDate || "N/A")
                    : "—"}</p>

                <div class="book-actions">
                    <button type="button" class="btn-borrow borrowButton" ${isBorrowed ? "disabled" : ""}>
                        ${isBorrowed ? "Borrowed" : "Borrow"}
                    </button>
                    
                    <button type="button" class="btn-reserve reserveButton">
                        Reserve
                    </button>
                    
                    <button type="button" class="btn-fav favButton">
                        <i class="fa-regular fa-heart"></i> Favourite
                    </button>
                </div>
            `;

            // ─── BUTTON LISTENERS ───

            // 1. Borrow Button
            const borrowButton = container.querySelector(".borrowButton");
            borrowButton.addEventListener("click", async () => {
                if (!userUid) return alert("Please log in first.");

                try {
                    await saveData("booksBorrowed", {
                        userId: userUid,
                        bookId: book.id,
                        title: book.Title || "Unknown Title",
                        author: book.Author || "Unknown Author",
                        status: "Borrowed",
                        borrowedAt: new Date().toISOString(),
                        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                            .toISOString().split("T")[0]
                    });

                    alert("Book borrowed successfully!");
                    borrowButton.disabled = true;
                    borrowButton.textContent = "Borrowed";
                } catch (error) {
                    console.error("Could not save book:", error);
                    alert("Failed to borrow book.");
                }
            });

            // 2. Reserve Button
            const reserveButton = container.querySelector(".reserveButton");
            reserveButton.addEventListener("click", async () => {
                if (!userUid) return alert("Please log in first.");

                try {
                    await saveData("reservedBooks", {
                        userId: userUid,
                        bookId: book.id,
                        title: book.Title || "Unknown Title",
                        author: book.Author || "Unknown Author",
                        status: "Reserved",
                        reservedAt: new Date().toISOString()
                    });

                    alert(`"${book.Title}" has been reserved!`);
                    reserveButton.textContent = "Reserved";
                    reserveButton.disabled = true;
                } catch (error) {
                    console.error("Reserve error:", error);
                    alert("Could not reserve book.");
                }
            });

            // 3. Favourite Button
            const favButton = container.querySelector(".favButton");
            favButton.addEventListener("click", async () => {
                if (!userUid) return alert("Please log in first.");

                try {
                    await saveData("favourites", {
                        userId: userUid,
                        bookId: book.id,
                        title: book.Title || "Unknown Title",
                        author: book.Author || "Unknown Author",
                        addedAt: new Date().toISOString()
                    });

                    alert(`"${book.Title}" added to favourites!`);
                    favButton.innerHTML = `<i class="fa-solid fa-heart"></i> Favourited`;
                    favButton.disabled = true;
                } catch (error) {
                    console.error("Favourite error:", error);
                    alert("Could not add to favourites.");
                }
            });
        });

    } catch (error) {
        console.error("Failed to load dashboard:", error);
    }
}

// ─── 4. LOAD SIDEBAR RECOMMENDATIONS ──────────────────────────────────
async function loadRecommendedSidebar() {
    try {
        const books = await getAllData("Books");
        const randomSidebarBooks = shuffleArray(books).slice(0, 3);
        const sidebarIds = ["rec1", "rec2", "rec3"];

        sidebarIds.forEach((id, index) => {
            const container = document.getElementById(id);
            const book = randomSidebarBooks[index];

            if (!container || !book) return;

            container.innerHTML = `
                <div id="rp${index + 1}">
                    <img 
                        src="${book.Cover || './images/libra_logo.png'}" 
                        width="100" 
                        alt="${book.Title}"
                    >
                </div>
                <h2>${book.Title || "Unknown Title"}</h2>
                <p>${book.Author || "Unknown Author"}</p>
            `;
        });
    } catch (error) {
        console.error("Error loading recommended books:", error);
    }
}

// ─── 5. LOAD STATS CARDS ──────────────────────────────────────────────
async function loadStatsCards() {
    const currentUid = await getUser(); 
    if (!currentUid) return;

    try {
        const allBorrows = await getAllData("booksBorrowed");
        
        // Only this user's active borrows
        const myBorrows = allBorrows.filter(b => b.userId === currentUid && b.status === "Borrowed");

        // Card 1: Capacity
        document.getElementById("borrowedCount").textContent = myBorrows.length;
        const msgEl = document.getElementById("borrowedMessage");
        if (myBorrows.length > 0) {
            msgEl.textContent = `${myBorrows.length} book(s) currently checked out.`;
        } else {
            msgEl.textContent = "No books currently checked out.";
        }

        // Card 2: Pending Item
        const pendingTitleEl = document.getElementById("pendingBookTitle");
        document.getElementById("pendingCount").textContent = myBorrows.length;
        if (myBorrows.length > 0) {
            pendingTitleEl.textContent = myBorrows[0].title || "Unknown Book";
        } else {
            pendingTitleEl.textContent = "You are all caught up.";
        }

        // Card 3: Fines
        document.getElementById("finesTotal").textContent = "0.00";
        const today = new Date().toISOString().split("T")[0]; 
        const overdue = myBorrows.filter(b => b.dueDate && b.dueDate < today);
        
        if (overdue.length > 0) {
            document.getElementById("finesMessage").textContent = `You have ${overdue.length} overdue book(s).`;
            document.getElementById("finesMessage").style.color = "red"; 
        } else {
            document.getElementById("finesMessage").textContent = "No account fines or overdue fees.";
            document.getElementById("finesMessage").style.color = "inherit";
        }

    } catch (error) {
        console.error("Error loading stats cards:", error);
    }
}

// ─── INITIALIZE EVERYTHING ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();           
    loadStatsCards();          
    loadRecommendedSidebar();  
});