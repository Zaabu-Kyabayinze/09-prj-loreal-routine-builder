/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Get reference to the selected products section */
const selectedProductsList = document.getElementById("selectedProductsList");

/* Get reference to the "Generate Routine" button */
const generateRoutineBtn = document.getElementById("generateRoutine");

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Keep track of selected products in an array */
let selectedProducts = [];

/* Helper function to update the Selected Products section */
function updateSelectedProducts() {
  // Save to localStorage every time the list changes
  saveSelectedProducts();

  // If no products are selected, show a message
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = `<div class="placeholder-message">No products selected yet.</div>`;
    // Remove "Clear All" button if present
    const clearBtn = document.getElementById("clearAllBtn");
    if (clearBtn) clearBtn.remove();
    return;
  }

  // Show each selected product with a remove button
  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product, idx) => `
      <div class="selected-product-item" data-index="${idx}">
        <img src="${product.image}" alt="${product.name}" />
        <span>${product.name}</span>
        <button class="remove-selected-btn" title="Remove">
          <i class="fa fa-times"></i>
        </button>
      </div>
    `
    )
    .join("");

  // Add "Clear All" button if not already present
  if (!document.getElementById("clearAllBtn")) {
    const clearBtn = document.createElement("button");
    clearBtn.id = "clearAllBtn";
    clearBtn.className = "generate-btn";
    clearBtn.style.marginTop = "10px";
    clearBtn.style.background = "#c00";
    clearBtn.style.fontSize = "16px";
    clearBtn.innerHTML = '<i class="fa fa-trash"></i> Clear All';
    clearBtn.onclick = clearAllSelectedProducts;
    selectedProductsList.parentElement.appendChild(clearBtn);
  }
}

