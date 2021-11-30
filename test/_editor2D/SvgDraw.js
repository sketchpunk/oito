//#region XX
import Svg from "./Svg.js";

//#endregion

class SvgDraw extends HTMLElement{
    constructor(){
        super();
        this.canvas = Svg.elm( 'svg' );
        this.canvas.style.transformOrigin  = "top left";
        this.appendChild( this.canvas );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.layers = [
            Svg.group( 'layer0' ),
            Svg.group( 'layer1' ),
            Svg.group( 'layer2' ),
        ];

        for( let i of this.layers ) this.canvas.appendChild( i );
    }

    //#region METHODS
    setSize( w, h ){
        this.style.width           = w + 'px';
        this.style.height          = h + 'px';
        this.canvas.style.width    = w + 'px';
        this.canvas.style.height   = h + 'px';
        return this;
    }

    add( elm, layerIdx=0 ){
        this.layers[ layerIdx ].appendChild( elm );
        //this.canvas.appendChild( elm );
        return this;
    }

    remove( elm ){
        elm.parentNode.removeChild( elm );
        return this;
    }
    //#endregion
}

window.customElements.define( "svg-draw", SvgDraw );
export default SvgDraw;