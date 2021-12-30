import type { TVec3 } from '@oito/type';
import { IVerletPointConfig } from '../types';

class VerletPoint{
    idx         = -1;
    pos         = [0,0,0];
    mass        = 1;
    
    isPinned    = false;
    isPole      = false;
    draggable   = true;
    visible     = true;

    constructor( config ?: IVerletPointConfig ){        
        if( config ){ 
            if( config.draggable !== undefined )    this.draggable  = config.draggable;
            if( config.visible !== undefined )      this.visible    = config.visible;
            if( config.mass !== undefined )         this.mass       = config.mass;
            if( config.pole !== undefined )         this.isPole     = config.pole;

            if( config.pos ){
                this.pos[ 0 ]   = config.pos[ 0 ];
                this.pos[ 1 ]   = config.pos[ 1 ];
                this.pos[ 2 ]   = config.pos[ 2 ];
            }
        }
    }

    setPos( p: TVec3 ): this{
        this.pos[ 0 ] = p[ 0 ];
        this.pos[ 1 ] = p[ 1 ];
        this.pos[ 2 ] = p[ 2 ];
        return this;
    }
}

export default VerletPoint;