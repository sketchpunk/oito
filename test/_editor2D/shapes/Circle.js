
import Base from './Base.js';
import Svg  from '../Svg.js';


class Circle extends Base{
    name        = 'Circle';
    _properties = {
        pos         : [0,0],
        radius      : 10,
        fillColor   : '#ff0000',
        strokeWidth : 0,
        strokeColor : null,
    };

    constructor( pos=null, radius=null ){
        super();
        const p         = this._properties;
        p.radius        = radius || 10;
        p.fillColor     = '#ff0000';
        p.strokeWidth   = 0;
        p.strokeColor   = null;

        if( pos )            this.setPos( pos );
        if( radius != null ) this.setRadius( radius);

        const c = Svg.circle( p.pos[0], p.pos[1], p.radius, p.fillColor, p.strokeColor, p.strokeWidth );
        this.bindElement( c );
    }

    setRadius( v ){ this._properties.radius = v; return this; }

    update(){
        const e = this.element;
        const p = this._properties;
        Svg.attrib( e, 'cx', p.pos[ 0 ] );
        Svg.attrib( e, 'cy', p.pos[ 1 ] );
        return this;
    }
}

export default Circle;
export { Circle };