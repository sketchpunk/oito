//#region IMPORTS
import Base     from './Base.js';
import Svg      from '../Svg.js';
import Modes    from '../modes/index.js';
import Topology from '../../../dist/geometry/halfedge/Topology.js';
import Identify from '../../../dist/misc/Identify.js';
//#endregion

class HEMesh extends Base{
    modes       = Modes.POINTS | Modes.EDGES;
    name        = Identify.nanoId();
    topology    = new Topology();
    polygons    = [];
    _properties = {
        pos         : [0,0],
    };

    constructor(  ){
        super();
        this.bindElement( Svg.group( Identify.nanoId() ) );
    }

    getPos(){
        const top   = this.topology;
        const pos   = this._properties.pos;
        let v;
        let cnt     = 0;
        let x       = 0;
        let y       = 0;

        for( v of top.vertices.iter() ){
            x += v.pos[ 0 ];
            y += v.pos[ 1 ];
            cnt++;
        }

        pos[ 0 ] = Math.floor( x / cnt );
        pos[ 1 ] = Math.floor( y / cnt );
        return pos;
    }

    setPos( v ){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const p     = this._properties; 
        const ox    = v[ 0 ] - p.pos[ 0 ]; // Offset
        const oy    = v[ 1 ] - p.pos[ 1 ];
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Move Polygon points based from the delta of old + new pos
        let ve;
        for( ve of this.topology.vertices.iter() ){
            ve.pos[ 0 ] += ox;
            ve.pos[ 1 ] += oy;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        super.setPos( v );
        return this;
    }

    getPoints(){
        const top   = this.topology;
        const pnts  = [];
        let v;

        for( v of top.vertices.iter() ){
            pnts.push({
                idx : v.index,
                pos : [ v.pos[0], v.pos[1] ],
            });
        }

        return pnts;
    }

    getEdges(){
        const top   = this.topology;
        const rtn   = [];

        let edg;
        for( edg of top.edges.iter() ){
            rtn.push([ edg.v0.index, edg.v1.index ]);
        }

        return rtn;
    }

    updatePoint( idx, pos ){
        const v = this.topology.vertices.items[ idx ];
        v.pos[ 0 ] = pos[ 0 ];
        v.pos[ 1 ] = pos[ 1 ];
    }

    createPolygons(){
        const cnt = this.topology.faceCount;
        const len = this.polygons.length;
        let poly;

        for( let i=len; i <= cnt; i++ ){
            poly = Svg.polygon( null, '#ff0000' );
            this.polygons.push( poly );
            this.element.appendChild( poly );
        }

        return this;
    }

    updatePolygons(){
        const top   = this.topology;
        let cnt     = top.faceCount;
        let pnts, verts, v;
        
        for( let i=0; i < cnt; i++ ){
            verts = top.faces.getVertices( i );
            pnts  = '';

            for( v of verts ) pnts += `${v.pos[0]},${v.pos[1]} `;
            Svg.attrib( this.polygons[ i ], 'points', pnts );
        }
    }

    update(){  
        this.createPolygons();
        this.updatePolygons();
        return this;
    }
}

export default HEMesh;
export { HEMesh };