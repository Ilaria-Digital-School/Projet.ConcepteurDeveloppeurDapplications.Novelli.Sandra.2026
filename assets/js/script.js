const toggleButton = document.querySelector('#toggle');
const cuisineGenres = document.querySelector('#cuisine-genres');
const showAll = document.querySelector('#show-all');


// Showing or hiding side menu.

function hideSideMenu() {
    cuisineGenres.classList.replace('minus', 'plus');
    toggleButton.innerText = '➕';
}

function showSideMenu() {
    cuisineGenres.classList.replace('plus', 'minus');
    toggleButton.innerText = '➖';
}


toggleButton.addEventListener('click', function() {
    cuisineGenres.className === 'minus' ? hideSideMenu() : showSideMenu();
});


let recipes = [];
let recipeList = document.querySelector('#recipe-list');

function createRecipeBox(recipe) {

    let recipeBox = document.createElement('div');

    recipeBox.innerHTML = `
    <div class="recipe-box">
    <img src="${recipe.imgSrc}" alt="">
    <button class="heart" data-id="${recipe.id}">🩶</button>
    <p class="recipe-title">${recipe.name}</p>
    <p class="author">By ${recipe.author}</p>
    </div>
    `;

    recipeList.appendChild(recipeBox);
}


function displayAllRecipes() {

    recipes = [
        {id: 1, name: 'Arrabiata pasta', imgSrc: 'assets/images/arrabiata_pasta.jpg', author: 'Sara Kelley', type: 'Italian'},
        {id: 2, name: 'Roastbeef & potatoes', imgSrc: 'assets/images/roastbeef_potatoes.jpg', author: 'John 0\'Connor', type: 'Meat'},
        {id: 3, name: 'Tuna sushi', imgSrc: 'assets/images/tuna_sushi.jpg', author: 'Debbie Birmingham', type: 'Sashimi and sushi'},
        {id: 4, name: 'Spring rolls', imgSrc: 'assets/images/spring_rolls.jpg', author: 'Damien Nguyen', type: 'Sweet & sour'},
        {id: 5, name: 'Four season pizza', imgSrc: 'assets/images/four_season_pizza.jpg', author: 'Giani Livrieri', type: 'Italian'},
        {id: 6, name: 'Tiramisù', imgSrc: 'assets/images/tiramisu.jpg', author: 'Anja Weisser', type: 'Cake'},
        {id: 7, name: 'Blue cheese hamburger', imgSrc: 'assets/images/blue_cheese_hamburger.jpg', author: 'Wendy Heyward', type: 'Homemade hamburgers'},
        {id: 8, name: 'Cheesecake', imgSrc: 'assets/images/cheesecake.jpg', author: 'Sandra Novelli-Riquer', type: 'Cake'},
        {id: 9, name: 'Bruschetta', imgSrc: 'assets/images/bruschetta.jpg', author: 'Sandra Novelli-Riquer', type: 'Italian'},
        {id: 10, name: 'Caprese salad', imgSrc: 'assets/images/caprese_salad.jpg', author: 'Gaetano Cremonese', type: 'Italian'},
        {id: 11, name: 'Mini hamburgers', imgSrc: 'assets/images/mini_hamburgers.jpg', author: 'Julien Ndiaye', type: 'Homemade hamburgers'},
        {id: 12, name: 'Chocolate cake', imgSrc: 'assets/images/chocolate_cake.jpg', author: 'Anja Weisser', type: 'Cake'},

    ];

    recipeList.innerHTML = '';

    // const recipeBoxes = document.querySelectorAll('.recipe-box');

    // recipeBoxes.forEach((box, index) => {
    //     let recipe = recipes[index];

    //     box.innerHTML = `
    //     <img src="${recipe.imgSrc}" alt="">
    //     <button class="heart">🩶</button>
    //     <p class="recipe-title">${recipe.name}</p>
    //     <p class="author">By ${recipe.author}</p>
    //     `;
    // });


    recipeList = document.querySelector('#recipe-list');

    recipes.forEach((recipe) => {
        createRecipeBox(recipe);
    });

    return recipes;
}


displayAllRecipes();


// Filter menu.

showAll.addEventListener('click', function() {
    displayAllRecipes();
})


const filters = document.querySelectorAll('.menu-filter');

filters.forEach(filter => filter.addEventListener('click', function() {
    recipeList.innerHTML = '';
    for (let recipe of recipes) {
        if (filter.innerText === recipe.type) {
            console.log(recipe);
            
            createRecipeBox(recipe);
        }
    }
}));



// Adding recipes to favourites.

let favouriteRecipes = [];
let hearts = document.querySelectorAll('.heart');


// hearts.forEach(heart => heart.addEventListener('click', function() {

//     // heart.innerText == '🩶' ? heart.innerText = '❤️' : heart.innerText = '🩶';
        
//         // if (favouriteRecipes.indexOf(heart.parentElement.innerHTML) === -1) {
//         //         favouriteRecipes.push(heart.parentElement.innerHTML);
//         //     }
            
//         // if (!favouriteRecipes.includes(heart.parentElement.innerHTML)) {
//         //         favouriteRecipes.push(heart.parentElement.innerHTML);
//         //     }
                
//         // let favouriteRecipesSet = new Set(favouriteRecipes);
//         // console.log(favouriteRecipesSet);
        
//         console.log(favouriteRecipes);
//     }
// ));
         
                

                
function getFavourites() {
    return JSON.parse(localStorage.getItem('favourites'))  || [];
}

function saveFavourites(arr) {
    localStorage.setItem('favourites', JSON.stringify(arr));
}

recipeList.addEventListener('click', function(e) {

    // const button = e.target.closest(".heart")
    const button = e.target;
    
    if (!button) {
        return;
    }

    const favouriteList = getFavourites();
    
    let isFavourite = favouriteList.some(recipe => recipe.id === Number(button.dataset.id));
    console.log(`result = ${!isFavourite}`);
    if (!isFavourite) {
        const recipe = recipes.find(item => item.id === Number(button.dataset.id));

        favouriteList.push(recipe);
        saveFavourites(favouriteList);
        button.innerText = '❤️';
    }
    else {
        const index = favouriteList.findIndex(recipe => recipe.id === Number(button.dataset.id));
        if (index !== -1) {
            favouriteList.splice(index, 1);
            saveFavourites(favouriteList);
            button.innerText = '🩶';
        }
    }

    console.log(favouriteList);
    isFavourite = getFavourites().some(recipe => recipe.id === button.dataset.id);

});


