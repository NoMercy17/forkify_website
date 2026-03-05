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

const createRecipeObject = function(data){
    const {recipe} = data.data;
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url, 
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && {key: recipe.key}), // if there is a key, add it to the object
    };
};

export const loadRecipe = async function(id){
    try{
        const data = await AJAX(`${API_URL}${id}?key=${state.KEY}`);

        state.recipe = createRecipeObject(data);

        if(state.bookmarks.some(bookmark => bookmark.id === state.recipe.id))
            state.recipe.bookmarked = true;
        else
            state.recipe.bookmarked = false;
        
        // Renderring the recipe
        console.log(state.recipe);

    }catch(err){
        console.error(err+"ours");
        throw err; // throw error to propagate, to controller
    };
};

export const loadSearchResults = async function(query){
    try{
        state.search.query = query;
        // load recipes including ours wtih &key...
        const data = await AJAX(`${API_URL}?search=${query}&key=${state.KEY}`);

        const {recipes} = data.data;
        state.search.results = recipes.map(rec =>{
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                sourceUrl: rec.source_url,
                image: rec.image_url, 
                ...(rec.key && {key: rec.key}),
            };
        });
        state.search.page = 1; // reset page to 1 when new search is made

    }catch(err){
        console.log(err+"search");
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


// for development only
const clearBookmarks = function(){
    localStorage.clear('bookmarks');
};


export const uploadRecipe = async function(newRecipe){
    try{
        console.log(Object.entries(newRecipe));
        const ingredients = Object.entries(newRecipe)
            .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
            .map(ing =>{
                const ingArr = ing[1].split(',').map(
                    el => el.trim()
                );

                if(ingArr.length !== 3)
                    throw new Error('Wrong ingredient format! Please use the correct format!!');

                const [quantity, unit, description] = ingArr;

                return {quantity: quantity ? +quantity : null, unit, description};
            });

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        }    
        console.log(recipe);

        // its send the recipe back, we await it
        const data = await AJAX(`${API_URL}?key=${state.KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);

    }catch(err){
        throw err;
    };

};