/* Helper function to save selected products to localStorage */
function saveSelectedProducts() {
  // Save only the necessary fields to localStorage as a JSON string
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

/* Helper function to load selected products from localStorage */
function loadSelectedProducts() {
  const saved = localStorage.getItem("selectedProducts");
  if (saved) {
    try {
      selectedProducts = JSON.parse(saved);
    } catch (e) {
      selectedProducts = [];
    }
  }
}

/* Helper function to clear all selected products from localStorage and UI */
function clearAllSelectedProducts() {
  selectedProducts = [];
  saveSelectedProducts();
  updateSelectedProducts();
  // Refresh grid to update highlights
  const selectedCategory = categoryFilter.value;
  if (selectedCategory) {
    loadProducts().then((products) => {
      const filteredProducts = products.filter(
        (product) => product.category === selectedCategory
      );
      displayProducts(filteredProducts);
    });
  }
}

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards, with selection logic and description toggle */
function displayProducts(products) {
  // Keep track of which descriptions are expanded
  // We'll use a Set to store product names that are expanded
  if (!window.expandedDescriptions) {
    window.expandedDescriptions = new Set();
  }

  productsContainer.innerHTML = products
    .map((product) => {
      // Check if this product is selected
      const isSelected = selectedProducts.some(
        (p) => p.name === product.name && p.brand === product.brand
      );
      // Check if description is expanded for this product
      const isExpanded = window.expandedDescriptions.has(product.name);
      // Add a CSS class if selected
      const selectedClass = isSelected ? "selected" : "";
      return `
        <div class="product-card ${selectedClass}" data-name="${
        product.name
      }" data-brand="${product.brand}">
          <img src="${product.image}" alt="${product.name}">
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.brand}</p>
            <button class="desc-toggle-btn" type="button">
              ${isExpanded ? "Hide Description" : "Show Description"}
            </button>
            <div class="product-desc" style="display:${
              isExpanded ? "block" : "none"
            };">
              ${
                product.description
                  ? product.description
                  : "No description available."
              }
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  // Add click event listeners to each product card for selection
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card, idx) => {
    // Only toggle selection if not clicking the description button
    card.addEventListener("click", (event) => {
      if (event.target.classList.contains("desc-toggle-btn")) {
        return; // Don't select/unselect if clicking the description button
      }
      const name = card.getAttribute("data-name");
      const brand = card.getAttribute("data-brand");
      const product = products.find(
        (p) => p.name === name && p.brand === brand
      );
      const index = selectedProducts.findIndex(
        (p) => p.name === name && p.brand === brand
      );
      if (index === -1) {
        selectedProducts.push(product);
      } else {
        selectedProducts.splice(index, 1);
      }
      updateSelectedProducts();
      displayProducts(products); // Refresh grid to update highlights
    });
  });

  // Add click event listeners to each "Show Description" button
  const descButtons = document.querySelectorAll(".desc-toggle-btn");
  descButtons.forEach((btn, idx) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent card selection
      const card = btn.closest(".product-card");
      const name = card.getAttribute("data-name");
      // Toggle description for this product
      if (window.expandedDescriptions.has(name)) {
        window.expandedDescriptions.delete(name);
      } else {
        window.expandedDescriptions.add(name);
      }
      displayProducts(products); // Refresh grid to show/hide description
    });
  });
}

/* On page load, restore selected products from localStorage */
loadSelectedProducts();
updateSelectedProducts();

/* Remove product from selected list when clicking the remove button */
selectedProductsList.addEventListener("click", (e) => {
  if (e.target.closest(".remove-selected-btn")) {
    const item = e.target.closest(".selected-product-item");
    const idx = parseInt(item.getAttribute("data-index"));
    selectedProducts.splice(idx, 1);
    saveSelectedProducts();
    updateSelectedProducts();
    // Refresh grid to update highlights
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
      loadProducts().then((products) => {
        const filteredProducts = products.filter(
          (product) => product.category === selectedCategory
        );
        displayProducts(filteredProducts);
      });
    }
  }
});

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});

/*
  Helper function to call your Cloudflare Worker for OpenAI requests.
  The API key is securely stored and used by your Worker—your frontend does NOT need or use the OpenAI API key.
  All requests are sent to your Worker endpoint only.
*/
const WORKER_URL = "https://shrill-art-f2e6.zaabudarin.workers.dev/"; // <-- Your Worker URL

// Add a search field for product search
const searchSection = document.querySelector(".search-section");
const productSearchInput = document.createElement("input");
productSearchInput.type = "text";
productSearchInput.id = "productSearch";
productSearchInput.placeholder = "Search products by name or keyword...";
productSearchInput.style.marginLeft = "12px";
productSearchInput.style.flex = "2";
searchSection.appendChild(productSearchInput);

// Store the latest loaded products for filtering
let allProducts = [];

// Update displayProducts to use both category and search filters
async function filterAndDisplayProducts() {
  // Load products if not already loaded
  if (allProducts.length === 0) {
    allProducts = await loadProducts();
  }
  const selectedCategory = categoryFilter.value;
  const searchTerm = productSearchInput.value.trim().toLowerCase();

  let filtered = allProducts;
  if (selectedCategory) {
    filtered = filtered.filter(
      (product) => product.category === selectedCategory
    );
  }
  if (searchTerm) {
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm))
    );
  }
  displayProducts(filtered);
}

// Listen for changes in the category filter and search input
categoryFilter.addEventListener("change", filterAndDisplayProducts);
productSearchInput.addEventListener("input", filterAndDisplayProducts);

// On page load, load all products for searching
loadProducts().then((products) => {
  allProducts = products;
});

// Update the generateRoutineBtn event to request web search capability
let chatHistory = [
  {
    role: "system",
    content:
      "You are a helpful beauty routine assistant. Only answer questions about the generated routine, skincare, haircare, makeup, fragrance, or related beauty topics. Use real-time web search to provide current information about L'Oréal products and routines. Include links or citations if available.",
  },
];

generateRoutineBtn.addEventListener("click", async () => {
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML = `<div class="placeholder-message">Please select products before generating a routine.</div>`;
    return;
  }

  chatWindow.innerHTML = `<div class="placeholder-message">Generating your personalized routine...</div>`;

  const productsForAI = selectedProducts.map((product) => ({
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description,
  }));

  const userPrompt = `
You are a beauty routine expert. Using the following selected products, create a step-by-step personalized routine.
Explain the order and purpose of each product. Be friendly and clear for beginners.
If possible, use real-time web search to provide current information about these L'Oréal products and routines, and include links or citations.

Products:
${productsForAI
  .map(
    (p) =>
      `- ${p.name} (${p.brand}) [${p.category}]: ${
        p.description || "No description"
      }`
  )
  .join("\n")}
`;

  chatHistory = [chatHistory[0], { role: "user", content: userPrompt }];

  try {
    // The API key is NOT sent from the browser. The Worker handles authentication.
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: chatHistory,
        max_tokens: 700,
        temperature: 0.7,
        web_search: true, // Ask the Worker to enable web search if supported
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      chatHistory.push({
        role: "assistant",
        content: data.choices[0].message.content,
      });

      chatWindow.innerHTML = `<div class="ai-response">${data.choices[0].message.content.replace(
        /\n/g,
        "<br>"
      )}</div>`;
    } else {
      chatWindow.innerHTML = `<div class="placeholder-message">Sorry, something went wrong. Please try again.</div>`;
    }
  } catch (error) {
    chatWindow.innerHTML = `<div class="placeholder-message">Error: Could not connect to the routine service. Please try again later.</div>`;
  }
});

// Chat form submission handler for follow-up questions (with web search)
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userInput = document.getElementById("userInput").value.trim();
  if (!userInput) return;

  chatWindow.innerHTML += `<div class="user-question"><strong>You:</strong> ${userInput}</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  chatHistory.push({ role: "user", content: userInput });

  chatWindow.innerHTML += `<div class="placeholder-message">Thinking...</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // The API key is NOT sent from the browser. The Worker handles authentication.
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: chatHistory,
        max_tokens: 500,
        temperature: 0.7,
        web_search: true, // Ask the Worker to enable web search if supported
      }),
    });

    const data = await response.json();

    chatWindow.innerHTML = chatWindow.innerHTML.replace(
      `<div class="placeholder-message">Thinking...</div>`,
      ""
    );

    if (data.choices && data.choices[0] && data.choices[0].message) {
      chatHistory.push({
        role: "assistant",
        content: data.choices[0].message.content,
      });

      chatWindow.innerHTML += `<div class="ai-response">${data.choices[0].message.content.replace(
        /\n/g,
        "<br>"
      )}</div>`;
      chatWindow.scrollTop = chatWindow.scrollHeight;
    } else {
      chatWindow.innerHTML += `<div class="placeholder-message">Sorry, something went wrong. Please try again.</div>`;
    }
  } catch (error) {
    chatWindow.innerHTML += `<div class="placeholder-message">Error: Could not connect to the routine service. Please try again later.</div>`;
  }

  document.getElementById("userInput").value = "";
});

/*
  RTL Support: 
  This function toggles RTL mode by adding/removing the 'rtl' class on the body.
  You can call setRTL(true) to enable RTL, or setRTL(false) to disable it.
*/
function setRTL(isRTL) {
  if (isRTL) {
    document.body.classList.add("rtl");
  } else {
    document.body.classList.remove("rtl");
  }
}

// Example: Enable RTL if the user's language is Arabic, Hebrew, Persian, or Urdu
const rtlLangs = ["ar", "he", "fa", "ur"];
const userLang = navigator.language || navigator.userLanguage || "";
if (rtlLangs.some((code) => userLang.startsWith(code))) {
  setRTL(true);
}

// Optionally, you can provide a manual toggle for students to test RTL mode:
// Uncomment below to add a toggle button for RTL/LTR
/*
const rtlToggle = document.createElement('button');
rtlToggle.textContent = 'Toggle RTL';
rtlToggle.style.position = 'fixed';
rtlToggle.style.top = '10px';
rtlToggle.style.right = '10px';
rtlToggle.onclick = () => document.body.classList.toggle('rtl');
document.body.appendChild(rtlToggle);
*/
