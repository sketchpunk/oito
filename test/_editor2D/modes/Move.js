
import Base from './Base.js';

class Move extends Base{

    constructor(){
        super();
        this.modeName   = 'Move';
        this.modeEvents = {
            'pointerdown'   : this.onPointerDown.bind( this ),
        };

        this.offset     = [0,0];
        this.dragObj    = null;

        this.bindMove   = this.onPointerMove.bind( this );
        this.bindUp     = this.onPointerUp.bind( this );
    }

    activate( view ){
        this.view = view;
        this.mountEvents();
    }

    deactivate( view ){
        this.unmountEvents();
        this.view = null;
    }


    onPointerDown( e ){
        const obj = e.target._obj || e.target.parentNode._obj;
        if( obj === this.view.selectedShape ){
            const p          = obj.getPos();
            this.offset[ 0 ] = e.layerX - p[ 0 ];
            this.offset[ 1 ] = e.layerY - p[ 1 ];

            this.dragObj = this.view.selectedShape;
            this.view.on( 'pointermove', this.bindMove );
            this.view.on( 'pointerup',   this.bindUp );
        }
    }

    onPointerMove( e ){
        const x = e.layerX - this.offset[ 0 ];
        const y = e.layerY - this.offset[ 1 ];
        this.dragObj.setPos( [x,y] ).update();
    }

    onPointerUp( e ){
        this.view.off( 'pointermove', this.bindMove );
        this.view.off( 'pointerup',   this.bindUp );
    }
}

export default Move;