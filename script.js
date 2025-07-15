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
  if (!window.expandedDescriptions) {
    window.expandedDescriptions = new Set();
  }

  productsContainer.innerHTML = products
    .map((product) => {
      const isSelected = selectedProducts.some(
        (p) => p.name === product.name && p.brand === product.brand
      );
      const isExpanded = window.expandedDescriptions.has(product.name);
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
    card.addEventListener("click", (event) => {
      if (event.target.classList.contains("desc-toggle-btn")) {
        return;
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
        // Add slide animation to the selected product shelf
        setTimeout(() => {
          const lastItem = selectedProductsList.querySelector(
            ".selected-product-item:last-child"
          );
          if (lastItem) {
            lastItem.classList.add("slide-in-shelf");
            setTimeout(() => lastItem.classList.remove("slide-in-shelf"), 600);
          }
        }, 50);
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
      event.stopPropagation();
      const card = btn.closest(".product-card");
      const name = card.getAttribute("data-name");
      if (window.expandedDescriptions.has(name)) {
        window.expandedDescriptions.delete(name);
      } else {
        window.expandedDescriptions.add(name);
      }
      displayProducts(products);
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
      "You are a luxurious, empowering, and beauty-forward digital advisor for L’Oréal. Always speak with confidence and warmth, using on-brand language that inspires beauty, self-assurance, and elegance.You serve as a helpful beauty routine assistant, focused exclusively on L’Oréal products and beauty-related topics—including skincare, haircare, makeup, fragrance, and beauty routines. You offer personalized product recommendations, usage tips, and educational beauty insights tailored to each user’s needs.Track the conversation context, including the user’s name, preferences, and past questions, to support natural, multi-turn interactions.If a user asks something unrelated to L’Oréal or beauty, politely and gracefully redirect the conversation back to a beauty-related topic.Use real-time web search to provide accurate, up-to-date information about L’Oréal products and routines. Include links or citations when available to help the user explore further.Above all, your tone should reflect the prestige of the L’Oréal brand—uplifting, knowledgeable, and elegant.",
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

const rtlToggle = document.createElement("button");
rtlToggle.textContent = "Toggle RTL";
rtlToggle.style.position = "fixed";
rtlToggle.style.top = "10px";
rtlToggle.style.right = "10px";
rtlToggle.onclick = () => document.body.classList.toggle("rtl");
document.body.appendChild(rtlToggle);

/*
  Skincare Quiz Logic
  This code adds a simple quiz that asks the user about their skin type, concerns, and climate.
  After answering, it displays a personalized routine summary.
  The quiz is shown in the chat window, mimicking a chatbot/advisor style.
*/

// Expanded quiz questions for deeper personalization
const quizQuestions = [
  {
    question: "What is your skin type?",
    options: ["Normal", "Oily", "Dry", "Combination", "Sensitive"],
    key: "skinType",
  },
  {
    question: "What is your main skin concern?",
    options: ["Acne", "Wrinkles", "Dark Spots", "Redness", "Dryness", "None"],
    key: "concern",
  },
  {
    question: "What climate do you live in?",
    options: ["Humid", "Dry", "Cold", "Hot", "Temperate"],
    key: "climate",
  },
  {
    question: "How much sun exposure do you get daily?",
    options: ["A lot", "Some", "Very little"],
    key: "sun",
  },
  {
    question: "How would you describe your sleep habits?",
    options: ["Great", "Okay", "Poor"],
    key: "sleep",
  },
  {
    question: "How would you describe your diet?",
    options: ["Balanced", "Somewhat healthy", "Needs improvement"],
    key: "diet",
  },
  {
    question: "Do you have any allergies to skincare ingredients?",
    options: ["No", "Yes (please specify)"],
    key: "allergies",
  },
  {
    question: "What is your age group?",
    options: ["Under 18", "18-25", "26-35", "36-50", "51+"],
    key: "age",
  },
];

// Store quiz answers
let quizAnswers = {};
let quizStep = 0;

// Function to start the quiz
function startQuiz() {
  quizAnswers = {};
  quizStep = 0;
  chatWindow.innerHTML = "";
  showQuizQuestion();
}

// Function to show the current quiz question (with empathy and friendly tone)
function showQuizQuestion() {
  const q = quizQuestions[quizStep];
  if (!q) {
    showQuizResults();
    return;
  }

  // Use memory/context in the question if available
  let contextNote = "";
  if (q.key === "concern" && quizAnswers.skinType) {
    contextNote = `<div style="font-size:14px;color:#888;margin-bottom:4px;">(You mentioned <b>${quizAnswers.skinType.toLowerCase()} skin</b> earlier.)</div>`;
  }

  // Friendly, warm intro for the first question
  let friendlyIntro = "";
  if (quizStep === 0) {
    friendlyIntro = `<div style="font-size:15px;color:#7a5fa4;margin-bottom:8px;">
      Hi there! 😊 I'm here to help you find the best routine for your unique skin. Let's get started!
    </div>`;
  }

  chatWindow.innerHTML += `
    <div class="ai-response" style="margin-bottom:12px;">
      ${friendlyIntro}
      <strong>Skincare Advisor:</strong> ${contextNote}${q.question}
    </div>
    <div id="quizOptions"></div>
  `;
  const quizOptionsDiv =
    document.getElementById("quizOptions") || chatWindow.lastElementChild;
  quizOptionsDiv.innerHTML = q.options
    .map(
      (opt) =>
        `<button class="quiz-option-btn" style="margin:6px 8px 6px 0;padding:10px 18px;border-radius:6px;border:none;background:#eabfff;color:#222;cursor:pointer;font-size:16px;">${opt}</button>`
    )
    .join("");
  // Add event listeners for option buttons
  Array.from(quizOptionsDiv.querySelectorAll(".quiz-option-btn")).forEach(
    (btn) => {
      btn.addEventListener("click", () => {
        quizAnswers[q.key] = btn.textContent;
        quizStep++;
        showQuizQuestion();
      });
    }
  );
}

// Function to display quiz results and a sample routine (with deeper logic and ingredient info)
function showQuizResults() {
  // Simple logic for a sample routine based on answers
  let routine = [];
  let empathyMsg = "";
  let reassurance = "";
  let ingredientInfo = "";
  let contraindication = "";

  // Empathy and reassurance for sensitive skin
  if (quizAnswers.skinType === "Sensitive") {
    empathyMsg = `<div style="color:#b87fcf;margin-bottom:8px;">
      I understand sensitive skin needs extra care. 💜 I'll suggest gentle, soothing options for you.
    </div>`;
    reassurance = `<div style="color:#7a5fa4;font-size:15px;margin-top:8px;">
      Tip: Always patch test new products on a small area first, and look for fragrance-free, hypoallergenic formulas.
    </div>`;
    routine.push("• Gentle fragrance-free cleanser");
    routine.push("• Calming moisturizer");
    routine.push("• Mineral sunscreen");
    ingredientInfo += `<div style="color:#6b4fa4;font-size:15px;margin-top:8px;">
      <b>Why mineral sunscreen?</b> Mineral (physical) sunscreens with zinc oxide or titanium dioxide are less likely to irritate sensitive skin.
    </div>`;
  } else if (quizAnswers.skinType === "Oily") {
    empathyMsg = `<div style="color:#b87fcf;margin-bottom:8px;">
      Oily skin can be a challenge, but with the right routine, you can keep it balanced and fresh!
    </div>`;
    routine.push("• Gel cleanser");
    routine.push("• Oil-free moisturizer");
    routine.push("• Lightweight sunscreen");
    if (quizAnswers.concern === "Acne" || quizAnswers.concern === "None") {
      routine.push("• Spot treatment with salicylic acid");
      ingredientInfo += `<div style="color:#6b4fa4;font-size:15px;margin-top:8px;">
        <b>Why salicylic acid?</b> Salicylic acid helps unclog pores and reduce oil, making it great for oily and acne-prone skin.
      </div>`;
    }
  } else if (quizAnswers.skinType === "Dry") {
    empathyMsg = `<div style="color:#b87fcf;margin-bottom:8px;">
      Dry skin deserves extra hydration and comfort. Let's keep your skin soft and nourished!
    </div>`;
    routine.push("• Hydrating cream cleanser");
    routine.push("• Rich moisturizer");
    routine.push("• Nourishing sunscreen");
    ingredientInfo += `<div style="color:#6b4fa4;font-size:15px;margin-top:8px;">
      <b>Why hyaluronic acid?</b> Hyaluronic acid attracts moisture to the skin, helping relieve dryness and plump the skin.
    </div>`;
  } else {
    empathyMsg = `<div style="color:#b87fcf;margin-bottom:8px;">
      Let's build a routine that helps your skin look and feel its best!
    </div>`;
    routine.push("• Gentle cleanser");
    routine.push("• Daily moisturizer");
    routine.push("• Broad-spectrum sunscreen");
  }

  // Empathy for concerns
  if (quizAnswers.concern === "Acne") {
    routine.push("• Spot treatment with salicylic acid");
    reassurance += `<div style="color:#7a5fa4;font-size:15px;margin-top:8px;">
      Remember, breakouts are normal and treatable. Be gentle with your skin and avoid harsh scrubbing.
    </div>`;
    ingredientInfo += `<div style="color:#6b4fa4;font-size:15px;margin-top:8px;">
      <b>Ingredient tip:</b> Niacinamide and salicylic acid can help reduce breakouts and redness.
    </div>`;
  } else if (quizAnswers.concern === "Wrinkles") {
    routine.push("• Serum with retinol or peptides");
    reassurance += `<div style="color:#7a5fa4;font-size:15px;margin-top:8px;">
      Fine lines are a natural part of life. Consistent care and sun protection can help your skin stay radiant.
    </div>`;
    ingredientInfo += `<div style="color:#6b4fa4;font-size:15px;margin-top:8px;">
      <b>Why retinol?</b> Retinol encourages skin renewal and can reduce the appearance of wrinkles. <b>Note:</b> Retinoids can make skin more sensitive to sun—always use SPF in the morning!
    </div>`;
    contraindication += `<div style="color:#c00;font-size:14px;margin-top:8px;">
      <b>Warning:</b> Avoid using retinol with strong exfoliants or during the day without sunscreen.
    </div>`;
  } else if (quizAnswers.concern === "Dark Spots") {
    routine.push("• Serum with vitamin C or niacinamide");
    reassurance += `<div style="color:#7a5fa4;font-size:15px;margin-top:8px;">
      Brightening ingredients can help even your skin tone over time. Patience and SPF are key!
    </div>`;
    ingredientInfo += `<div style="color:#6b4fa4;font-size:15px;margin-top:8px;">
      <b>Why vitamin C?</b> Vitamin C helps fade dark spots and boosts radiance. Always pair with sunscreen in the morning.
    </div>`;
  } else if (quizAnswers.concern === "Redness") {
    routine.push("• Soothing serum with centella asiatica");
    reassurance += `<div style="color:#7a5fa4;font-size:15px;margin-top:8px;">
      Redness can be soothed with calming formulas. Avoid hot water and harsh exfoliants.
    </div>`;
    ingredientInfo += `<div style="color:#6b4fa4;font-size:15px;margin-top:8px;">
      <b>Why centella asiatica?</b> This plant extract calms irritation and supports the skin barrier.
    </div>`;
  } else if (quizAnswers.concern === "Dryness") {
    routine.push("• Overnight hydrating mask");
    reassurance += `<div style="color:#7a5fa4;font-size:15px;margin-top:8px;">
      Hydration is your skin's best friend. Layer gentle moisturizers for lasting comfort.
    </div>`;
    ingredientInfo += `<div style="color:#6b4fa4;font-size:15px;margin-top:8px;">
      <b>Why glycerin?</b> Glycerin helps attract and lock in moisture for dry skin.
    </div>`;
  }

  // Environmental factors
  if (quizAnswers.sun === "A lot") {
    routine.push("• Extra SPF protection");
    ingredientInfo += `<div style="color:#6b4fa4;font-size:15px;margin-top:8px;">
      <b>Sun care:</b> Daily SPF is essential for all skin types, especially with high sun exposure.
    </div>`;
    contraindication += `<div style="color:#c00;font-size:14px;margin-top:8px;">
      <b>Note:</b> If using retinoids or acids, apply them at night and always use sunscreen in the morning.
    </div>`;
  }
  if (quizAnswers.climate === "Humid") {
    routine.push("• Mattifying primer (optional)");
  } else if (quizAnswers.climate === "Dry") {
    routine.push("• Hydrating mist (optional)");
  }

  // Lifestyle factors
  if (quizAnswers.sleep === "Poor") {
    reassurance += `<div style="color:#7a5fa4;font-size:15px;margin-top:8px;">
      Good sleep helps your skin repair. Try to rest well for a healthy glow!
    </div>`;
  }
  if (quizAnswers.diet === "Needs improvement") {
    reassurance += `<div style="color:#7a5fa4;font-size:15px;margin-top:8px;">
      A balanced diet supports your skin from within. Hydrate and enjoy fruits and veggies!
    </div>`;
  }

  // Allergies
  if (quizAnswers.allergies && quizAnswers.allergies !== "No") {
    reassurance += `<div style="color:#c00;font-size:14px;margin-top:8px;">
      <b>Allergy note:</b> Always check ingredient lists and consult your dermatologist if unsure.
    </div>`;
  }

  // Age-based tips
  if (quizAnswers.age === "36-50" || quizAnswers.age === "51+") {
    reassurance += `<div style="color:#7a5fa4;font-size:15px;margin-top:8px;">
      As we age, skin may need extra hydration and targeted care. Consider serums with peptides or antioxidants.
    </div>`;
  }

  // Climate-based tip
  let climateTip = "";
  if (quizAnswers.climate === "Humid") {
    climateTip =
      "Tip: In humid climates, use lightweight, non-comedogenic products.";
  } else if (quizAnswers.climate === "Dry") {
    climateTip =
      "Tip: In dry climates, layer hydrating products and avoid harsh cleansers.";
  } else if (quizAnswers.climate === "Cold") {
    climateTip =
      "Tip: In cold climates, use richer creams and protect your skin barrier.";
  } else if (quizAnswers.climate === "Hot") {
    climateTip =
      "Tip: In hot climates, reapply sunscreen and use mattifying products.";
  }

  chatWindow.innerHTML += `
    <div class="ai-response" style="margin-top:18px;">
      ${empathyMsg}
      <strong>Your personalized morning routine includes:</strong><br>
      ${routine.join("<br>")}
      <br><br>
      <em>${climateTip}</em>
      ${ingredientInfo}
      ${contraindication}
      ${reassurance}
    </div>
  `;
}

// Add a button to start the quiz in the chatbox (for students)
const chatbox = document.querySelector(".chatbox");
const quizBtn = document.createElement("button");
quizBtn.textContent = "🧴 Get Recommendations"; // Changed button name here
quizBtn.className = "generate-btn";
quizBtn.style.marginTop = "16px";
quizBtn.onclick = startQuiz;
chatbox.appendChild(quizBtn);

// Selfie upload preview logic
const selfieUpload = document.getElementById("selfieUpload");
const selfiePreview = document.getElementById("selfiePreview");

if (selfieUpload) {
  selfieUpload.addEventListener("change", function () {
    const file = this.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        selfiePreview.innerHTML = `
          <img src="${e.target.result}" alt="Selfie Preview" />
          <div style="margin-top:8px; color:#666; font-size:15px;">(Preview only. AI analysis coming soon!)</div>
        `;
      };
      reader.readAsDataURL(file);
    } else {
      selfiePreview.innerHTML =
        "<span style='color:#c00;'>Please upload a valid image file.</span>";
    }
  });
}
