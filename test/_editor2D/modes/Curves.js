
import Base         from './Base.js';
import PointPool    from './pools/PointPool.js';
import LinePool     from './pools/LinePool.js';
import Modes        from './index.js';

class Curves extends Base{

    constructor( man, view ){
        super();
        this.modeName   = 'Curves';
        this.modeEvents = {
            'shapeselected'   : this.onShapeSelected.bind( this ),
            'shapedeselected' : this.onShapeDeselected.bind( this ),
            'pointerdown'     : this.onPointerDown.bind( this ),
        };

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.bindPointMove = this.onPointMove.bind( this );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.lines = man.pools.get( 'lines' );
        if( !this.lines ) man.pools.set( 'lines', ( this.lines = new LinePool( view ) ) );

        this.points = man.pools.get( 'points' );
        if( !this.points ) man.pools.set( 'points', ( this.points = new PointPool( view ) ) );
    }

    activate( view ){
        console.log( 'curves activate' );
        this.view = view;
        this.points.onMove      = this.bindPointMove;
        this.lines.useSelect    = false;                // Dont Want edge's selectable or moveable.

        this.mountEvents();
        
        if( this.view.selectedShape ) this.beginModeOn( this.view.selectedShape );
    }

    deactivate( view ){
        this.lines.reset();
        this.points.reset();
        this.unmountEvents();
        this.view = null;

        console.log( 'curves deactivate' );
    }

    onPointMove( x, y ){
        this.view.selectedShape.update();
        this.lines.refreshLines();

    }

    onPointerDown( e ){
        if( e.button == 2 ){
            if( this.points.selected.length > 0 ){
                this.points.deselectPoints();
            }else{
                this.view.deselectShape();
            }
        }
    }

    //#region SHAPES
    beginModeOn( sh ){
        if( !Modes.useCurves( sh.modes ) ){
            console.warn( 'Shape does not support curves mode' );
            return;
        }

        this.points.renderPoints( sh.getPoints() );

        this.lines.segments = sh.getControlPoints();
        this.lines.renderLines();
    }

    onShapeSelected( e ){
        const sh = e.detail;
        if( sh ) this.beginModeOn( sh );
    }

    onShapeDeselected( e ){
        this.points.recyclePoints();
        this.lines.recycleLines();
    }
    //#endregion
}

export default Curves;