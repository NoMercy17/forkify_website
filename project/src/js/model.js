const API_URL = process.env.API_URL;
const RES_PER_PAGE = Number(process.env.RES_PER_PAGE);
const KEY = process.env.KEY;
import { AJAX } from './helpers.js';
import { MOCK_RECIPE } from './mockData.js';

const DEV_MODE = false; // Set to false when API is available


export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        originalResults: [],
        resultsPerPage: RES_PER_PAGE,
        page: 1,
    },
    bookmarks:[],
    shoppingList: [],
};

const createRecipeObject = function(recipe){
    // recipe is the raw Spoonacular recipe object
    return {
        id: String(recipe.id),
        title: recipe.title,
        publisher: recipe.sourceName || recipe.creditsText || 'Unknown',
        sourceUrl: recipe.sourceUrl,
        image: recipe.image,
        servings: recipe.servings,
        cookingTime: recipe.readyInMinutes,
        ingredients: (recipe.extendedIngredients || []).map(ing => ({
            quantity: ing.amount ?? null,
            unit: ing.unit,
            description: ing.name,
        })),
        ...(recipe.key && { key: recipe.key }), // for user-uploaded recipes stored locally
        ...(recipe.nutrition?.nutrients && { nutrients: recipe.nutrition.nutrients }), // dynamic nutrients from API
        // For user-uploaded recipes, we map individual fields if they exist
        ...(recipe.calories && { calories: recipe.calories }),
        ...(recipe.protein && { protein: recipe.protein }),
        ...(recipe.carbs && { carbs: recipe.carbs }),
        ...(recipe.fat && { fat: recipe.fat }),
    };
};

export const loadRecipe = async function(id){
    try{
        // Check if this is a user-uploaded recipe stored in localStorage
        const userRecipe = state.bookmarks.find(b => b.id === id && b.key);
        if(userRecipe){
            state.recipe = userRecipe;
        } else {
            let data;
            if(DEV_MODE) {
                data = MOCK_RECIPE;
            } else {
                data = await AJAX(`${API_URL}${id}/information?apiKey=${KEY}&includeNutrition=true`);
            }
            state.recipe = createRecipeObject(data);
        }

        state.recipe.bookmarked = state.bookmarks.some(bookmark => bookmark.id === state.recipe.id);
        // console.log(state.recipe);

    }catch(err){
        // console.error(err + 'ours');
        throw err; // throw error to propagate, to controller
    };
};

export const loadSearchResults = async function(query){
    try{
        state.search.query = query;

        let data;
        if (DEV_MODE) {
            // Mock a search response containing our golden recipe
            data = {
                results: [
                    {
                        id: MOCK_RECIPE.id,
                        title: MOCK_RECIPE.title,
                        sourceName: MOCK_RECIPE.sourceName,
                        image: MOCK_RECIPE.image,
                        readyInMinutes: MOCK_RECIPE.readyInMinutes,
                    }
                ]
            };
        } else {
            // Spoonacular complexSearch with full recipe info included
            data = await AJAX(
                `${API_URL}complexSearch?query=${query}&apiKey=${KEY}&addRecipeInformation=true&number=50`
            );
        }

        // Merge API results with any locally stored user recipes that match the query
        const localMatches = state.bookmarks.filter(
            b => b.key && b.title.toLowerCase().includes(query.toLowerCase())
        );

        state.search.results = [
            ...localMatches,
            ...data.results.map(rec => ({
                id: String(rec.id),
                title: rec.title,
                publisher: rec.sourceName || rec.creditsText || 'Unknown',
                image: rec.image,
                cookingTime: rec.readyInMinutes,
            }))
        ];
        state.search.originalResults = [...state.search.results];
        state.search.page = 1; // reset page to 1 when new search is made

    }catch(err){
        // console.log(err + 'search');
        throw err;
    };
};

export const getSearchResultsPage = function(page = state.search.page){
    state.search.page = page;

    const start = (page-1) * RES_PER_PAGE;
    const end = page * RES_PER_PAGE;

    return state.search.results.slice(start, end); // -1 at the end because of slice
};

export const filterResults = function (maxTime) {
    if (maxTime === 0 || maxTime === 'all') {
        state.search.results = [...state.search.originalResults];
    } else {
        state.search.results = state.search.originalResults.filter(
            rec => rec.cookingTime <= maxTime
        );
    }
    state.search.page = 1;
};


