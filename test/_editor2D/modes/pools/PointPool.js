//#region IMPORTS
import Svg      from '../../Svg.js';
//#endregion

class PointPool{

    constructor( view ){
        this.view       = view;
        this.pool       = [];
        this.active     = [];
        this.selected   = [];
        this.offsets    = [];

        this.onSelect   = null;
        this.onMove     = null;

        this.bindMove   = this.onPointerMove.bind( this );
        this.bindUp     = this.onPointerUp.bind( this );
    }

    reset(){
        this.onSelect = null;
        this.onMove   = null;
        this.deselectPoints();
        this.recyclePoints();
    }

    //#region SELECTION
    deselectPoints(){
        for( let i of this.selected ) i.classList.remove( 'pntSel' );
        this.selected.length = 0;
    }

    onPointSelect( e ){
        const pnt = e.target;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( this.selected.indexOf( pnt ) == -1 ){
            if( !e.shiftKey ) this.deselectPoints();            // Not mult-select, deselect whats there
            
            pnt.classList.add( 'pntSel' );  // Set Selected State
            this.selected.push( pnt );      // Add to Selected List
            e.stopPropagation();            // Stop Bubbling.
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( this.onSelect ) this.onSelect( pnt );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.view.on( 'pointermove', this.bindMove );
        this.view.on( 'pointerup', this.bindUp );
    }
    //#endregion

    //#region DRAGGING POINTS
    onPointerMove( e ){
        const x = e.layerX;
        const y = e.layerY;
        let i;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // On First Move, Compute Offsets
        if( this.offsets.length == 0 ){
            for( i of this.selected ){
                this.offsets.push([
                    Svg.getIntAttrib( i, 'cx' ) - x,
                    Svg.getIntAttrib( i, 'cy' ) - y,
                ]);
            }
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Compute new Positions for all selected points
        const sh = this.view.selectedShape;
        let o, cx, cy, idx;

        for( i=0; i < this.selected.length; i++ ){
            o   = this.selected[ i ];
            idx = o._idx;
            cx  = this.offsets[ i ][ 0 ] + x;
            cy  = this.offsets[ i ][ 1 ] + y;

            Svg.attrib( o, 'cx', cx ) - x;
            Svg.attrib( o, 'cy', cy ) - y;

            sh.updatePoint( idx, [cx,cy] );
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( this.onMove ) this.onMove( x, y );
        //sh.update();
    }

    onPointerUp( e ){
        this.view.off( 'pointermove', this.bindMove );
        this.view.off( 'pointerup', this.bindUp );
        this.offsets.length = 0;
    }
    //#endregion

    //#region MANAGE POINTS
    newPnt(){
        let p = this.pool.pop();

        if( !p ){
            p = Svg.circle( 0, 0, 5, '#ffffff' );
            p._idx = null;
            p.classList.add( 'pnt' );
            p.addEventListener( 'pointerdown', this.onPointSelect.bind( this ) );
            this.view.svg.add( p, 2 );
        }else{
            // Reset Exsiting Points
            p.classList.remove( 'pntSel' );
        }

        this.active.push( p );
        return p;
    }

    renderPoints( pnts ){
        let p, o;
        for( let i=0; i < pnts.length; i++ ){
            p = pnts[ i ];
            o = this.newPnt();
            o.style.display = '';

            if( p.idx == undefined ){               // Array< [0,0] >
                o._idx = i;
                Svg.attrib( o, 'cx', p[0] );
                Svg.attrib( o, 'cy', p[1] );
            }else{                                  // Array< { idx:number, pos:[0,0] } >
                o._idx = p.idx;
                Svg.attrib( o, 'cx', p.pos[0] );
                Svg.attrib( o, 'cy', p.pos[1] );
            }
        }
    }

    recyclePoints(){
        let pnt;
        this.deselectPoints();
        while( (pnt = this.active.pop()) ){
            pnt.style.display = 'none';
            this.pool.push( pnt );
        }
    }
    //#endregion

}

export default PointPool;