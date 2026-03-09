import icons from 'url:../../img/icons.svg';
import Fraction from 'fraction.js';
import View from './View.js';



class RecipeView extends View{
    _parentElement = document.querySelector('.recipe');
    _errorMessage = 'Search for a recipe and select it to see the details ;)';
    _message = '';
    

    // Publisher
    addHandlerRender(handler){
        ['hashchange', 'load'].forEach(e => window.addEventListener(e, handler));
    }


    addHandlerUpdateServings(handler){
        this._parentElement.addEventListener('click', function(e){
            const btn = e.target.closest('.btn--update-servings');
            if(!btn) return;
            // console.log(btn); 
            const {updateTo} = btn.dataset;
            if(! +updateTo) return;
            
            if(+updateTo > 0){  
                handler(+updateTo);
            }
        });
    }

    addHandlerAddBookmark(handler){
        this._parentElement.addEventListener('click', function(e){
            const btn = e.target.closest('.btn--bookmark');
            if(!btn) return;
            handler();
        })
    }

    addHandlerAddToList(handler){
        this._parentElement.addEventListener('click', function(e){
            const btn = e.target.closest('.btn--add-to-list');
            if(!btn) return;
            handler();
        });
    }

    _generateMarkup(){
        // Extract main nutrients for the summary
        const mainNutrientNames = ['Calories', 'Protein', 'Carbohydrates', 'Fat'];
        
        // Define the desired order for hierarchical display
        const nutrientOrder = [
            'Fat', 'Saturated Fat', 'Cholesterol', 'Sodium', 
            'Carbohydrates', 'Fiber', 'Sugar', 'Net Carbohydrates', 
            'Protein'
        ];

        // 1. Summary Nutrients (the "Big 4") - Force specific order
        const summaryNutrients = mainNutrientNames.map(name => 
            this._data.nutrients?.find(nut => nut.name === name)
        ).filter(Boolean);
        
        // 2. Detailed Nutrients (everything else + hierarchical ones)
        const detailedNutrients = this._data.nutrients 
            ? [...this._data.nutrients]
                .filter(nut => !['Calories'].includes(nut.name)) // Exclude calories from list
                .sort((a, b) => {
                    const indexA = nutrientOrder.indexOf(a.name);
                    const indexB = nutrientOrder.indexOf(b.name);
                    if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                })
            : [];

        return `
            <figure class="recipe__fig">
                <img src="${this._data.image}" alt="${this._data.title}" class="recipe__img" />
                <h1 class="recipe__title">
                    <span>${this._data.title}</span>
                </h1>
            </figure>

            <div class="recipe__details">
                <div class="recipe__info">
                    <svg class="recipe__info-icon">
                        <use href="${icons}#icon-clock"></use>
                    </svg>
                    <span class="recipe__info-data recipe__info-data--minutes">${this._data.cookingTime}</span>
                    <span class="recipe__info-text">minutes</span>
                </div>
                <div class="recipe__info">
                    <svg class="recipe__info-icon">
                        <use href="${icons}#icon-users"></use>
                    </svg>
                    <span class="recipe__info-data recipe__info-data--people">${this._data.servings}</span>
                    <span class="recipe__info-text">servings</span>
                    <div class="recipe__info-buttons">
                        <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings - 1}">
                            <svg>
                                <use href="${icons}#icon-minus-circle"></use>
                            </svg>
                        </button>
                        <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings + 1}">
                            <svg>
                                <use href="${icons}#icon-plus-circle"></use>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="recipe__user-generated ${this._data.key ? '' : 'hidden'}">
                    <svg>
                        <use href="${icons}#icon-user"></use>
                    </svg>
                </div>

                <button class="btn--round btn--bookmark">
                    <svg class="">
                        <use href="${icons}#icon-bookmark${this._data.bookmarked ? '-fill' : ''}"></use>
                    </svg>
                </button>
            </div>

            <div class="recipe__ingredients">
                <h2 class="heading--2">Recipe ingredients</h2>
                <ul class="recipe__ingredient-list">
                    ${this._data.ingredients.map(this._generateMarkupIngredient).join('')}
                </ul>
                <button class="btn--small btn--add-to-list recipe__btn--add-list">
                    <svg class="search__icon">
                        <use href="${icons}#icon-list"></use>
                    </svg>
                    <span>Add to List</span>
                </button>
            </div>

            <div class="recipe__nutrition">
                <h2 class="heading--2">Nutrition Facts (per serving)</h2>
                
                <div class="recipe__nutrition-summary">
                    ${summaryNutrients.length > 0 
                        ? summaryNutrients.map(this._generateMarkupNutrientCard).join('')
                        : this._generateDefaultNutritionMarkup()
                    }
                </div>

                ${detailedNutrients.length > 0 ? `
                    <div class="recipe__nutrition-details">
                        <ul class="recipe__nutrition-list">
                            ${detailedNutrients.map(this._generateMarkupNutrientRow).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>

            <div class="recipe__directions">
                <h2 class="heading--2">How to cook it</h2>
                <p class="recipe__directions-text">
                    This recipe was carefully designed and tested by
                    <span class="recipe__publisher">${this._data.publisher}</span>. Please check out
                    directions at their website.
                </p>
                <a
                    class="btn--small recipe__btn"
                    href="${this._data.sourceUrl}"
                    target="_blank"
                >
                    <span>Directions</span>
                    <svg class="search__icon">
                        <use href="${icons}#icon-arrow-right"></use>
                    </svg>
                </a>
            </div>`;
    }

    _generateMarkupNutrientCard(nut) {
        const labelMap = {
            'Calories': 'Kcal',
            'Carbohydrates': 'Carbs',
            'Protein': 'Protein',
            'Fat': 'Fat'
        };

        return `
            <div class="recipe__nutrition-item">
                <span class="recipe__nutrition-value">${Math.round(nut.amount)}</span>
                <span class="recipe__nutrition-label">${nut.unit}</span>
                <span class="recipe__nutrition-text">${labelMap[nut.name] || nut.name}</span>
            </div>
        `;
    }

    _generateMarkupNutrientRow(nut) {
        // Define which nutrients should be indented
        const subNutrientNames = ['Saturated Fat', 'Sugar', 'Net Carbohydrates', 'Fiber'];
        const isSub = subNutrientNames.includes(nut.name);

        return `
            <li class="recipe__nutrition-row ${isSub ? 'recipe__nutrition-row--sub' : ''}">
                <span class="recipe__nutrition-name">${nut.name}</span>
                <span class="recipe__nutrition-amount">${Math.round(nut.amount)}${nut.unit}</span>
                <span class="recipe__nutrition-daily">${Math.round(nut.percentOfDailyNeeds)}%</span>
            </li>
        `;
    }

    _generateDefaultNutritionMarkup() {
        const defaultNutrients = [
            { value: this._data.calories, label: 'kcal', text: 'Kcal' },
            { value: this._data.protein, label: 'g', text: 'Protein' },
            { value: this._data.carbs, label: 'g', text: 'Carbs' },
            { value: this._data.fat, label: 'g', text: 'Fat' },
        ];

        return defaultNutrients
            .map(
                nut => `
            <div class="recipe__nutrition-item">
                <span class="recipe__nutrition-value">${nut.value || '---'}</span>
                <span class="recipe__nutrition-label">${nut.label}</span>
                <span class="recipe__nutrition-text">${nut.text}</span>
            </div>
        `
            )
            .join('');
    }

    _generateMarkupIngredient(ing){
        return `
            <li class="recipe__ingredient">
                <svg class="recipe__icon">
                    <use href="${icons}#icon-check"></use>
                </svg>
                <div class="recipe__quantity">${ing.quantity ? new Fraction(ing.quantity).toFraction(true): ''}</div>
                <div class="recipe__description">
                    <span class="recipe__unit">${ing.unit}</span>
                    ${ing.description}
                </div>
            </li>
        `;
    }
        
    }


export default new RecipeView();