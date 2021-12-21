import type { TVec3 } from '@oito/type';
import { IVerletPointConfig } from './types';

class VerletPoint{
    name        : string;
    pos         = [0,0,0];
    mass        = 1;
    isPinned    = false;
    draggable   = true;
    visible     = true;

    constructor( name : string, config ?: IVerletPointConfig ){
        this.name = name;
        
        if( config ){ 
            if( config.draggable !== undefined )    this.draggable  = config.draggable;
            if( config.visible !== undefined )      this.visible    = config.visible;
            if( config.mass !== undefined )         this.mass       = config.mass;

            if( config.pos ){
                this.pos[ 0 ]   = config.pos[ 0 ];
                this.pos[ 1 ]   = config.pos[ 1 ];
                this.pos[ 2 ]   = config.pos[ 2 ];
            }
        }
    }
}

export default VerletPoint;