
import Base     from './Base.js';
import Svg      from '../Svg.js';
import Modes    from '../modes/index.js';

class Polygon extends Base{
    modes       = Modes.POINTS | Modes.EDGES;
    name        = 'Polygon';

    _properties = {
        pos         : [0,0],
        points      : null,
        fillColor   : '#ff0000',
    };

    constructor( points=null ){
        super();
        const p     = this._properties;
        const sh    = Svg.polygon( null, p.fillColor );
        this.bindElement( sh );

        if( points ){
            // find the centroid of the polygon, it will becomes the Shape's Position Value for Move Mode
            p.points = points.slice( 0 );
            let x = 0;
            let y = 0;

            for( let v of p.points ){
                x += v[ 0 ];
                y += v[ 1 ];
            }

            p.pos[ 0 ] = Math.floor( x / p.points.length );
            p.pos[ 1 ] = Math.floor( y / p.points.length );

            this.update()
        }
    }

    setPos( v ){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const p     = this._properties; 
        const ox    = v[ 0 ] - p.pos[ 0 ]; // Offset
        const oy    = v[ 1 ] - p.pos[ 1 ];
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Move Polygon points based from the delta of old + new pos
        for( let pnt of p.points ){
            pnt[ 0 ] += ox;
            pnt[ 1 ] += oy;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        super.setPos( v );
        return this;
    }

    updatePoint( idx, pos ){
        const pnt = this._properties.points[ idx ];
        if( pnt ){
            pnt[ 0 ] = pos[ 0 ];
            pnt[ 1 ] = pos[ 1 ];
        }
    }

    getPoints(){ return this._properties.points; }
    getEdges(){
        const pnts  = this._properties.points;
        const len   = pnts.length;
        const rtn   = [];

        let ii;
        for( let i=0; i < len; i++ ){
            ii = (i+1) % len;
            rtn.push( [ i, ii ] );
        }

        return rtn;
    }

    update(){
        const e     = this.element;
        const p     = this._properties;
        const pnts  = p.points;
    
        if( pnts.length > 2 ){
            let pp, txt = '';
            for( let i=0; i < pnts.length; i++ ){
                pp = pnts[ i ];
                txt += `${pp[0]},${pp[1]} `;
            }
            
            Svg.attrib( e, 'points', txt );
        }

        return this;
    }
}

export default Polygon;
export { Polygon };