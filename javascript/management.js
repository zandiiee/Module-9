import { listenToData } from "../db/db.js";

// ─── 1. HELPER FUNCTION ───────────────────────────────────────────────
function getRandomColorClass() {
    const colors = ["c1", "c2", "c3"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ─── 2. RENDER INVENTORY TABLE ────────────────────────────────────────
function renderTable(books, borrows) {
    const tbody = document.getElementById("inventoryTableBody");
    if (!tbody) return;

    tbody.innerHTML = ""; 

    if (books.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">No books found in database.</td></tr>`;
        return;
    }

    const countText = document.getElementById("recordCount");
    if (countText) {
        countText.textContent = `Showing 1-${books.length} of ${books.length} records`;
    }

    books.forEach(book => {
        const totalCopies = book.totalCopies || 1;
        const genre = book.genre || "General";
        const isbn = book.isbn || "N/A";
        const shelf = book.shelf || "N/A";

        const activeBorrows = borrows.filter(b => b.bookId === book.id && b.status === "Borrowed").length;
        let availableCopies = totalCopies - activeBorrows;
        if (availableCopies < 0) availableCopies = 0; 

        const percentAvailable = totalCopies > 0 ? (availableCopies / totalCopies) * 100 : 0;
        let barColorClass = "green";
        if (percentAvailable === 0) barColorClass = "yellow";
        else if (percentAvailable < 100) barColorClass = "blue";

        const isAvailable = availableCopies > 0;
        const statusText = isAvailable ? "Available" : "Checked Out";
        const statusClass = isAvailable ? "status-available" : "status-out";

        tbody.innerHTML += `
            <tr>
                <td>
                    <div class="book-info">
                        <div class="book-cover ${getRandomColorClass()}"><i class="fa-solid fa-book"></i></div>
                        <div>
                            <div class="book-title">${book.Title || "Unknown Title"}</div>
                            <div class="book-author">${book.Author || "Unknown Author"}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="isbn-shelf">
                        <div><i class="fa-regular fa-barcode"></i> ${isbn}</div>
                        <div class="shelf"><i class="fa-solid fa-layer-group"></i> ${shelf}</div>
                    </div>
                </td>
                <td><span class="category-badge">${genre}</span></td>
                <td>
                    <div class="copies-info">
                        ${availableCopies} / ${totalCopies} Available 
                        ${activeBorrows > 0 ? `<span class="copies-sub">${activeBorrows} on loan</span>` : ''}
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${barColorClass}" style="width: ${percentAvailable}%;"></div>
                    </div>
                </td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="actions">
                        <i class="fa-solid fa-pencil" title="Edit"></i>
                        <i class="fa-regular fa-trash-can" title="Delete"></i>
                    </div>
                </td>
            </tr>
        `;
    });
}

// ─── 3. RENDER GENRE COUNTS ───────────────────────────────────────────
function renderGenreList(books) {
    const listContainer = document.getElementById("genreCountList");
    if (!listContainer) return;

    if (books.length === 0) {
        listContainer.innerHTML = `<li style="padding: 10px; color: #666;">No books in database.</li>`;
        return;
    }

    const genreCounts = {};
    books.forEach(book => {
        const gen = book.genre || "Uncategorized"; 
        genreCounts[gen] = (genreCounts[gen] || 0) + 1;
    });

    const sortedGenres = Object.keys(genreCounts)
        .map(gen => ({ name: gen, count: genreCounts[gen] }))
        .sort((a, b) => b.count - a.count);

    listContainer.innerHTML = "";
    sortedGenres.forEach(genre => {
        listContainer.innerHTML += `
            <li style="display: flex; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px;">
                <span style="font-weight: 500; color: #333;">${genre.name}</span>
                <span style="background: #e0e7ff; color: #4f46e5; padding: 2px 10px; border-radius: 12px; font-weight: 600;">
                    ${genre.count} ${genre.count === 1 ? 'Book' : 'Books'}
                </span>
            </li>
        `;
    });
}

// ─── 4. START LIVE LISTENERS ──────────────────────────────────────────
function startLiveUpdates() {
    let currentBooks = [];
    let currentBorrows = [];

    listenToData("Books", (books) => {
        currentBooks = books;
        renderTable(currentBooks, currentBorrows);
        renderGenreList(currentBooks); 
    });

    listenToData("booksBorrowed", (borrows) => {
        currentBorrows = borrows;
        renderTable(currentBooks, currentBorrows);
    });
}

// Run when the page loads
document.addEventListener("DOMContentLoaded", startLiveUpdates);