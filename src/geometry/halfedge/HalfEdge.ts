//#region IMPORTS
import type Topology    from './Topology';
import type Vertex      from './Vertex';
import type Edge        from './Edge';
import type Face        from './Face';
//#endregion

class HalfEdge{
    index   = -1;   // Index in the Array

    prev    = -1;   // Previous Half
    next    = -1;   // Next
    twin    = -1;   // Its Reverse Side

    edge    = -1;   // Edge it belongs too
    vertex  = -1;   // Vertex that starts the half edge
    face    = -1;   // Face Half Edge Belongs too.

    constructor( idx?: number, twinIdx?: number ){
        if( idx != undefined )      this.index  = idx;
        if( twinIdx != undefined )  this.twin   = twinIdx;
    }

    //#region GETTER OPERATIONS
    
    /** Get Next HalfEdge Object */
    getNext( top: Topology ): HalfEdge{ return top.edges.hedges[ this.next ]; }

    /** Get Prev HalfEdge Object */
    getPrev( top: Topology ): HalfEdge{ return top.edges.hedges[ this.prev ]; }
    
    /** Get the Next HE's Twin Object */
    getNextTwin( top: Topology ): HalfEdge | null{
        if( this.next == -1 ) return null;
        const he = top.edges.hedges[ this.next ];
        return top.edges.hedges[ he.twin ];
    }

    /** Get the Twin's Next HE Object */
    getTwinNext( top: Topology ): HalfEdge | null{
        const he = top.edges.hedges[ this.twin ];
        return ( he.next != -1 )? top.edges.hedges[ he.next ] : null;
    }

    /** Get the Previous HE's Twin */
    getPrevTwin( top: Topology ): HalfEdge | null{
        if( this.prev == -1 ) return null;
        const he = top.edges.hedges[ this.prev ];
        return top.edges.hedges[ he.twin ];
    }
    //#endregion

    //#region GETTERS
    getTwin( top: Topology ): HalfEdge{ return top.edges.hedges[ this.twin ]; }
    getVertex( top: Topology ): Vertex{ return top.vertices.items[ this.vertex ]; }
    getEdge( top: Topology ): Edge{ return top.edges.edges[ this.edge ]; }
    getFace( top: Topology ): Face{ return top.faces.items[ this.face ]; }
    //#endregion

    //#region STATIC METHODS
    static makePair( ai: number, bi: number, ei: number, v0: number, v1:number ) : Array<HalfEdge> {
        const a     = new HalfEdge( ai, bi );
        a.edge      = ei;
        a.vertex    = v0;
        //a.next      = bi;   // Assign Twin as its Next/Prev
        //a.prev      = bi;

        const b     = new HalfEdge( bi, ai );
        b.edge      = ei;
        b.vertex    = v1;
        //b.next      = ai;   // Assign Twin as its Next/Prev
        //b.prev      = ai;
        
        return [ a, b ];
    }
    //#endregion
}

export default HalfEdge;