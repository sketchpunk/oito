
class Base{
    id          = '';
    name        = '';
    modes       = 0;
    element     = null;
    _properties = {
        pos : [0,0],
    };

    //constructor(){}

    bindElement( elm ){
        this.element    = elm;
        elm._obj        = this;
    }

    getPos(){ return this._properties.pos; }
    setPos( v ){
        this._properties.pos[ 0 ] = v[ 0 ];
        this._properties.pos[ 1 ] = v[ 1 ];
        return this;
    }

    update(){ console.log( 'Shape.update not implemented'); return this; }
}

export default Base;