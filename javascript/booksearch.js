import { getAllData } from "../db/db.js"; // Make sure this path is correct!

let allBooks = []; // Store all books here once fetched

// ─── 1. FETCH DATA FROM FIREBASE ──────────────────────────────────────
async function loadCatalog() {
    const grid = document.getElementById("searchResultsGrid");
    const countText = document.getElementById("resultsCount");
    
    try {
        // Fetch books from Firebase
        allBooks = await getAllData("Books");
        
        // Display all books initially
        displayResults(allBooks); 
        
    } catch (error) {
        console.error("Error loading catalog:", error);
        if (countText) countText.textContent = "Failed to load catalog.";
        if (grid) grid.innerHTML = `<p style="color: red;">Error connecting to database. Please try again.</p>`;
    }
}

// ─── 2. RENDER BOOKS TO THE SCREEN ────────────────────────────────────
function displayResults(booksToDisplay) {
    const grid = document.getElementById("searchResultsGrid");
    const countText = document.getElementById("resultsCount");
    
    if (!grid) return;

    grid.innerHTML = ""; // Clear previous results
    
    // Update the header text
    if (countText) {
        countText.textContent = `Found ${booksToDisplay.length} results matching your query.`;
    }

    // Handle empty state
    if (booksToDisplay.length === 0) {
        grid.innerHTML = `<p style="padding: 20px;">No books found matching your search.</p>`;
        return;
    }

    // Loop through and build the HTML for each book
    booksToDisplay.forEach(book => {
        // Use fallbacks just in case a field is missing in Firebase
        const title = book.Title || "Unknown Title";
        const author = book.Author || "Unknown Author";
        const cover = book.Cover || "./images/libra_logo.png";
        const genre = book.genre || book.category || "General";
        const description = book.Description || "No description available for this book.";
        
        grid.innerHTML += `
            <div class="book-card" style="margin-bottom: 20px;">
                <img src="${cover}" width="100" alt="${title}" style="border-radius: 4px;">
                <h4 style="margin-top: 10px; margin-bottom: 5px;">
                    <a href="details.html?id=${book.id}" style="text-decoration: none; color: inherit;">${title}</a>
                </h4>
                <p style="margin: 0; font-size: 14px; color: #555;">
                    By ${author} • <span style="color: #888; font-style: italic;">${genre}</span>
                </p>
                <p style="font-size: 14px; margin-top: 10px; line-height: 1.4;">
                    ${description}
                </p>
            </div>
        `;
    });
}

// ─── 3. HANDLE THE SEARCH LOGIC ───────────────────────────────────────
function handleSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    // Get the text, make it lowercase, and remove extra spaces
    const query = searchInput.value.toLowerCase().trim();
    
    // If the search bar is empty, show all books again
    if (query === "") {
        displayResults(allBooks);
        return;
    }

    // Filter the books array based on the query
    const filteredBooks = allBooks.filter(book => {
        // Convert book fields to lowercase for a fair comparison
        const title = (book.Title || "").toLowerCase();
        const author = (book.Author || "").toLowerCase();
        const genre = (book.genre || book.category || "").toLowerCase();
        const isbn = (book.isbn || "").toLowerCase();

        // Check if the query matches any of the fields
        return title.includes(query) || 
               author.includes(query) || 
               genre.includes(query) || 
               isbn.includes(query);
    });

    // Render the filtered results
    displayResults(filteredBooks);
}

// ─── 4. INITIALIZE PAGE ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Load all books immediately when the page opens
    loadCatalog(); 

    // 2. Attach event listeners to the search tools
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");

    // Click the "Search Catalog" button
    if (searchBtn) {
        searchBtn.addEventListener("click", (e) => {
            e.preventDefault(); // Stop the page from refreshing
            handleSearch();
        });
    }

    // Press "Enter" inside the search box
    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
            }
        });

        // Optional: Live search as you type (uncomment the lines below if you want instant results)
        /*
        searchInput.addEventListener("input", () => {
            handleSearch();
        });
        */
    }
});