const apiKey = "0fe85fc0106e4f769e64ae02dad052ad";
const recipeListElement = document.getElementById("recipeList");
const recipeInstructionsElement = document.getElementById("recipeInstructions");

function generateRecipes() {
    const ingredients = document.getElementById("ingredients").value;
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=2&ignorePantry=true&apiKey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Sort recipes by the length of missedIngredients property
            data.sort((a, b) => a.missedIngredientCount- b.missedIngredientCount);

            let recipeListHTML = "<h2>Recipes Found:</h2>";
            data.forEach(recipe => {
                const missingIngredients = recipe.missedIngredientCount;
                const usedIngredients = recipe.usedIngredientCount;
                recipeListHTML += `
                    <div class="recipe-card">
                        <img src="${recipe.image}" alt="${recipe.title}">
                        <div class="recipe-details">
                            <h3>${recipe.title}</h3>
                            <div class="ingredient-info">
                                <span>${usedIngredients} used ingredients</span>
                                <span>${missingIngredients} missing ingredients</span>
                            </div>
                            <button onclick="showRecipeDetails(${recipe.id})">View Details</button>
                        </div>
                    </div>
                `;
            });
            recipeListElement.innerHTML = recipeListHTML;
        })
        .catch(error => {
            console.error("Error fetching recipe data: ", error);
            recipeListElement.innerHTML = "<p>Unable to fetch recipe data. Please try again later.</p>";
        });
}



function showRecipeDetails(recipeId) {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=false`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            let recipeDetailsHTML = `
                <h2>${data.title}</h2>
                <img src="${data.image}" alt="${data.title}">
                <div class="ingredients-list">
                    <h3>Ingredients:</h3>
                    <ul>
            `;
            const ingredients = data.extendedIngredients;
            let usedIngredientsHTML = "";
            let missingIngredientsHTML = "";
            ingredients.forEach(ingredient => {
                const ingredientHTML = `
                    <li>
                        <img src="https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}" alt="${ingredient.name}">
                        <span>${ingredient.original}</span>
                    </li>
                `;
                if (ingredient.amount > 0 && ingredient.unit !== null && ingredient.unit !== "") {
                    missingIngredientsHTML += ingredientHTML;
                } else {
                    usedIngredientsHTML += ingredientHTML;
                }
            });
            recipeDetailsHTML += `
                    <li class="missing-ingredients">
                        <h4>Used Ingredients:</h4>
                        <ul>
                            ${usedIngredientsHTML}
                        </ul>
                    </li>
                    <li class="used-ingredients">
                        <h4>Missing Ingredients:</h4>
                        <ul>
                            ${missingIngredientsHTML}
                        </ul>
                    </li>
                    </ul>
                </div>
                <div class="instructions">
                    <h3>Instructions:</h3>
            `;

            data.analyzedInstructions[0].steps.forEach(step => {
                recipeDetailsHTML += `
                    <div>
                        <span class="step-number">${step.number}.</span>
                        <span class="step-instruction">${step.step}</span>
                        <div class="step-image">
                            <img src="https://spoonacular.com/recipeImages/${data.id}-${step.number}.jpg" alt="Step ${step.number}">
                        </div>
                    </div>
                `;
            });
            recipeDetailsHTML += "</div>";
            recipeInstructionsElement.innerHTML = recipeDetailsHTML;
        })
        .catch(error => {
            console.error("Error fetching recipe details: ", error);
            recipeInstructionsElement.innerHTML = "<p>Unable to fetch recipe details. Please try again later.</p>";
        });
}
