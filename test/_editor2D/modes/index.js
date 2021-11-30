// Points   - Edititing Points
// Edges    - Editing Edges
// Control  - Handle Control Points

import MoveMode     from './Move.js';
import PointsMode   from './Points.js';
import EdgesMode    from './Edges.js';
import CurvesMode   from './Curves.js';

class Modes{
    static POINTS = 1;
    static EDGES  = 2;
    static CURVES = 4;

    static hasMode( v, m ){ return ( (v & m) != 0 ); }
    static usePoints( v ){  return ( (v & this.POINTS ) != 0 ); }
    static useEdges( v ){   return ( (v & this.EDGES )  != 0 ); }
    static useCurves( v ){  return ( (v & this.CURVES ) != 0 ); }

    constructor( view ){
        this.view       = view;
        this.selected   = null;
        this.pools      = new Map();

        this.list       = new Map();
        this.list.set( 'move',      new MoveMode( this, view ) );
        this.list.set( 'points',    new PointsMode( this, view ) );
        this.list.set( 'edges',     new EdgesMode( this, view ) );
        this.list.set( 'curves',    new CurvesMode( this, view ) );
    }

    activate( modeName ){
        const mode = this.list.get( modeName );
        if( !mode ){
            console.log( 'Unknown Mode Name', modeName );
            return;
        }

        if( this.selected ) this.deactivate();

        this.selected = mode;
        mode.activate( this.view );
        return this;
    }

    deactivate(){
        if( !this.selected ) return;

        this.selected.deactivate( this.view );
        this.selected = null;

        return this;
    }
}

export default Modes;