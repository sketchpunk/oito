class DisplayGrid extends HTMLElement{
    
    constructor(){
        super();
        this.style.transformOrigin = "top left";
    }

    connectedCallback(){}

    //#region SETTERS
    setSize( w, h ){
        this.style.width  = w + 'px';
        this.style.height = h + 'px';
        return this;
    }
    //#endregion

    //#region METHODS
    hide(){ this.classList.add( 'hide' ); return this; }
    show(){ this.classList.remove( 'hide' ); return this; }
    toggle(){ this.classList.toggle( 'hide' ); return this; }
    //#endregion

}

window.customElements.define( "display-grid", DisplayGrid );
export default DisplayGrid;