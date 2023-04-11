const apiKey = "0fe85fc0106e4f769e64ae02dad052ad";
const recipeListElement = document.getElementById("recipeList");
const recipeInstructionsElement = document.getElementById("recipeInstructions");

window.addEventListener("load", (event) => {
    generateRecipes();
})

function generateRecipes() {
    const uniqueFoods = JSON.parse(localStorage.getItem('uniqueFoods'));
    const ingredients = uniqueFoods.join(',');
    console.log(ingredients);

    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=2&ignorePantry=true&apiKey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Sort recipes by the length of missedIngredients property
            data.sort((a, b) => a.missedIngredientCount- b.missedIngredientCount);

            let recipeListHTML = "<h2>Recipes Found:</h2>";

            data.forEach(recipe => {
                const missingIngredients = recipe.missedIngredientCount;
                const usedIngredients = recipe.usedIngredientCount;

                // Store usedIngredients and missingIngredients array names in local storage
                localStorage.setItem(`usedIngredients_${recipe.id}`, JSON.stringify(recipe.usedIngredients));
                localStorage.setItem(`missingIngredients_${recipe.id}`, JSON.stringify(recipe.missedIngredients));

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
            console.log(data);

            let recipeDetailsHTML = `
                <h2>${data.title}</h2>
                <img src="${data.image}" alt="${data.title}">
                <div class="ingredients-list">
                    <h3>Ingredients:</h3>
                    <ul>
            `;

            let usedIngredientsHTML = "";
            let missingIngredientsHTML = "";

            // Retrieve usedIngredients and missingIngredients arrays from local storage
            const usedIngredients = JSON.parse(localStorage.getItem(`usedIngredients_${recipeId}`));
            const missingIngredients = JSON.parse(localStorage.getItem(`missingIngredients_${recipeId}`));

            console.log(usedIngredients)

            const usedIngredientsList = [];
            const missingIngredientsList = [];

            data.extendedIngredients.forEach(ingredient => {
                const originalValue = ingredient.original;
                const ingredientName = ingredient.name;
                const ingredientImg = `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`;

                usedIngredients.forEach(usedIngredient => {
                    const value = usedIngredient.original;

                    if (value.includes(originalValue)) {
                        usedIngredientsList.push({name: ingredientName, originalValue, ingredientImg});
                    } 
                })

                missingIngredients.forEach(missedIngredient => {
                    const valuee = missedIngredient.original;

                    if (valuee.includes(originalValue)) {
                        missingIngredientsList.push({name: ingredientName, originalValue, ingredientImg});
                    }
                })
            });

            usedIngredientsList.forEach(ingredient => {
                const {name, originalValue, ingredientImg} = ingredient;

                const ingredientDetailsHTML = `
                    <li>
                        <img src="${ingredientImg}" alt="${name}">
                        <span>${originalValue}</span>
                    </li>
                `;

                usedIngredientsHTML += ingredientDetailsHTML;
            });

            missingIngredientsList.forEach(ingredient => {
                const {name, originalValue, ingredientImg} = ingredient;

                const ingredientDetailsHTML = `
                    <li>
                        <img src="${ingredientImg}" alt="${name}">
                        <span>${originalValue}</span>
                    </li>
                `;

                missingIngredientsHTML += ingredientDetailsHTML;
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
                </div>
            `;
        });

        recipeDetailsHTML += `
            </div>
        `;

        recipeInstructionsElement.innerHTML = recipeDetailsHTML;
    })
    .catch(error => {
        console.error("Error fetching recipe details: ", error);
        recipeInstructionsElement.innerHTML = "<p>Unable to fetch recipe details. Please try again later.</p>";
    });
}






/*
function showRecipeDetails(recipeId) {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=false`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            
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
*/

