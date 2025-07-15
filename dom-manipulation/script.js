let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Stay hungry, stay foolish.", category: "Inspiration" }
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
    quotes.push({ text, category });
    saveQuotes();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    populateCategories();
    showRandomQuote();
  }
}

function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  formDiv.appendChild(inputText);
  formDiv.appendChild(inputCategory);
  formDiv.appendChild(addBtn);

  document.body.appendChild(formDiv);
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

// ---------- ✅ Simulated Server Sync ----------
function syncWithServer() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => response.json())
    .then(serverData => {
      const serverQuotes = serverData.slice(0, 5).map(post => ({
        text: post.title,
        category: "Server"
      }));

      // Server wins: overwrite local quotes
      quotes = serverQuotes;
      saveQuotes();
      populateCategories();
      showRandomQuote();

      notifyUser("Quotes synced with server. Local data overridden.");
    })
    .catch(error => {
      console.error("Server sync failed:", error);
    });
}

// Show sync notification
function notifyUser(message) {
  const msg = document.createElement("div");
  msg.textContent = message;
  msg.style.background = "#ffdd57";
  msg.style.padding = "10px";
  msg.style.marginTop = "10px";
  document.body.insertBefore(msg, document.body.firstChild);
  setTimeout(() => msg.remove(), 4000);
}

// ---------- ✅ Init ----------
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);

createAddQuoteForm();
populateCategories();
showRandomQuote();

// 🔁 Periodic sync every 20 seconds
setInterval(syncWithServer, 20000);
