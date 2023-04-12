const apiKey = "0fe85fc0106e4f769e64ae02dad052ad";
const recipeInstructionsElement = document.getElementById("recipeInstructions");


const form = document.getElementById('search-form');
const searchInput = document.getElementById('search-bar');
const recipeGrid = document.getElementById('recipe-grid');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const ingredients = searchInput.value;
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=10&ignorePantry=true&apiKey=${apiKey}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        recipeGrid.innerHTML = ''; // clear the recipe grid
        data.forEach(recipe => {
          const recipeCard = document.createElement('div');
          recipeCard.className = 'recipe-card';
          const recipeImg = document.createElement('img');
          recipeImg.src = recipe.image;
          recipeImg.alt = 'Recipe image';
          recipeImg.className = 'recipe-img';
          recipeCard.appendChild(recipeImg);
          const recipeName = document.createElement('h2');
          recipeName.className = 'recipe-name';
          recipeName.textContent = recipe.title;
          recipeCard.appendChild(recipeName);
          const missingCount = document.createElement('p');
          missingCount.textContent = `Missing ingredients: ${recipe.missedIngredientCount}`;
          recipeCard.appendChild(missingCount);
          recipeCard.addEventListener('click', () => {
            const recipeUrl = `https://api.spoonacular.com/recipes/${recipe.id}/analyzedInstructions?apiKey=${apiKey}`;
            fetch(recipeUrl)
              .then(response => response.json())
              .then(data => {
                const instructions = data[0].steps.map(step => step.step);
                alert(instructions.join('\n')); // show instructions as an alert
              })
              .catch(error => {
                console.error(error);
              });
          });
          recipeGrid.appendChild(recipeCard);
        });
      })
      .catch(error => {
        console.error(error);
      });
  });

