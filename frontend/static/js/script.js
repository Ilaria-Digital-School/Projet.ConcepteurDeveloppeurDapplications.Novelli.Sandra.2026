const toggleMainMenu = document.querySelector('#toggle-main-menu');
const toggleSideMenu = document.querySelector('#toggle-side-menu');
const cuisineGenres = document.querySelector('#cuisine-genres');
const showAll = document.querySelector('#show-all');
const search = document.querySelector('#search');
const nav = document.querySelector('nav');
const banner = document.querySelector('.banner');
const favourites = document.querySelector('#favourites');


// Mobile version: toggle main menu.

function hideMainMenu() {
    nav.classList.replace('active', 'off');
    toggleMainMenu.classList.replace('active', 'off');
    toggleMainMenu.setAttribute('aria-expanded', 'false');
}

function showMainMenu() {
    nav.classList.replace('off', 'active');
    toggleMainMenu.classList.replace('off', 'active');
    toggleMainMenu.setAttribute('aria-expanded', 'true');
}

toggleMainMenu.addEventListener('click', function () {
    nav.className === 'active' ? hideMainMenu() : showMainMenu();
})



// Showing or hiding side menu.

function hideSideMenu() {
    cuisineGenres.classList.replace('minus', 'plus');
    toggleSideMenu.innerText = '➕';
}

function showSideMenu() {
    cuisineGenres.classList.replace('plus', 'minus');
    toggleSideMenu.innerText = '➖';
}

if (toggleSideMenu) {
    toggleSideMenu.addEventListener('click', function () {
        cuisineGenres.className === 'minus' ? hideSideMenu() : showSideMenu();
    });
}



let recipeList = document.querySelector('#recipe-list');

function createRecipeBox(recipe) {

    let recipeBox = document.createElement('div');

    recipeBox.innerHTML = `
    <div class="recipe-box">
    <img src="${recipe.imgSrc}" alt="">
    <button class="heart" data-id="${recipe.id}">🩶</button>
    <p class="recipe-title">${recipe.name}</p>
    <p class="author">By ${recipe.author || 'Anonymous'}</p>
    <button class="view-recipe" data-id="${recipe.id}">View</button>
    </div>
    `;

    recipeList.appendChild(recipeBox);
}


let allRecipes = [];

async function fetchAllRecipes() {

    try {
        const response = await fetch('/api/recipes');

        if (!response.ok) {
            throw new Error(`Failed to get recipes: ${response.status}`);
        }

        allRecipes = await response.json();

        allRecipes.forEach(recipe => {
            createRecipeBox(recipe);
        })

        return allRecipes;

    }
    
    catch (error) {
        console.error(`Failed to get data:' ${error}`);
        // return []; // THIS SEEMS CRUCIAL.
    }
}


function displayFilteredRecipes(arr) {

    recipeList.innerHTML = '';

    arr.forEach(recipe => {
        createRecipeBox(recipe);
    })

}



if (banner) {

    window.addEventListener('load', function () {
        fetchAllRecipes();
    });


    // Filter menu.

    const filters = document.querySelectorAll('.filter-btn');

    filters.forEach(button => button.addEventListener('click', function () {
        recipeList.innerHTML = '';

        async function filterRecipes() {

            let recipes = await fetchAllRecipes();

            let filterdArray = recipes.filter(recipe => recipe.categories.includes(button.innerText))

            displayFilteredRecipes(filterdArray);

        }

        filterRecipes();

    }));

    showAll.addEventListener('click', function () {
        fetchAllRecipes();
    })

    search.addEventListener('input', function() {
        console.log('Typing...');
        console.log(search.value);
    })

}



// Adding recipes to favourites.

let favouriteRecipes = [];

if (banner || favourites) {

    recipeList.addEventListener('click', function (e) {

        const heartButton = e.target.closest('.heart');

        // To avoid errors if user clicks elsewhere on the recipeList.
        if (!heartButton) {
            return;
        }

        // console.log(heartButton);
        // console.log(heartButton.dataset.id);
        // console.log(recipes);

        const heartId = Number(heartButton.dataset.id);

        let isFavourite = function () {
            for (let fave of favouriteRecipes) {
                if (fave.id === heartId) {
                    return true;
                }
            }
            return false;
        }

        console.log(isFavourite());

        if (!isFavourite()) {
            for (let recipe of allRecipes) {
                if (recipe.id === heartId) {
                    // console.log(recipe);
                    favouriteRecipes.push(recipe);
                    heartButton.innerText = '❤️';
                }
            }
        }

        else {

            const indexToRemove = favouriteRecipes.findIndex(fave => fave.id === heartId)

            if (indexToRemove !== -1) {
                favouriteRecipes.splice(indexToRemove, 1);
                heartButton.innerText = '🩶';
            }

        }

        console.log(favouriteRecipes);

    });
}




// Displaying recipe details.

if (recipeList || banner) {

    recipeList.addEventListener('click', function (e) {

        const viewButton = e.target.closest('.view-recipe');

        // To avoid errors if user clicks elsewhere on the recipeList.
        if (!viewButton) {
            return;
        }

        console.log(viewButton.dataset.id);

        const viewButtonId = Number(viewButton.dataset.id);

        for (let recipe of allRecipes) {
            if (recipe.id === viewButtonId) {
                // console.log(recipe);

                window.location.href = `http://127.0.0.1:5000/recipe/${recipe.id}`;

            }
        }

    }
    );
}



