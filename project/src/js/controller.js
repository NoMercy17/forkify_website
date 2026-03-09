import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import listView from './views/listView.js';
import filterView from './views/filterView.js';

// firefox additions
import '@fontsource/nunito-sans/400.css';
import '@fontsource/nunito-sans/600.css';
import '@fontsource/nunito-sans/700.css';

import 'core-js/stable'; // for polyfilling everything else
import 'regenerator-runtime/runtime';// for polyfilling async await


const MODAL_CLOSE_SEC = Number(process.env.MODAL_CLOSE_SEC);

///////////////////////////////////////


const controlRecipe = async function(){
  try{

    const id = window.location.hash.slice(1);
    //console.log(id);

    if(!id) return; 
    recipeView.renderSpinner();

    // update results to mark select search result
    resultsView.update(model.getSearchResultsPage());

    
    // Loading recipe
    await model.loadRecipe(id);
    const {recipe} = model.state;
    
    // Rendering recipe
    recipeView.render(model.state.recipe);
    
    bookmarksView.update(model.state.bookmarks); // update bookmarks view to mark last selected bookmark
  }catch(err){
    recipeView.renderError();
  }

};

const controlSearchResults = async function(){
  try{
    const query = searchView.getQuery();

    if(!query) return;

    resultsView.renderSpinner();
    //console.log(resultsView);

    await model.loadSearchResults(query);

    // Render filter UI
    filterView.renderFilter();

    resultsView.render(model.getSearchResultsPage());

    // Render initial pagination
    paginationView.render(model.state.search);
  }catch(err){
    // console.log(err);
  }
}

const controlPagination = function(goToPage){
  // New results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // New pagination buttons
  paginationView.render(model.state.search);

}

const controlServings = function(newServings){

  // update recipe servings in state
  model.updateServings(newServings);

  // update only text / attributes and not fully re-rendering
  recipeView.update(model.state.recipe);

}

const controlFilter = function (maxTime) {
  // 1) Filter results in state
  model.filterResults(maxTime);

  // 2) Render NEW results
  resultsView.render(model.getSearchResultsPage());

  // 3) Render NEW pagination buttons
  paginationView.render(model.state.search);
};


const controlAddBookmark = function(){
  if(!model.state.recipe.bookmarked)
    model.addBookmark(model.state.recipe);
  else
    model.deleteBookmark(model.state.recipe.id);
  
  // Update recipe view
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks);

}

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe){
  try{

    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    //console.log(model.state.recipe);

    recipeView.render(model.state.recipe); 

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window (tracked so manual close can cancel it)
    addRecipeView.scheduleClose(MODAL_CLOSE_SEC);

  }catch(err){
      // console.error(err+"upload");
      addRecipeView.renderError(err.message);
  }
  // Upload new recipe
}


const controlAddToList = function () {
  model.addToList(model.state.recipe.ingredients);
  listView.render(model.state.shoppingList);
};

const controlRemoveFromList = function (id) {
  model.removeFromList(id);
  listView.render(model.state.shoppingList);
};

const controlRenderList = function () {
  listView.render(model.state.shoppingList);
};

// Subscriber
const init = function(){

  bookmarksView.addHandlerRender(controlBookmarks);


  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerAddToList(controlAddToList);

  listView.addHandlerRender(controlRenderList);
  listView.addHandlerRemoveItem(controlRemoveFromList);

  searchView.addHandlerSearch(controlSearchResults);

  paginationView.addHandlerClick(controlPagination);

  filterView.addHandlerFilter(controlFilter);

  addRecipeView._addHandlerUpload(controlAddRecipe)

};

init();