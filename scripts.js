/**
 * Data Catalog Project Starter Code - SEA Stage 2
 *
 * This file is where you should be doing most of your work. You should
 * also make changes to the HTML and CSS files, but we want you to prioritize
 * demonstrating your understanding of data structures, and you'll do that
 * with the JavaScript code you write in this file.
 *
 * The comments in this file are only to help you learn how the starter code
 * works. The instructions for the project are in the README. That said, here
 * are the three things you should do first to learn about the starter code:
 * - 1 - Change something small in index.html or style.css, then reload your
 *    browser and make sure you can see that change.
 * - 2 - On your browser, right click anywhere on the page and select
 *    "Inspect" to open the browser developer tools. Then, go to the "console"
 *    tab in the new window that opened up. This console is where you will see
 *    JavaScript errors and logs, which is extremely helpful for debugging.
 *    (These instructions assume you're using Chrome, opening developer tools
 *    may be different on other browsers. We suggest using Chrome.)
 * - 3 - Add another string to the titles array a few lines down. Reload your
 *    browser and observe what happens. You should see a fourth "card" appear
 *    with the string you added to the array, but a broken image.
 *
 */

/*
datasets: 
breakfast: https://www.efad.org/breakfast-toolkit/
lunch:https://healthycampus.ucr.edu/sites/g/files/rcwecm2766/files/2019-08/hc_ucr-healthy-cookbook.pdf
dinner: https://healthyeating.nhlbi.nih.gov/pdfs/dinners_cookbook_508-compliant.pdf

papaparse: https://www.papaparse.com/docs#csv-to-json

*/

let mealData = {
  breakfast: [],
  lunch: [],
  dinner: []
};

let selectedMeals = [];

document.addEventListener('DOMContentLoaded', function(){
  //load files
  loadCSVData('dataSets/Food Catalog Breakfast.csv', 'breakfast');
  loadCSVData('dataSets/Food Catalog Lunch.csv', 'lunch'); 
  loadCSVData('dataSets/Food Catalog Dinner.csv', 'dinner');
  
  //drop down functionalities
  document.querySelectorAll('.dropdown-btn').forEach(btn => {
      btn.addEventListener('click', function() {
          const mealType = this.getAttribute('data-meal-type');
          const dropdown = document.getElementById(`${mealType}-dropdown`);

          this.classList.toggle('active');
          dropdown.classList.toggle('active');
      });
  });
  
  //calculating macros and resetting selections event listeners
  document.getElementById('calculate-btn').addEventListener('click', calculateTotalMacros);
  document.getElementById('reset-btn').addEventListener('click', resetSelections);
});


//will get meal information for each meal type
function loadCSVData(filename, mealType){
  Papa.parse(filename, {
      download: true,         //gets the file
      header: true,           //makes first line as property names

      //sucessfully reading from file
      complete: function(results){
        console.log(`Loaded ${filename} successfully. First item:`, results.data[0]);

          //creates objects to mealData
          mealData[mealType] = results.data.map(item => {
            const standardized = standardizeMealData(item, mealType);

            console.log('Standardized:', standardized);
            return standardized;
          });          
          displayMealOptions(mealType);
      },

      //unsucessfull
      error: function(error){
          console.error(`Error loading ${filename}:`, error);
          mealData[mealType] = [];
          displayMealOptions(mealType);
      }
  });
}

//creating obects to store into mealData
function standardizeMealData(item, mealType){
  
  console.log('Raw item data:', item);

  return {
    name: item.Recipe || 'Unnamed Recipe',
    type: item.Type || 'Uncategorized',
    difficulty: item.Difficulty || 'Not specified',
    ingredients: item.Ingredients ? 
      String(item.Ingredients).split(',').map(i => i.trim()).filter(i => i) : 
      [],
    nutrition: {
      calories: parseInt(item['Calories (kcal)'] || 0),
      protein: parseFloat(item['Protein (g)'] || 0),
      carbs: parseFloat(item['Carbohydrates (g)'] || 0),
      fat: parseFloat(item['Total Fat (g)'] || 0),
      saturatedFat: parseFloat(item['Saturated Fat (g)'] || 0),
      fiber: parseFloat(item['Fibre (g)'] || 0),
      sugar: parseFloat(item['Free Sugar (g)'] || 0),
      sodium: parseFloat(item['Sodium (mg)'] || 0)
    },
    prepTime: parseInt(item['Prep Time (min)'] || 0),
    instructions: item.Instructions || 'No instructions provided',
    mealType: mealType.toLowerCase()
  };
}

//helper function for displaying
function displayMealOptions(mealType){
  const grid = document.querySelector(`#${mealType}-dropdown .meal-grid`);
  grid.innerHTML = '';
  
  mealData[mealType].forEach(meal => {
      grid.appendChild(createMealCard(meal));
  });
}

