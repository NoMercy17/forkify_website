import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { AJAX } from './helpers.js';


export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        resultsPerPage: RES_PER_PAGE,
        page: 1,
    },
    bookmarks:[]

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
    };
};

export const loadRecipe = async function(id){
    try{
        // Check if this is a user-uploaded recipe stored in localStorage
        const userRecipe = state.bookmarks.find(b => b.id === id && b.key);
        if(userRecipe){
            state.recipe = userRecipe;
        } else {
            const data = await AJAX(`${API_URL}${id}/information?apiKey=${KEY}`);
            state.recipe = createRecipeObject(data);
        }

        state.recipe.bookmarked = state.bookmarks.some(bookmark => bookmark.id === state.recipe.id);

        console.log(state.recipe);

    }catch(err){
        console.error(err + 'ours');
        throw err; // throw error to propagate, to controller
    };
};

export const loadSearchResults = async function(query){
    try{
        state.search.query = query;
        // Spoonacular complexSearch with full recipe info included
        const data = await AJAX(
            `${API_URL}complexSearch?query=${query}&apiKey=${KEY}&addRecipeInformation=true&number=50`
        );

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
            }))
        ];
        state.search.page = 1; // reset page to 1 when new search is made

    }catch(err){
        console.log(err + 'search');
        throw err;
    };
};

export const getSearchResultsPage = function(page = state.search.page){
    state.search.page = page;

    const start = (page-1) * RES_PER_PAGE;
    const end = page * RES_PER_PAGE;

    return state.search.results.slice(start, end); // -1 at the end because of slice
};


export const updateServings = function(newServings){
    state.recipe.ingredients.forEach(ingredient => {
        ingredient.quantity = 
        ingredient.quantity * newServings / state.recipe.servings; 
    });; 

    
    state.recipe.servings = newServings;
};

const persistBookmarks = function(){
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
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

const init = function(){
    const storage = localStorage.getItem('bookmarks');
    if(storage) state.bookmarks = JSON.parse(storage);

};

init();


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