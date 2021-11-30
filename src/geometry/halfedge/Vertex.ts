//#region IMPORTS
import Vec3             from "../../Vec3.js";
import type Edge        from "./Edge.js";
import type HalfEdge    from "./HalfEdge.js";
import type Topology    from "./Topology.js";
//#endregion

interface IterNext {
    value: Vertex | null,
    done : boolean,
}

class Vertex{
    index       = -1;
    halfedge    = -1;
    pos         = new Vec3();

    constructor( pos: TVec3, idx: number ){
        this.index = idx;
        this.pos.copy( pos );
    }

    reset(): this{
        this.halfedge = -1;
        this.pos.xyz( 0,0,0 );
        return this;
    }

    getHalfEdge( top:Topology ): HalfEdge{ return top.edges.hedges[ this.halfedge ]; }

    getAllEdges( top:Topology ): Array<Edge>{
        const he    = this.getHalfEdge( top );             // Get Starting Half Edge
        const rtn   : Array<Edge> = [ he.getEdge( top ) ]; // List of Edges
        let lmt = 0;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Rotate CW
        let loop = he.getTwinNext( top );
        while( loop && loop.index != he.index && ++lmt < 1000 ){
            rtn.push( loop.getEdge( top ) );
            loop = loop.getTwinNext( top );
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // There is a disconnect when point isn't the center of a face fan.
        // So need to loop in reverse too to get all the edges.
        if( !loop || loop.index != he.index ){ console.log( 'use_rev' );
            loop = he.getPrevTwin( top );
            lmt  = 0;
            
            // Rotate CCW
            while( loop && loop.index != he.index && ++lmt < 1000 ){
                rtn.push( loop.getEdge( top ) );
                loop = loop.getPrevTwin( top );
            }
        }

        return rtn;
    }

    static key( pos: TVec3, place=1 ): string{
        // pos      = [ 1.0001, 0.987654321, 3.123456789 ]
        // place    = 6
        // output   = 1.00010_0.98765_3.12346

        const x = pos[ 0 ].toFixed( place );
        const y = pos[ 1 ].toFixed( place );
        const z = pos[ 2 ].toFixed( place );
        return x + '_' + y + '_' + z;
    }
}

class VertexCollection{
    uniqueVertLevel             = 5;
    top   : Topology;
    items : Array<Vertex>       = [];
    map   : Map<string, number> = new Map();

    constructor( top:Topology ){
        this.top = top;
    }

    add( pos: TVec3, overrideUnique=false ): number{
        let idx;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Unique Vertices is enabled
        if( this.uniqueVertLevel && !overrideUnique ){
            const key = Vertex.key( pos, this.uniqueVertLevel );
            idx       = this.map.get( key );

            if( idx != undefined ) return idx;
            else{
                idx = this._new( pos );
                this.map.set( key, idx );
                return idx;
            }
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Just create a new vert.
        return this._new( pos );
    }

    _new( pos: TVec3 ): number{
        const idx   = this.items.length;
        const vert  = new Vertex( pos, idx );
        this.items.push( vert );
        return idx;
    }

    remove( idx: number ): void{
        // delete vert
        // delete face attached, which should also delete edges
        console.log( 'not implemented' );

        /*
        auto &vert = m_verts[v];
 
        // remove faces this vert connects to
        const int startEdge = vert.edge;
        if (startEdge >= 0)
        {
            int e = startEdge;
            do
            {
            auto &edge = m_edges[e];
            RemoveFace(edge.face);
            e = m_edges[edge.prev].twin;
            } while (e != startEdge);
        }
        
        // dispose vert
        if (vert.edge >= 0)
            vert.edge = -1;
        
        // update free list
        Free<Vert>(v, m_freeVerts, m_verts);
        
  --m_numVerts;
        */
    }

    iter() : { [Symbol.iterator]() : { next:()=>IterNext } } {
        let   i       = 0;
        const result : IterNext = { value:null, done:false };
        const len               = this.items.length;
        const next              = ()=>{
            if( i >= len ) result.done = true;
            else{
                result.value = this.items[ i ];
                i++;
            }
            return result;
        };

        return { [Symbol.iterator](){ return { next }; } };
    }
}

export default Vertex;
export { Vertex, VertexCollection };