//#region XX
const NS = "http://www.w3.org/2000/svg";
function Elm( name ){ return document.createElementNS( NS, name ); }
function Atr( elm, name, val ){ elm.setAttributeNS( null, name, val ); }
//#endregion


class Svg{
    static elm( name ){ return document.createElementNS( NS, name ); }

    static group( id=null ){
        const e = Elm( 'g' );
        if( id != null ) Atr( e, 'id', id );
        return e;
    }

    static attrib( elm, name, val ){ elm.setAttributeNS( null, name, val ); }
    static getIntAttrib( elm, name ){ return parseInt( elm.getAttributeNS( null, name ) ); }

    static circle( x, y, radius, fillColor=null, strokeColor=null, strokeWidth=0 ){
        let e = Elm( 'circle' );
        Atr( e, 'cx', x );
        Atr( e, 'cy', y );
        Atr( e, 'r', radius );
        if( fillColor )     Atr( e, 'fill',         fillColor );
        if( strokeColor )   Atr( e, 'stroke',       strokeColor );
        if( strokeWidth )   Atr( e, 'stroke-width', strokeWidth );
        return e;
    }

    static ellipse( x, y, xRadius, yRadius, fillColor=null, strokeColor=null, strokeWidth=0 ){
        let e = Elm( 'ellipse' );
        Atr( e, 'cx', x );
        Atr( e, 'cy', y );
        Atr( e, 'rx', xRadius );
        Atr( e, 'ry', yRadius );
        if( fillColor )     Atr( e, 'fill',         fillColor );
        if( strokeColor )   Atr( e, 'stroke',       strokeColor );
        if( strokeWidth )   Atr( e, 'stroke-width', strokeWidth );
        return e;
    }

    static rect( x, y, w, h, fillColor=null, strokeColor=null, strokeWidth=0 ){
        let e = Elm( 'rect' );
        Atr( e, 'x', x );
        Atr( e, 'y', y );
        Atr( e, 'width', w );
        Atr( e, 'height', h );
        if( fillColor )     Atr( e, 'fill',         fillColor );
        if( strokeColor )   Atr( e, 'stroke',       strokeColor );
        if( strokeWidth )   Atr( e, 'stroke-width', strokeWidth );
        return e;
    }

    static roundRect( x, y, w, h, r, fillColor=null, strokeColor=null, strokeWidth=0 ){
        let e = Elm( 'rect' );
        Atr( e, 'x', x );
        Atr( e, 'y', y );
        Atr( e, 'width', w );
        Atr( e, 'height', h );
        Atr( e, 'rx', r );
        Atr( e, 'ry', r );
        if( fillColor )     Atr( e, 'fill',         fillColor );
        if( strokeColor )   Atr( e, 'stroke',       strokeColor );
        if( strokeWidth )   Atr( e, 'stroke-width', strokeWidth );
        return e;
    }

    static line( x1=null, y1=null, x2=null, y2=null, strokeColor=null, strokeWidth=0 ){
        let e = Elm( 'line' );
        if( x1 ) Atr( e, 'x1', x1 );
        if( y1 ) Atr( e, 'y1', y1 );
        if( x2 ) Atr( e, 'x2', x2 );
        if( y2 ) Atr( e, 'y2', y2 );
        if( strokeColor )   Atr( e, 'stroke',       strokeColor );
        if( strokeWidth )   Atr( e, 'stroke-width', strokeWidth );
        return e;
    }

    /** points='0,0 100,100, 100,50' */
    static polygon( svgPnts=null, fillColor=null, strokeColor=null, strokeWidth=0 ){
        let e = Elm( 'polygon' );
        if( svgPnts )       Atr( e, 'points',       svgPnts );
        if( fillColor )     Atr( e, 'fill',         fillColor );
        if( strokeColor )   Atr( e, 'stroke',       strokeColor );
        if( strokeWidth )   Atr( e, 'stroke-width', strokeWidth );
        return e;
    }

    static text( str, x, y ){
        let e = Elm( 'text' );
        //e.innerHTML = str;
        //e.textContent = str;

        //e.innerHTML = '&amp;#xf040';
        e.textContent = '\uf042';

        Atr( e, 'x', x );
        Atr( e, 'y', y );
        Atr( e, 'font-family', 'Font Awesome 5 Free' );
        return e;
    }

    
    /*points='0,0 100,100, 100,50'*/
    static polyline( svgPnts=null, strokeColor=null, strokeWidth=0 ){
        let e = Elm( 'polyline' );
        if( svgPnts )       Atr( e, 'points',       svgPnts );
        if( strokeColor )   Atr( e, 'stroke',       strokeColor );
        if( strokeWidth )   Atr( e, 'stroke-width', strokeWidth );
        if( strokeWidth )   Atr( e, 'fill',         'none' );
        return e;
    }
    
}

export default Svg;