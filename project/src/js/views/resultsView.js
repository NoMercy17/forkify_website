import View from './View.js';
import icons from 'url:../../img/icons.svg';
import previewView from './previewView.js';

class ResultsView extends View{
    _parentElement = document.querySelector('.results');
    _errorMessage = 'No recipes found for your query! Please try again :)';
    _message = '';

    _generateMarkup(){
        // we don t render it to the DOM, we just return the markup string to render method in View class,
        return this._data.map(result=> previewView.render(result, false)).join(''); 
    }

};

export default new ResultsView();