let recipeDetails = document.querySelector('#recipe-details');

if (recipeDetails) {

    function showRecipeDetails(recipe) {

        // let recipePage = document.createElement('div');

        const ingredientsList = recipe.ingredients.map(i => `<li>${i.quantity || ''} ${i.unit || ''} ${i.name}</li>`).join('');

        const stepsList = recipe.steps.map(step => `<li>${step.instruction}</li>`).join('');

        recipeDetails.innerHTML = `
            <h2>${recipe.name}</h2>
            <p>By ${recipe.author}</p>
            <img src=/${recipe.imgSrc}>
            <p>Added on ${recipe.createdOn}</p>
            <h3>Preparation:</h3>
            <p>${recipe.prepTime} min</p>
            <h3>Cook:</h3>
            <p>${recipe.cookTime} min</p>
            <h3>Ingredients:</h3>
            <div>
                <ul id="ingredients">
                    ${ingredientsList}
                </ul>
            </div>
            <div>
                <h3>Steps:</h3>
                <ol id="steps">
                    ${stepsList}
                </ol>
            </div>
        `;

        // recipeDetails.appendChild(recipePage);

    }

    let recipe;

    async function fetchOneRecipe() {

        try {

            let url = window.location.pathname
            let recipeId = url.split('/').pop();

            const response = await fetch(`/api/recipe/${recipeId}`);

            if (!response.ok) {
                throw new Error(`Failed to get recipes: ${response.status}`)
            }

            recipe = await response.json();

            recipeDetails = document.querySelector('#recipe-details');

            showRecipeDetails(recipe);

            return recipe.id;

        }

        catch (error) {
            console.log(`Failed to get data: ${error}`)
        }
    }

    window.addEventListener('load', function () {
        fetchOneRecipe();
    });

}




// Displaying favourite recipes.

if (favourites) {
    console.log('Favourite page')
}



// Form error handling.

const forms = document.querySelectorAll('.forms');

const contactForm = document.querySelector('#contact-form');
const name = document.querySelector('#name');
const email = document.querySelector('#email');
const formMsg = document.querySelector('#form-msg');

const signupForm = document.querySelector('#signup-form');
const firstname = document.querySelector('#firstname');
const pwd = document.querySelector('#pwd');
const pwd2 = document.querySelector('#pwd2');
const country = document.querySelector('#country');

const loginForm = document.querySelector('#login-form');
const loginErrorMsg = document.querySelector('#login-error');

const fields = document.querySelectorAll(`
    #contact-form input,
    #contact-form textarea,
    #signup-form input:not([type="radio"]):not([type="checkbox"]),
    #signup-form select
`);

const errorMsg = document.querySelectorAll('.error');


function showError(element) {
    element.parentElement.classList.remove('success');
    element.parentElement.classList.add('failure');
}

function showSuccess(element) {
    element.parentElement.classList.remove('failure');
    element.parentElement.classList.add('success');
}

function checkRequired(element) {
    element.value.trim() === '' ? showError(element) : showSuccess(element);
}

if (errorMsg) {

    function checkLength(element, minLength) {
        element.value.length < minLength ? showError(element) : showSuccess(element);
        const errorMsg = element.parentElement.querySelector('.error');
        errorMsg.innerText = `${element.dataset.label} must be at least ${minLength} characters`;
    }

    function isValidEmail(email) {
        !email.value.includes('@') || !email.value.includes('.') ? showError(email) : showSuccess(email);
        const errorMsg = email.parentElement.querySelector('.error');
        errorMsg.innerText = `Invalid email format`
    }

    function matchingPasswords(pwd, pwd2) {
        pwd.value !== pwd2.value ? showError(pwd2) : showSuccess(pwd2);
        const errorMsg = pwd2.parentElement.querySelector('.error');
        errorMsg.innerText = `Passwords do not match`
    }


    fields.forEach(f => f.addEventListener('input', function (e) {

        checkRequired(e.target);

        if (e.target === name) { checkLength(name, 3) }
        else if (e.target === email) { checkLength(email, 8); isValidEmail(email) }
        else if (e.target === formMsg) { checkLength(formMsg, 20) }
        else if (e.target === firstname) { checkLength(firstname, 2) }
        else if (e.target === pwd) { checkLength(pwd, 12) }
        else if (e.target === pwd2) { matchingPasswords(pwd, pwd2) }

    }))

}


// Under construct.

forms.forEach(f => f.addEventListener('submit', function (e) {
    e.preventDefault()

}))



// Login form error handling.

if (loginForm) {
    loginForm.addEventListener('submit', function () {
        // if email or password is invalid:
        loginErrorMsg.style.visibility = 'visible';
    })
}


// Reset forms on reload.

window.addEventListener('load', function () {
    forms.forEach(form => form.reset());
})


// Contact.

if (contactForm) {

    async function submit_message() {

        try {
            const response = await fetch('/api/contact');

            if (!response.ok) {
                throw new Error(`Failed to get message: ${response.status}`)
            }

            const message = await response.json();
            console.log(message);

            return message;

        }

        catch (error) {
            console.log(`Failed to get message: ${error}`)
        }
    }

    contactForm.addEventListener('submit', function () {
        submit_message();
    });

}