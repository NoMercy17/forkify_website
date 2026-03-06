import View from './View.js';
import icons from 'url:../../img/icons.svg';

class AddRecipeView extends View{
    _parentElement = document.querySelector('.upload');
    _window = document.querySelector('.add-recipe-window');
    _overlay = document.querySelector('.overlay');
    _buttonOpen = document.querySelector('.nav__btn--add-recipe');
    _buttonClose = document.querySelector('.btn--close-modal');

    _message = 'Recipe was successfully uploaded';
    _closeTimeout = null;   // track pending auto-close so we can cancel it
    _submitting = false;    // guard against double-submit
    _formMarkup = null;     // snapshot of the original form HTML

    constructor(){
        super();
        this._formMarkup = this._parentElement.innerHTML; // save before any rendering
        this._addHandlerShowWindow(); 
        this._addHandlerHideWindow();
        this._addHandlerIngredients();
    }   
    
    toggleWindow(){
        // Cancel any pending auto-close timer
        if(this._closeTimeout){
            clearTimeout(this._closeTimeout);
            this._closeTimeout = null;
        }

        const isOpening = this._window.classList.contains('hidden');
        this._overlay.classList.toggle('hidden');
        this._window.classList.toggle('hidden');

        // Restore form when opening so it's always fresh
        if(isOpening) this._resetForm();
    };

    // Schedule auto-close after success (stores ID so it can be cancelled)
    scheduleClose(seconds){
        this._closeTimeout = setTimeout(() => this.toggleWindow(), seconds * 1000);
    }

    // Restore original form HTML and reset submission state
    _resetForm(){
        this._submitting = false;
        this._parentElement.innerHTML = this._formMarkup;
        this._addHandlerIngredients();
    }


    _addHandlerShowWindow(){
        this._buttonOpen.addEventListener('click', this.toggleWindow.bind(this)) // we point to the current object, not the button
    }

    _addHandlerHideWindow(){
        this._buttonClose.addEventListener('click',this.toggleWindow.bind(this));
        this._overlay.addEventListener('click',this.toggleWindow.bind(this));
    }

    _addHandlerUpload(handler){
        this._parentElement.addEventListener('submit', function(e){
            e.preventDefault();
            if(this._submitting) return;

            if(!this._validate()) return; // show errors, stop

            this._submitting = true;
            const dataArr = [...new FormData(e.target)];
            const data = Object.fromEntries(dataArr);
            handler(data);
        }.bind(this));
    }

    _validate(){
        const p = this._parentElement;
        const urlPattern = /^https?:\/\/.+\..+/;
        let valid = true;

        const check = (input, condition) => {
            input.classList.remove('upload__input--error');
            if(condition) {
                input.classList.add('upload__input--error');
                valid = false;
            }
        };

        const title       = p.querySelector('[name="title"]');
        const sourceUrl   = p.querySelector('[name="sourceUrl"]');
        const image       = p.querySelector('[name="image"]');
        const publisher   = p.querySelector('[name="publisher"]');
        const cookingTime = p.querySelector('[name="cookingTime"]');
        const servings    = p.querySelector('[name="servings"]');

        check(title,       !title.value.trim());
        check(sourceUrl,   !urlPattern.test(sourceUrl.value.trim())); // test the regex pattern if it exists
        check(image,       !urlPattern.test(image.value.trim()));
        check(publisher,   !publisher.value.trim());
        check(cookingTime, !cookingTime.value || +cookingTime.value <= 0 || isNaN(+cookingTime.value));
        check(servings,    !servings.value    || +servings.value    <= 0 || isNaN(+servings.value));

        const ingredients_row = p.querySelectorAll('.upload__ingredient-row');

        // all ingredients must have a description
        const hasIngredient = [...ingredients_row].every(
            row => row.querySelector('[name$="-description"]').value.trim()
        );
        if(!hasIngredient) {
            // highlight to show what's missing
            ingredients_row.forEach(row => {
                check(row.querySelector('[name$="-description"]'), true);
            });
        }

        ingredients_row.forEach(row => {
            const qty  = row.querySelector('[name$="-quantity"]');

            // If qty is provided it must be a positive number
            check(qty, qty.value !== '' && (+qty.value <= 0 || isNaN(+qty.value)));
        });

        return valid;
    }



    _addHandlerIngredients(){
        const container = document.querySelector('#ingredients-list');
        const addBtn = document.querySelector('.upload__ingredient-add');

        addBtn.addEventListener('click', () => {
            const count = container.querySelectorAll('.upload__ingredient-row').length + 1;
            const html = `
                <div class="upload__ingredient-row">
                    <input type="number" step="any" min="0.01" name="ingredient-${count}-quantity" placeholder="Qty" />
                    <input type="text" name="ingredient-${count}-unit" placeholder="Unit" />
                    <input type="text" name="ingredient-${count}-description" placeholder="Description" />
                    <button type="button" class="upload__ingredient-delete">&times;</button>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });

        // Delete ingredient row, event delegation
        container.addEventListener('click', e => {
            if(e.target.classList.contains('upload__ingredient-delete')){
                e.target.closest('.upload__ingredient-row').remove();
                // Renumber remaining rows
                container.querySelectorAll('.upload__ingredient-row').forEach((row, i) => {
                    const num = i + 1;
                    row.querySelector('[name$="-quantity"]').name = `ingredient-${num}-quantity`;
                    row.querySelector('[name$="-unit"]').name = `ingredient-${num}-unit`;
                    row.querySelector('[name$="-description"]').name = `ingredient-${num}-description`;
                });
            }
        });
    }

    
}

export default new AddRecipeView();