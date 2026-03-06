import icons from 'url:../../img/icons.svg';

export default class View{
    _data;

        /**
         * Render the received object to the DOM
         * @param {Object | Object[]} data  
         * @param {boolean} render If false, create markup string instead of rendering to the DOM 
         * @returns {undefined | string} A markup string is returned if render=false
         * @this {Object} View instance
         * @author Nomercy17
        */
        render(data, render = true){
            if(!data || (Array.isArray(data) && data.length === 0)){
                return this.renderError();
            }
            this._data = data;
            const markup = this._generateMarkup();

            if (!render) return markup;

            this._clear();
            this._parentElement.insertAdjacentHTML('afterbegin', markup);
        }
        
        update(data){
            this._data = data;
            const newMarkup = this._generateMarkup();
            
            // virtual DOM to compare with real DOM
            const newDOM = document.createRange().createContextualFragment(newMarkup);
            const newElements = Array.from(newDOM.querySelectorAll('*'));
            const currElements = Array.from(this._parentElement.querySelectorAll('*'));

            newElements.forEach((newEl, i)=>{
                const currentEl = currElements[i];
                //console.log(currentEl, newEl.isEqualNode(currentEl));


                // Update changed TEXT
                if(!newEl.isEqualNode(currentEl) && newEl.firstChild?.nodeValue.trim()!== ''){
                    currentEl.textContent = newEl.textContent;
                }


                // Update changed ATTRIBUTES
                if(!newEl.isEqualNode(currentEl)){
                    //console.log(newEl.attributes);

                    Array.from(newEl.attributes)
                        .forEach(attr => currentEl.setAttribute(attr.name, attr.value));
                }
            });

        }


        _clear(){
            this._parentElement.innerHTML = '';
        }
    
        renderSpinner(){
            const markup = `
            <div class="spinner">
                <svg>
                <use href="${icons}#icon-loader"></use>
                </svg>
            </div>
            `;
            this._clear();  
            this._parentElement.insertAdjacentHTML('afterbegin', markup);
        }
    
        renderMessage(message = this._message){
            const markup = `
            <div class="message">
                <div>
                  <svg>
                    <use href="${icons}#icon-smile"></use>
                  </svg>
                </div>
                <p>${message}</p>
              </div> 
              `;
            this._clear();  
            this._parentElement.insertAdjacentHTML('afterbegin', markup);
        }
    
    
        renderError(message = this._errorMessage){
            const markup = `
            <div class="error">
                <div>
                  <svg>
                    <use href="${icons}#icon-alert-triangle"></use>
                  </svg>
                </div>
                <p>${message}</p>
              </div> 
              `;
            this._clear();  
            this._parentElement.insertAdjacentHTML('afterbegin', markup);
        }
}