export const updateServings = function(newServings){
    // Update ingredients
    state.recipe.ingredients.forEach(ingredient => {
        ingredient.quantity = 
        ingredient.quantity * newServings / state.recipe.servings; 
    });

    // Update nutrients
    if (state.recipe.nutrients) {
        state.recipe.nutrients.forEach(nut => {
            // Scale both the amount and the daily percentage
            nut.amount = nut.amount * newServings / state.recipe.servings;
            if (nut.percentOfDailyNeeds) {
                nut.percentOfDailyNeeds = nut.percentOfDailyNeeds * newServings / state.recipe.servings;
            }
        });
    }

    // Update individual fields (for user-uploaded recipes)
    if (state.recipe.calories) state.recipe.calories = state.recipe.calories * newServings / state.recipe.servings;
    if (state.recipe.protein) state.recipe.protein = state.recipe.protein * newServings / state.recipe.servings;
    if (state.recipe.carbs) state.recipe.carbs = state.recipe.carbs * newServings / state.recipe.servings;
    if (state.recipe.fat) state.recipe.fat = state.recipe.fat * newServings / state.recipe.servings;

    state.recipe.servings = newServings;
};

const persistBookmarks = function(){
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

const persistList = function(){
    localStorage.setItem('shoppingList', JSON.stringify(state.shoppingList));
};

export const addToList = function(ingredients, recipeTitle){
    ingredients.forEach(ing => {
        // Unique id: recipeTitle + description — prevents same ingredient from same recipe being added twice
        const id = `${recipeTitle}-${ing.description}`.toLowerCase().replace(/\s+/g, '-');

        const exists = state.shoppingList.find(item => item.id === id);
        if(exists) return; // skip duplicate from the same recipe

        state.shoppingList.push({
            id,
            quantity: ing.quantity,
            unit: ing.unit,
            description: ing.description,
        });
    });
    persistList();
};

export const removeFromList = function(id){
    state.shoppingList = state.shoppingList.filter(item => item.id !== id);
    persistList();
};


export const addBookmark = function(recipe){
    state.bookmarks.push(recipe);

    // Mark current recipe
    if(recipe.id === state.recipe.id)
        state.recipe.bookmarked = true;

    persistBookmarks();
};

export const deleteBookmark = function(id){
    // delete bookmark
    state.bookmarks.splice(state.bookmarks.findIndex(el => el.id === id), 1);

    if(id === state.recipe.id){
        state.recipe.bookmarked = false;
    }

    persistBookmarks();
};


export const uploadRecipe = async function(newRecipe){
    try{
        // Collect ingredient rows from separate fields
        const ingredientNums = new Set(
            Object.keys(newRecipe)
                .filter(k => k.startsWith('ingredient-'))
                .map(k => k.split('-')[1])
        );

        const ingredients = [...ingredientNums]
            .sort((a, b) => +a - +b)
            .map(num => ({
                quantity: newRecipe[`ingredient-${num}-quantity`]
                    ? +newRecipe[`ingredient-${num}-quantity`]
                    : null,
                unit: newRecipe[`ingredient-${num}-unit`] || '',
                description: newRecipe[`ingredient-${num}-description`] || '',
            }))
            .filter(ing => ing.description);

        // Spoonacular has no free upload endpoint —> store the recipe locally
        const recipe = {
            // Generate a unique local ID (prefixed to avoid collision with Spoonacular IDs)
            id: `user-${Date.now()}`,
            title: newRecipe.title,
            sourceUrl: newRecipe.sourceUrl,
            image: newRecipe.image,
            publisher: newRecipe.publisher,
            cookingTime: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
            key: 'user', // flag to show the user-generated icon in views
        };

        state.recipe = recipe;
        addBookmark(state.recipe); // persist in localStorage via bookmarks

    }catch(err){
        throw err;
    };

};

const init = function(){
    const storage = localStorage.getItem('bookmarks');
    if(storage) state.bookmarks = JSON.parse(storage);

    const listStorage = localStorage.getItem('shoppingList');
    if(listStorage) state.shoppingList = JSON.parse(listStorage);
};

init();