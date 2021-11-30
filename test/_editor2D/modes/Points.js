//#region IMPORTS
import Base         from './Base.js';
import Modes        from '../modes/index.js';
import PointPool    from './pools/PointPool.js';
//#endregion

class Points extends Base{

    //#region MAIN
    constructor( man, view ){
        super();
        this.modeName   = 'Points';
        this.modeEvents = {
            'shapeselected'   : this.onShapeSelected.bind( this ),
            'shapedeselected' : this.onShapeDeselected.bind( this ),
            'pointerdown'     : this.onPointerDown.bind( this ),
        };

        this.bindPointMove = this.onPointMove.bind( this );

        this.points = man.pools.get( 'points' );
        if( !this.points ) man.pools.set( 'points', ( this.points = new PointPool( view ) ) );
    }
    //#endregion


    //#region EVENTS
    
    onPointMove( x, y ){
        this.view.selectedShape.update();
    }

    onPointerDown( e ){
        if( e.button == 2 ){
            if( this.points.selected.length > 0 )
                this.points.deselectPoints();
            else
                this.view.deselectShape();
        }
    }
    
    //#endregion


    //#region MODE OVERRIDES
    activate( view ){
        this.view           = view;
        this.points.onMove  = this.bindPointMove;
        this.mountEvents();

        if( this.view.selectedShape ) this.beginModeOn( this.view.selectedShape );
    }

    deactivate( view ){
        this.points.reset();
        this.unmountEvents();
        this.view = null;
    }
    //#endregion


    //#region SHAPES
    beginModeOn( sh ){
        if( !Modes.usePoints( sh.modes ) ){
            console.warn( 'Shape does not support points mode' );
            return;
        }

        this.points.renderPoints( sh.getPoints() );
    }

    onShapeSelected( e ){
        const sh = e.detail;
        if( sh ) this.beginModeOn( sh );
    }

    onShapeDeselected( e ){
        this.points.recyclePoints();
    }
    //#endregion

}

export default Points;