//will create cards that go into the div for each meal type
function createMealCard(meal){
  const card = document.createElement('div');
  card.className = 'meal-card';
  card.dataset.mealName = meal.name;
  card.dataset.mealType = meal.mealType;
  
  //use the nutrition values from the standardized meal object
  card.innerHTML = `
      <h3>${meal.name}</h3>
      ${meal.type ? `<span class="type">${meal.type}</span>` : ''}
      <div><strong>Calories:</strong> ${meal.nutrition.calories}</div>
      <div class="macro-info">
          <div class="macro-item">
              <span>Protein</span>
              <div>${meal.nutrition.protein}g</div>
          </div>
          <div class="macro-item">
              <span>Carbs</span>
              <div>${meal.nutrition.carbs}g</div>
          </div>
          <div class="macro-item">
              <span>Fat</span>
              <div>${meal.nutrition.fat}g</div>
          </div>
      </div>
  `;
  
  card.addEventListener('click', function(){
      selectMeal(meal);
  });
  
  return card;
}


function selectMeal(meal){
  //remove any prev selected from same type
  selectedMeals = selectedMeals.filter(m => m.mealType !== meal.mealType);
  
  //add to data
  selectedMeals.push(meal);
  
  //update
  updateSelectedMealsDisplay();
  
  //removing css selected class
  document.querySelectorAll('.meal-card').forEach(card => {
      card.classList.remove('selected');
  });
  
  //only adding selected to the one clicked to be highlighted
  document.querySelector(`.meal-card[data-meal-type="${meal.mealType}"][data-meal-name="${meal.name}"]`).classList.add('selected');
  
  //display name to the dropdown
  const dropdownBtn = document.querySelector(`.dropdown-btn[data-meal-type="${meal.mealType}"]`);
  dropdownBtn.textContent = `${meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}: ${meal.name}`;
}

//update function for selected meals
function updateSelectedMealsDisplay(){
  const selectedList = document.getElementById('selected-list');
  selectedList.innerHTML = '';

  //for loop to displpay each meal selected
  selectedMeals.forEach(meal => {
      const item = document.createElement('div');
      item.className = 'selected-meal-item';
      item.innerHTML = `
          <div>
              <strong>${meal.mealType}:</strong> ${meal.name}
              <div class="calories">${meal.nutrition.calories} calories</div>
          </div>
          <div class="macros">
              P: ${meal.nutrition.protein}g | C: ${meal.nutrition.carbs}g | F: ${meal.nutrition.fat}g
          </div>
      `;
      selectedList.appendChild(item);
  });
}


//button functionalities:

function calculateTotalMacros(){
  const totalMacros = document.getElementById('total-macros');
  
  if (selectedMeals.length === 0) {
      totalMacros.innerHTML = '<p>select at least one meal to calculate macros</p>';
      return;
  }
  
  const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      saturatedFat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
  };
  
  selectedMeals.forEach(meal => {
      totals.calories += meal.nutrition.calories;
      totals.protein += meal.nutrition.protein;
      totals.carbs += meal.nutrition.carbs;
      totals.fat += meal.nutrition.fat;
      totals.saturatedFat += meal.nutrition.saturatedFat;
      totals.fiber += meal.nutrition.fiber;
      totals.sugar += meal.nutrition.sugar;
      totals.sodium += meal.nutrition.sodium;
  });
  
  //displaying resutls
  totalMacros.innerHTML = 
  `<h3>Total Nutritional Values</h3>
      <div class="macro-totals">
          <div class="macro-total-item">
              <span>Calories</span>
              <div class="value">${totals.calories}</div>
          </div>
          <div class="macro-total-item">
              <span>Protein</span>
              <div class="value">${totals.protein}g</div>
          </div>
          <div class="macro-total-item">
              <span>Carbs</span>
              <div class="value">${totals.carbs}g</div>
          </div>
          <div class="macro-total-item">
              <span>Fat</span>
              <div class="value">${totals.fat}g</div>
          </div>
      </div>
      <div class="additional-macros">
          <div><strong>Saturated Fat:</strong> ${totals.saturatedFat}g</div>
          <div><strong>Fiber:</strong> ${totals.fiber}g</div>
          <div><strong>Sugar:</strong> ${totals.sugar}g</div>
          <div><strong>Sodium:</strong> ${totals.sodium}mg</div>
      </div>
  `;
}


function resetSelections(){
  selectedMeals = [];
  updateSelectedMealsDisplay();
  document.getElementById('total-macros').innerHTML = '';
  
  //removing highlight from cards
  document.querySelectorAll('.meal-card').forEach(card => {
      card.classList.remove('selected');
  });
  
  //drop down menu reset
  document.querySelectorAll('.dropdown-btn').forEach(btn => {
      const mealType = btn.getAttribute('data-meal-type');
      btn.textContent = `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Options`;
  });
}