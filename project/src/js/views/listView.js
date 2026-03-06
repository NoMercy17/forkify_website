import View from './View.js';
import icons from 'url:../../img/icons.svg';
import Fraction from 'fraction.js';

class ListView extends View {
    _parentElement = document.querySelector('.shopping-list__list');
    _errorMessage = 'Your list is empty. Add ingredients from a recipe!';
    _message = '';

    _buttonOpen = document.querySelector('.nav__btn--list');

    constructor() {
        super();
        this._addHandlerToggle();
    }

    _addHandlerToggle() {
        this._buttonOpen.addEventListener('click', function () {
            document.querySelector('.shopping-list').classList.toggle('hidden');
        });
    }

    addHandlerRender(handler) {
        window.addEventListener('load', handler);
    }

    addHandlerRemoveItem(handler) {
        this._parentElement.addEventListener('click', function (e) {
            const btn = e.target.closest('.shopping-list__btn--delete');
            if (!btn) return;
            handler(btn.dataset.id);
        });
    }

    _generateMarkup() {
        return this._data.map(item => this._generateMarkupItem(item)).join('');
    }

    _generateMarkupItem(item) {
        const qty = item.quantity ? new Fraction(item.quantity).toFraction(true) : '';
        return `
            <li class="shopping-list__item">
                <span class="shopping-list__qty">${qty}</span>
                <span class="shopping-list__unit">${item.unit}</span>
                <span class="shopping-list__desc">${item.description}</span>
                <button class="shopping-list__btn--delete" data-id="${item.id}">
                    <svg>
                        <use href="${icons}#icon-minus-circle"></use>
                    </svg>
                </button>
            </li>
        `;
    }
}

export default new ListView();
