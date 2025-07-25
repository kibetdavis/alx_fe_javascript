let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Stay hungry, stay foolish.", category: "Inspiration" },
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveSelectedCategory(category) {
  localStorage.setItem("selectedCategory", category);
}

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
    filterQuotes();
  }
}

function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available in this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>- ${quote.category}</small>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function filterQuotes() {
  saveSelectedCategory(document.getElementById("categoryFilter").value);
  showRandomQuote();
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    populateCategories();
    showRandomQuote();
    syncQuoteToServer(newQuote);
  }
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        showRandomQuote();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (error) {
      alert("Error importing file: " + error.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ✅ Sync all local quotes to the server (example POST)
async function syncQuotes() {
  for (const quote of quotes) {
    await syncQuoteToServer(quote);
  }
  notifyUser("All quotes synced with the server.");
}

// ✅ Sync a single quote
async function syncQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: quote.text,
        body: quote.category,
        userId: 1
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Quote synced to server:", data);
    } else {
      console.error("Server sync failed with status:", response.status);
    }
  } catch (error) {
    console.error("Error syncing to server:", error);
  }
}

// ✅ Periodically fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    quotes = serverQuotes;
    saveQuotes();
    populateCategories();
    showRandomQuote();
    notifyUser("Quotes synced with server. Local data overridden.");
  } catch (error) {
    console.error("Server sync failed:", error);
  }
}

// ✅ Show user a sync notification
function notifyUser(message) {
  const msg = document.createElement("div");
  msg.textContent = message;
  msg.style.background = "#ffeb3b";
  msg.style.padding = "10px";
  msg.style.margin = "10px 0";
  msg.style.border = "1px solid #ccc";
  document.body.prepend(msg);
  setTimeout(() => msg.remove(), 4000);
}

// ✅ Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);

// ✅ Initial setup
populateCategories();
showRandomQuote();
setInterval(fetchQuotesFromServer, 30000);  // Every 30 seconds
