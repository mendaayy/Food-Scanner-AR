// API key for Spoonacular API
const apiKey = "8f23874a705747e985b05a6f6ba74bf6";

// Get DOM elements
const searchForm = document.querySelector("#search-form");
const searchBar = document.querySelector("#search-bar");
const recipeGrid = document.querySelector("#recipe-grid");

window.addEventListener("load", (event) => {
  // Get ingredients input from scanner
  const uniqueFoods = JSON.parse(localStorage.getItem('uniqueFoods'));
  const ingredients = uniqueFoods.join(',');
  console.log(ingredients);

  // Build URL for Spoonacular API call
  const ingredientsUrl = buildIngredientsUrl(ingredients);

  // Call function to fetch recipe data
  fetchIngredientsData(ingredientsUrl)
    .then(renderRecipeCards)
    .catch(error => {
      console.error(error);
      throw new Error('Too Many Requests');
    })

    renderUniqueFoods();
})

function renderUniqueFoods() {
  const uniqueFoods = JSON.parse(localStorage.getItem("uniqueFoods"));
  const uniqueFoodsDiv = document.querySelector("#unique-foods");

  uniqueFoods.forEach((food) => {
    const foodSpan = document.createElement("span");
    foodSpan.innerText = food;
    uniqueFoodsDiv.appendChild(foodSpan);
  });
}


// Add event listener to search form
searchForm.addEventListener("submit", handleSearchSubmit);

// Handle search form submission
function handleSearchSubmit(event) {
  // Prevent the form from submitting
  event.preventDefault();

  // Get ingredients input from search bar
  const ingredients = searchBar.value.trim();

  // Build URL for Spoonacular API call
  const ingredientsUrl = buildIngredientsUrl(ingredients);

  // Call function to fetch recipe data
  fetchIngredientsData(ingredientsUrl)
    .then(renderRecipeCards)
    .catch(error => {
      console.error(error);
      throw new Error('Too Many Requests');
    })

  // Clear search bar input
  searchBar.value = "";
}

// Build URL for Spoonacular API call
function buildIngredientsUrl(ingredients) {
  const baseUrl = "https://api.spoonacular.com/recipes/findByIngredients";
  const params = {
    ingredients: ingredients,
    number: 5,
    ignorePantry: true,
    ranking: 1,
    apiKey: apiKey,
  };
  const url = new URL(baseUrl);
  url.search = new URLSearchParams(params).toString();
  return url.toString();
}

// Fetch recipe data from Spoonacular API
function fetchIngredientsData(url) {
  return fetch(url).then((response) => response.json());
}

// Fetch recipe details data from Spoonacular API
function fetchRecipeDetailsData(recipeId) {
  const recipeDetailsUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=true`;
  return fetch(recipeDetailsUrl).then((response) => response.json());
}

// Render recipe cards to the DOM
function renderRecipeCards(data) {
  // Clear recipe grid
  recipeGrid.innerHTML = "";

  if (data.length === 0) {
    const noResultsContainer = document.createElement("div");
    noResultsContainer.classList.add("no-results-container");

    const noResultsMessage = document.createElement("p");
    noResultsMessage.innerText = "No results found";
    noResultsContainer.appendChild(noResultsMessage);

    const backButton = document.createElement("button");
    backButton.innerText = "Back";
    backButton.addEventListener("click", () => {
      window.location = "/generateRecipe.html";
    });
    noResultsContainer.appendChild(backButton);

    document.body.appendChild(noResultsContainer);
    return;
  }

 // Clear recipe grid
 recipeGrid.innerHTML = "";
 let recipeCards = "";

 // Loop through each recipe and add a recipe card to the DOM
 data.forEach((recipe) => {
   const recipeId = recipe.id;
   const recipeName = recipe.title;
   const recipeImg = recipe.image;
   const recipeMissing = recipe.missedIngredientCount;

   // Call function to fetch recipe details data
   fetchRecipeDetailsData(recipeId)
     .then((data) => {
       const recipeServings = data.servings;
       const recipeCalories = data.nutrition.nutrients.find(
         (nutrient) => nutrient.name === "Calories"
       ).amount / recipeServings;

       const recipeTime = data.readyInMinutes; // Get recipe time from API

       // Build recipe card HTML
       const recipeCard = buildRecipeCard(recipeName, recipeImg, recipeTime, recipeCalories, recipeMissing);

       // Add recipe card to recipe grid
       recipeCards += recipeCard;
       recipeGrid.innerHTML = recipeCards;
     })
     .catch((error) => console.log(error));
 });
}

// Build HTML for recipe card
function buildRecipeCard(recipeName, recipeImg, recipeTime, recipeCalories, recipeMissing) {
  return `
    <div class="recipe-card">
      <img src="${recipeImg}" alt="Recipe image" class="recipe-img">
      <h2 class="recipe-name">${recipeName}</h2>
      <div class="recipe-details">
        <p class="recipe-time"><i class="bi-clock"></i>${recipeTime} min</p>
        <p class="recipe-calories"><i class="bi-fire"></i>${recipeCalories.toFixed(0)} kcal</p>
      </div>
      <p class="recipe-missing">${recipeMissing} missing ingredients</p>
    </div>
  `;
}
