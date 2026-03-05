import View from './View.js';
import icons from 'url:../../img/icons.svg';
import previewView from './previewView.js';

class BookmarksView extends View{
    _parentElement = document.querySelector('.bookmarks__list');
    _errorMessage = 'No bookmarks yet. Find a nice recipe and bookmark it';
    _message = '';

    addHandlerRender(handler){
        window.addEventListener('load', handler);
    }

    _generateMarkup(){
        // we don t render it to the DOM, we just return the markup string to render method in View class,
        return this._data.map(bookmarks=> previewView.render(bookmarks, false)).join(''); 
    }

};

export default new BookmarksView();