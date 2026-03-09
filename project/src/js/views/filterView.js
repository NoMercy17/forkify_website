import View from './View.js';

class FilterView extends View {
  _parentElement = document.querySelector('.filter');

  addHandlerFilter(handler) {
    this._parentElement.addEventListener('change', function (e) {
      const btn = e.target.closest('.search-results__filter');
      if (!btn) return;

      const filterValue = btn.value;
      handler(filterValue);
    });
  }

  _generateMarkup() {
    return `
      <div class="search-results__filter-container">
        <label class="search-results__filter-label" for="filter-cooking-time">Max Cooking Time:</label>
        <select id="filter-cooking-time" class="search-results__filter">
          <option value="all">All</option>
          <option value="20">Under 20 mins</option>
          <option value="40">Under 40 mins</option>
          <option value="60">Under 60 mins</option>
        </select>
      </div>
    `;
  }

  renderFilter() {
    const markup = this._generateMarkup();
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}

export default new FilterView();
