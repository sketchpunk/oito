import DisplayGrid  from './DisplayGrid.js';
import SvgDraw      from './SvgDraw.js';
import Modes        from './modes/index.js';
import UI           from './UI.js';
//import * as Shapes  from './shapes/index.js';


class EditView extends HTMLElement{
    constructor(){
        super();

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.shapes         = [];
        this.modes          = new Modes( this );
        this.ui             = new UI( this );
        this.selectedShape  = null;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // LAYERS
        this.pools  = new Map();
        this.grid   = new DisplayGrid();
        this.svg    = new SvgDraw();

        this.appendChild( this.grid );
        this.appendChild( this.svg );        

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // EVENTS
        // Handle WebCom Resizing
        this.obResize = new ResizeObserver( ary=>{
            // TODO, Incase resize is funky try other values : contentRect / contentBoxSize / borderBoxSize
            const box = ary[ 0 ].contentRect;
            this.grid.setSize( box.width, box.height );
            this.svg.setSize( box.width, box.height );
        });
        this.obResize.observe( this );

        this.on( 'pointerdown', this._onPointerDown.bind( this ) );
        this.on( 'contextmenu', (e)=>e.preventDefault() );
    }

    connectedCallback(){}

    //#region SHAPES
    addShape( sh ){
        this.shapes.push( sh );
        this.svg.add( sh.element );
        return this;
    }

    removeShape( sh ){
        this.svg.remove( sh.element );
        return this;
    }

    selectShape( sh ){
        if( this.selectedShape == sh )  return;
        if( this.selectedShape )        this.deselectShape();

        this.selectedShape = sh;
        this.selectedShape.element.classList.add( 'sel' );
        this.emit( 'shapeselected', sh );

        //console.log( '[ Selecting %s ]', sh.name );
        return this;
    }

    deselectShape(){
        if( !this.selectedShape ) return;
        //console.log( '[ Deselecting %s ]', this.selectedShape.name );

        const sh = this.selectedShape;
        this.selectedShape.element.classList.remove( 'sel' );
        this.selectedShape = null;

        this.emit( 'shapedeselected', sh );
        return this;
    }
    //#endregion

    //#region EVENTS
    on( evtName, fn ){ this.addEventListener( evtName, fn ); return this;}
    off( evtName, fn ){ this.removeEventListener( evtName, fn ); return this; }
    emit( evtName, detail ){ this.dispatchEvent( new CustomEvent( evtName, { detail, bubbles:true, cancelable:true, composed:false } ) );  return this; }

    _onPointerDown( e ){
        const elm = e.target;
        if( e.button == 2 ) return;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( elm.tagName == 'svg' ){
            this.deselectShape();
            return;
        }
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const obj = elm._obj || elm.parentNode._obj;
        if( !obj ) return;

        if( this.selectedShape !== obj ){
            e.stopPropagation();
            e.preventDefault();
            this.selectShape( obj );
        }
    }
    //#endregion
}

window.customElements.define( "edit-view", EditView );
export default EditView;