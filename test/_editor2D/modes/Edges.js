//#region IMPORTS
import Base     from './Base.js';
import Modes    from '../modes/index.js';
import LinePool from './pools/LinePool.js';
//#endregion

class Edges extends Base{

    //#region MAIN
    constructor( man, view ){
        super();
        this.modeName   = 'Edges';
        this.modeEvents = {
            'shapeselected'   : this.onShapeSelected.bind( this ),
            'shapedeselected' : this.onShapeDeselected.bind( this ),
            'pointerdown'     : this.onPointerDown.bind( this ),
        };

        this.bindLinesMove = this.onLinesMove.bind( this );

        this.lines = man.pools.get( 'lines' );
        if( !this.lines ) man.pools.set( 'lines', ( this.lines = new LinePool( view ) ) );
    }
    //#endregion


    //#region EVENTS
    onLinesMove( x, y ){ this.view.selectedShape.update(); }

    onPointerDown( e ){
        if( e.button == 2 ){
            if( this.lines.selected.length > 0 )
                this.lines.deselectLines();
            else
                this.view.deselectShape();
        }
    }
    //#endregion


    //#region MODE OVERRIDES
    activate( view ){
        this.view           = view;
        this.lines.onMove   = this.bindLinesMove;

        this.mountEvents();
        if( this.view.selectedShape ) this.beginModeOn( this.view.selectedShape );
    }

    deactivate( view ){
        this.lines.reset();
        this.unmountEvents();
    }
    //#endregion


    //#region SHAPES
    beginModeOn( sh ){
        if( !Modes.useEdges( sh.modes ) ){
            console.warn( 'Shape does not support edges mode' );
            return;
        }

        this.lines.segments = sh.getEdges();
        this.lines.renderLines();
    } 

    onShapeSelected( e ){
        const sh = e.detail;
        if( sh ) this.beginModeOn( sh );
    }

    onShapeDeselected( e ){
        this.lines.recycleLines();
    }
    //#endregion

}

export default Edges;