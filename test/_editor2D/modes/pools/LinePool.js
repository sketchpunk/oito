//#region IMPORTS
import Svg      from '../../Svg.js';
//#endregion

class LinePool{
    constructor( view ){        
        this.view       = view;

        this.useSelect  = true;

        this.segments   = null;
        this.pool       = [];
        this.active     = [];
        this.selected   = [];
        this.offsets    = [];

        this.onMove     = null;

        this.bindMove   = this.onPointerMove.bind( this );
        this.bindUp     = this.onPointerUp.bind( this );
    }

    reset(){
        this.useSelect  = true;
        this.segments   = null;
        this.onMove     = null;

        this.deselectLines();
        this.recycleLines();
    }

    //#region LINE SELECTION
    deselectLines(){
        for( let i of this.selected ) i.classList.remove( 'lineSel' );
        this.selected.length = 0;
    }

    onLineSelect( e ){
        if( !this.useSelect ) return;
        const o = e.target;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( this.selected.indexOf( o ) == -1 ){
            if( !e.shiftKey ) this.deselectLines();            // Not mult-select, deselect whats there
            
            o.classList.add( 'lineSel' );  // Set Selected State
            this.selected.push( o );       // Add to Selected List
            e.stopPropagation();           // Stop Bubbling.
        }

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
        if( this.offsets.length == 0 ){
            for( i of this.selected ){
                this.offsets.push([
                    Svg.getIntAttrib( i, 'x1' ) - x,
                    Svg.getIntAttrib( i, 'y1' ) - y,
                    Svg.getIntAttrib( i, 'x2' ) - x,
                    Svg.getIntAttrib( i, 'y2' ) - y,
                ]);
            }
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const sh = this.view.selectedShape;
        let o, edg, x1, y1, x2, y2, idx;
    
        for( i=0; i < this.selected.length; i++ ){
            o   = this.selected[ i ];
            idx = o._idx;
            edg = this.segments[ idx ];

            x1  = this.offsets[ i ][ 0 ] + x;
            y1  = this.offsets[ i ][ 1 ] + y;
            x2  = this.offsets[ i ][ 2 ] + x;
            y2  = this.offsets[ i ][ 3 ] + y;

            sh.updatePoint( edg[ 0 ], [x1,y1] );
            sh.updatePoint( edg[ 1 ], [x2,y2] );
        }  

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.refreshLines();
        if( this.onMove ) this.onMove( x, y );
    }

    onPointerUp( e ){
        this.view.off( 'pointermove', this.bindMove );
        this.view.off( 'pointerup', this.bindUp );
        this.offsets.length = 0;
    }

    onPointerDown( e ){
        if( e.button == 2 ){
            if( this.selected.length > 0 ) this.deselectLines();
            else                           this.view.deselectShape();
        }
    }
    //#endregion

    //#region MANAGE LINES
    newLine(){
        let o = this.pool.pop();

        if( !o ){
            o = Svg.line();
            o._idx = null;
            o.classList.add( 'line' );
            o.addEventListener( 'pointerdown', this.onLineSelect.bind( this ) );
            this.view.svg.add( o, 1 );
        }else{
            o.classList.remove( 'lineSel' );
        }

        this.active.push( o );
        return o;
    }

    renderLines(){
        if( !this.segments ){
            console.error( 'Can not render lines without segments assigned' );
            return;
        }

        const pnts      = this.view.selectedShape.getPoints();
        const isStruct  = ( pnts[ 0 ].idx != undefined );
        let e, o, a, b;

        for( let i=0; i < this.segments.length; i++ ){
            e = this.segments[ i ];
            o = this.newLine();
            o._idx          = i;
            o.style.display = '';

            if( !isStruct ){
                a = pnts[ e[ 0 ] ];
                b = pnts[ e[ 1 ] ];
            }else{
                a = pnts[ e[ 0 ] ].pos;
                b = pnts[ e[ 1 ] ].pos;
            }

            Svg.attrib( o, 'x1', a[0] );
            Svg.attrib( o, 'y1', a[1] );
            Svg.attrib( o, 'x2', b[0] );
            Svg.attrib( o, 'y2', b[1] );
        }
    }

    recycleLines(){
        let o;
        this.deselectLines();
        while( (o = this.active.pop()) ){
            o.style.display = 'none';
            this.pool.push( o );
        }
    }

    refreshLines(){
        const sh        = this.view.selectedShape;
        const pnts      = sh.getPoints();
        const isStruct  = ( pnts[ 0 ].idx != undefined );

        let e, o, i, a, b;

        for( i=0; i < this.segments.length; i++ ){
            e = this.segments[ i ];
            o = this.active[ i ];

            if( !isStruct ){
                a = pnts[ e[ 0 ] ];
                b = pnts[ e[ 1 ] ];
            }else{
                a = pnts[ e[ 0 ] ].pos;
                b = pnts[ e[ 1 ] ].pos;
            }

            Svg.attrib( o, 'x1', a[0] );
            Svg.attrib( o, 'y1', a[1] );
            Svg.attrib( o, 'x2', b[0] );
            Svg.attrib( o, 'y2', b[1] );
        }
    }
    //#endregion

}

export default LinePool;