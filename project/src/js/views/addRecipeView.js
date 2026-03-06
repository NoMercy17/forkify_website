import View from './View.js';
import icons from 'url:../../img/icons.svg';

class AddRecipeView extends View{
    _parentElement = document.querySelector('.upload');
    _window = document.querySelector('.add-recipe-window');
    _overlay = document.querySelector('.overlay');
    _buttonOpen = document.querySelector('.nav__btn--add-recipe');
    _buttonClose = document.querySelector('.btn--close-modal');

    _message = 'Recipe was successfully uploaded';

    constructor(){
        super();
        this._addHandlerShowWindow(); 
        this._addHandlerHideWindow();
        this._addHandlerIngredients();
    }   
    
    toggleWindow(){
        this._overlay.classList.toggle('hidden');
        this._window.classList.toggle('hidden');
    };


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
            const dataArr = [...new FormData(this)]; // point to the upload form
            const data = Object.fromEntries(dataArr); // convert to object
            console.log(data);
            handler(data);
        });
    }

    _addHandlerIngredients(){
        const container = document.querySelector('#ingredients-list');
        const addBtn = document.querySelector('.upload__ingredient-add');

        addBtn.addEventListener('click', () => {
            const count = container.querySelectorAll('.upload__ingredient-row').length + 1;
            const html = `
                <div class="upload__ingredient-row">
                    <input type="number" step="any" name="ingredient-${count}-quantity" placeholder="Qty" />
                    <input type="text" name="ingredient-${count}-unit" placeholder="Unit" />
                    <input type="text" name="ingredient-${count}-description" placeholder="Description" />
                    <button type="button" class="upload__ingredient-delete">&times;</button>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });

        // Delete ingredient row (delegated)
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

    _generateMarkup(){
        
    }
    
}

export default new AddRecipeView();