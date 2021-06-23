import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import { async } from 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    // Get an id
    const id = window.location.hash.slice(1);
    //console.log(id);

    if (!id) return;
    recipeView.renderSpinner();

    // 0. Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1. Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2. Loading recipe
    await model.loadRecipe(id);

    // 3. Render a recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // 1.Get seach query
    const query = searchView.getQuery();
    if (!query) return;

    // 2.Load search results
    await model.loadSearchResults(query);

    // 3.Render results
    resultsView.render(model.getSearchResultsPage());

    // 4. Render initial pagination btns
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1.Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2. Render NEW pagination btns
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // 1. Update the recipe servings (in state)
  model.updateServings(newServings);

  // 2. Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1. Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // console.log(model.state.recipe);

  // 2. Update recipe view
  recipeView.update(model.state.recipe);

  // 3. Render bookmarks

  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();
    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(addRecipeView.toggleWindow, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSeach(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Welcome!');
};

init();
