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
        <img src="${recipe.imgSrc}" alt="Picture of ${recipe.name}">
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
        return [];
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

    search.addEventListener('input', function () {

        recipeList.innerHTML = '';

        async function searchRecipes() {

            let recipes = await fetchAllRecipes();
            let filterdArray = recipes.filter(recipe => recipe.name.toLowerCase().includes(search.value) || recipe.author.toLowerCase().includes(search.value));

            displayFilteredRecipes(filterdArray);
        }

        searchRecipes();

    });

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

                window.location.href = `http://127.0.0.1:5000/recipe/${recipe.id}`;

            }
        }

    }
    );
}



const recipeDetails = document.querySelector('#recipe-details');

if (recipeDetails) {

    function showRecipeDetails(recipe) {

        const ingredientsList = recipe.ingredients.map(ing => `<li class=ingredient>${ing.quantity || ''} ${ing.unit || ''} ${ing.name}</li>`).join('');

        const stepsList = recipe.steps.map((step, index) => `<li class="prep-step">${index + 1}. ${step.instruction}</li>`).join('');

        recipeDetails.innerHTML = `
            <h2>${recipe.name}</h2>
            <p>By ${recipe.author}</p>
            <img src=/${recipe.imgSrc} alt="Picture of ${recipe.name}">
            <p>Added on ${recipe.createdOn}</p>
            <h3>Preparation</h3>
            <p>${recipe.prepTime} min</p>
            <h3>Cook</h3>
            <p>${recipe.cookTime} min</p>
            <h3>Ingredients</h3>
            <div>
                <ul id="ingredients">
                    ${ingredientsList}
                </ul>
            </div>
            <div>
                <h3>Steps</h3>
                <ul id="steps">
                    ${stepsList}
                </ul>
            </div>
            `;

    }

    let recipe;

    async function fetchOneRecipe() {

        let url = window.location.pathname
        let recipeId = url.split('/').pop();

        const response = await fetch(`/api/recipe/${recipeId}`);

        if (!response.ok) {
            throw new Error(`Failed to get recipes: ${response.status}`)
        }

        recipe = await response.json();

        showRecipeDetails(recipe);

        return recipe.id;

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

const forms = document.querySelectorAll('.forms:not(#login-form)');
const infoDivs = document.querySelectorAll('.info');

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
const loginErrorMsg = document.querySelector('#login-error-msg');

const fields = document.querySelectorAll(`
    .forms input:not(#login-form input):not(#signup-form input[type="radio"]):not(#signup-form input[type="checkbox"]),
    .forms textarea,
    .forms select
`);


const errorMsg = document.querySelectorAll('.error');
const submitButton = document.querySelectorAll('.submit-btn');


function showError(element) {
    element.parentElement.classList.remove('success');
    element.parentElement.classList.add('failure');
}

function showSuccess(element) {
    element.parentElement.classList.remove('failure');
    element.parentElement.classList.add('success');
}

function checkRequired(element) {
    return element.value.trim() === '';
}

function checkLength(element, minLength) {
    const isValidLength = element.value.trim().length >= minLength;
    return { isValidLength, message: `${element.dataset.label} must be at least ${minLength} characters` };
}

function isValidEmail(email) {
    return (email.value.includes('@') && email.value.includes('.'));
}

function matchingPasswords(pwd, pwd2) {
    return (pwd.value == pwd2.value);
}


function isValidInput(element) {

    let isValid = true;
    const errorMsg = element.parentElement.querySelector('.error');

    if (checkRequired(element)) {
        errorMsg.innerText = 'This field is required';
        isValid = false;
    }

    else if (element === name) {

        const result = checkLength(element, 3);

        if (!result.isValidLength) {
            errorMsg.innerText = result.message;
            isValid = false;
        }
    }

    else if (element === email) {

        const result = checkLength(element, 8);

        if (!result.isValidLength) {
            errorMsg.innerText = result.message;
            isValid = false;
        }
        else if (!isValidEmail(element)) {
            errorMsg.innerText = 'Invalid email format';
            isValid = false;
        }
    }

    else if (element === formMsg) {

        const result = checkLength(element, 20);

        if (!result.isValidLength) {
            errorMsg.innerText = result.message;
            isValid = false;
        }
    }

    else if (element === firstname) {

        const result = checkLength(element, 2);

        if (!result.isValidLength) {
            errorMsg.innerText = result.message;
            isValid = false;
        }
    }

    else if (element === pwd) {

        const result = checkLength(element, 12);

        if (!result.isValidLength) {
            errorMsg.innerText = result.message;
            isValid = false;
        }
    }

    else if (element === pwd2) {
        if (!matchingPasswords(pwd, pwd2)) {
            errorMsg.innerText = 'Passwords do not match';
            isValid = false;
        }
    }

    return isValid;

}

function checkForErrors() {

    if (Array.from(fields).every(field => isValidInput(field))) {
        submitButton.forEach(btn => btn.disabled = false);
    }
    else {
        submitButton.forEach(btn => btn.disabled = true);
    }

}


if (forms) {


    fields.forEach(field => field.addEventListener('input', function (e) {

        isValidInput(e.target) ? showSuccess(e.target) : showError(e.target);
        checkForErrors();

    }));

    forms.forEach(form => form.addEventListener('submit', function (e) {

        e.preventDefault();

        form.submit();

    }));

}



// Contact.

if (contactForm) {

    async function submitMessage(message) {

        const response = await fetch('/api/contact', {
            method: 'POST',
            body: JSON.stringify(message),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Failed to get message. Status: ${response.status}`)
        }

        const data = await response.json();

        return data;

    }

    contactForm.addEventListener('submit', async function (e) {

        e.preventDefault();

        const formData = new FormData(contactForm);
        const message = Object.fromEntries(formData);

        try {
            const result = await submitMessage(message);
            console.log(`Success: ${JSON.stringify(result)}`);
            contactForm.reset();
        }
        catch (error) {
            console.log(error);
        }

    });

}


// Add recipe form.

const addButtons = document.querySelectorAll('.add-btn');
const deleteButtons = document.querySelectorAll('.delete-btn');
const dynamicRows = document.querySelectorAll('.dynamic-row');

let categories = [];
let ingredients = [];
let steps = [];

if (addButtons && deleteButtons) {

    infoDivs.forEach(div => div.addEventListener('click', function (e) {

        e.preventDefault();

        let deleteButton = e.target.closest('.delete-btn');
        let addButton = e.target.closest('.add-btn');

        function addRow() {

            if (!addButton) { return };

            let row = addButton.parentElement;
            let newRow = row.cloneNode(true);

            if (newRow.querySelector('input')) { newRow.querySelector('input').value = '' }
            else if (newRow.querySelector('textarea')) { newRow.querySelector('textarea').value = '' };

            row.parentElement.appendChild(newRow);

        }

        addRow();


        function deleteRow() {

            if (!deleteButton) { return };

            let targetRow = deleteButton.parentElement;
            let parentDiv = targetRow.parentElement;

            console.log(parentDiv.children.length);

            // if (parentDiv.children.length >= 4) {
            parentDiv.removeChild(targetRow);
            deleteButton.disabled = false;
            //     }
            // else {
            //     deleteButton.disabled = true;
            //     }
        }

        deleteRow();

    }))

}



// Login handling.

const loginLink = document.querySelector('#login-link');
const signupLink = document.querySelector('#signup-link');
const adminLink = document.querySelector('#admin-link');
const logoutLink = document.querySelector('#logout-link');

if (loginForm) {

    async function logIn(info) {

        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content'); // CSRF

        const response = await fetch('/api/log-in', {
            method: 'POST',
            body: JSON.stringify(info),
            headers: {'Content-Type': 'application/json' , 'X-CSRFToken': csrfToken} // CSRF
        });

        if (!response.ok) {
            throw new Error(`Invalid data. Status: ${response.status}`);
        }

        const data = await response.json();

        return data;

    }

    loginForm.addEventListener('submit', async function (e) {

        e.preventDefault();

        const formData = new FormData(loginForm);
        const info = Object.fromEntries(formData);

        try {
            const result = await logIn(info);
            console.log(`Connection successful: ${JSON.stringify(result)}`);

            if (result.role === 'user') {
                window.location.href = '/';
            }
            else if (result.role === 'admin') {
                window.location.href = '/fierce-comet-666';
            }
            else {
                throw new Error('Unknown role');
            }
        }
        catch (error) {
            console.log(error);
            loginErrorMsg.style.visibility = 'visible';
            loginForm.reset();
        }

    })
}


if (logoutLink) {

    logoutLink.addEventListener('click', function (e) {
        e.preventDefault();
        logOut();
    })

    async function logOut() {

        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content'); // CSRF

        const response = await fetch('/api/log-out', {method: 'POST', headers: {'X-CSRFToken': csrfToken}}) // CSRF

        if (!response.ok) {
            throw new Error(`Failed to log out. Status: ${response.status}`);
        }

        window.location.href = '/';

    }

}

const greetings = document.querySelector('#greetings');

async function checkSession() {

    const response = await fetch('/api/check-session', { method: 'GET' });
    const data = await response.json();

    if (response.status === 401) {
        console.log('User is not logged in');
        adminLink.className = 'off';
        logoutLink.className = 'off';
        greetings.innerText = '';
        return false;
    }

    if (!response.ok) {
        throw new Error(`Failed to check session. Status: ${response.status}`);
    }

    console.log('User is logged in:', data.firstname);
    greetings.innerText = `Hello, welcome ${data.firstname}!`;
    data.role === 'admin' ? adminLink.className = 'on' : adminLink.className = 'off';

    signupLink.className = 'off';
    loginLink.className = 'off';
    logoutLink.className = 'on';

    return true;
}

checkSession();


// Reset forms on reload.

window.addEventListener('load', function () {
    forms.forEach(form => form.reset());
})