import Base     from './Base.js';
import Svg      from '../Svg.js';
import Modes    from '../modes/index.js';

class Curve extends Base{
    modes       = Modes.POINTS | Modes.EDGES | Modes.CURVES;
    name        = 'Curve';
    element     = null;
    sampleCnt   = 10;

    _properties = {
        pos         : [0,0],
        points      : null,
        strokeColor   : '#ff0000',
    };

    constructor( points=null ){
        super();
        const p     = this._properties;
        const sh    = Svg.polyline( null, p.strokeColor, 5 );
        this.bindElement( sh );

        
        if( points ){
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
        for( let i=0; i < len-1; i++ ){
            ii = (i+1) //% len;
            rtn.push( [ i, ii ] );
        }

        return rtn;
    }

    getControlPoints(){
        const pnts  = this._properties.points;
        const len   = pnts.length;
        const rtn   = [];

        for( let i=0; i < len-1; i+=3 ){
            rtn.push( [ i+1, i ] );
            rtn.push( [ i+2, i+3 ] );
        }

        return rtn;
    }


    update(){
        const e     = this.element;
        const p     = this._properties;
        const pnts  = p.points;
    
        if( pnts.length > 1 ){           
            Svg.attrib( e, 'points', BezierCubic.svg( pnts, this.sampleCnt ) );
        }

        return this;
    }
}


class BezierCubic{
    static at( a, b, c, d, t, out ){
        const	i       = 1 - t,
                ii      = i * i,
                iii     = ii * i,
                tt      = t * t,
                ttt     = tt * t,
                iit3    = 3 * ii * t,
                itt3    = 3 * i * tt;
        
        out ??= [ 0, 0 ];
        out[ 0 ] = iii * a[0] + iit3 * b[0] + itt3 * c[0] + ttt * d[0];
        out[ 1 ] = iii * a[1] + iit3 * b[1] + itt3 * c[1] + ttt * d[1];
        //out[ 2 ] = iii * a[2] + iit3 * b[2] + itt3 * c[2] + ttt * d[2];
        return out;
    }

    static svg( pnts, sampleCnt ){
        let i, t, txt = '', out = [0,0];
        let a, b, c, d;

        for( let j=0; j < pnts.length-1; j+=3 ){  // Loop each Curve of the spline
            a = pnts[ j+0 ];
            b = pnts[ j+1 ];
            c = pnts[ j+2 ];
            d = pnts[ j+3 ];

            for( i=0; i <= sampleCnt; i++ ){    // Render Curve
                t = i / sampleCnt;
                BezierCubic.at( a, b, c, d, t, out );
                txt += `${out[0]},${out[1]} `;
            }
        }

        return txt;
    }
}


class Hermite{
    static at( a, b, c, d, t, tension, bias, out ){
        const t2    = t * t,
              t3    = t2 * t,
              a0    = 2*t3 - 3*t2 + 1,
              a1    = t3 - 2*t2 + t,
              a2    = t3 - t2,
              a3    = -2*t3 + 3*t2;

        const ten_bias_n = ( 1 - bias ) * ( 1 - tension ) * 0.5;
        const ten_bias_p = ( 1 + bias ) * ( 1 - tension ) * 0.5;

        out ??= [ 0, 0 ];
        out[ 0 ] = a0 * b[0] + a1 * ( (b[0]-a[0]) * ten_bias_p + (c[0]-b[0]) * ten_bias_n ) + a2 * ( (c[0]-b[0]) * ten_bias_p + (d[0]-c[0]) * ten_bias_n ) + a3 * c[0];
        out[ 1 ] = a0 * b[1] + a1 * ( (b[1]-a[1]) * ten_bias_p + (c[1]-b[1]) * ten_bias_n ) + a2 * ( (c[1]-b[1]) * ten_bias_p + (d[1]-c[1]) * ten_bias_n ) + a3 * c[1];
        return out;
    }
}

export default Curve;
export { Curve };