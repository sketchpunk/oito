import type IConstraint     from './constraints/IConstraint';
import type { TVec3 } from '@oito/type';

import type { IVerletPointConfig } from './types';

import VerletPoint          from './VerletPoint';
import VerletGroup          from './VerletGroup';
import DistanceConstraint   from './constraints/DistanceConstrant';



class VerletSkeleton{
    //#region MAIN
    _nameMap    : Map< string, number >         = new Map();    // Map Names to Point Index
    points      : Array< VerletPoint >          = [];           // Skeleton is made of Points Linked by Constraints
    constraints : Array< IConstraint >          = [];           // Constraints Applied to Points
    groups      : Map< string, VerletGroup >    = new Map();    // Collection of groups, Used mainly to know how to render the connections.
    iterations  = 5;                                            // How many times to execute constraints to be fully resolved.
    constructor(){}
    //#endregion

    _getIndex( pnt: string | number ): number{
        if( typeof pnt == 'number' ) return pnt;
        else if( typeof pnt == 'string' ){
            const i = this._nameMap.get( pnt );
            if( i != undefined ) return i;
        }
        return -1;
    }

    //#region POINTS
    addPoint( name: string, config ?: IVerletPointConfig ){ 
        const idx = this.points.length;
        this.points.push( new VerletPoint( name, config ) ); 
        this._nameMap.set( name, idx );
        return this;
    }

    getPoint( pnt: string | number ): VerletPoint | undefined{
        let idx = this._getIndex( pnt );
        if( idx == -1 ) return undefined;
        return ( idx !== -1 )? this.points[ idx ] : undefined;
    }
    
    setPos( pnt: string | number, pos: TVec3 ){
        let idx = this._getIndex( pnt );
        if( idx == -1 ) return this;

        const p = this.points[ idx ];
        if( p ){
            p.pos[ 0 ] = pos[ 0 ];
            p.pos[ 1 ] = pos[ 1 ];
            p.pos[ 2 ] = pos[ 2 ];
        }
        return this;
    }

    setDraggable( pnt: string, s: boolean ): this{
        let idx = this._getIndex( pnt );
        if( idx == -1 ) return this;

        this.points[ idx ].draggable = s;
        return this;
    }

    setVisible( pnt: string, s: boolean ): this{
        let idx = this._getIndex( pnt );
        if( idx == -1 ) return this;

        this.points[ idx ].visible = s;
        return this;
    }

    iterPoints(): IterableIterator<VerletPoint>{ return this.points.values(); }
    //#endregion ////////////////////////////////////////////////////


    //#region GROUPS
    rangedSegmentGroup( grpName: string, aName:string, bName: string ): this{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~        
        const a   = this.getPoint( aName ); //this.points.get( aName );
        const b   = this.getPoint( bName );

        if( !a ){ console.error( 'rangedSegmentGroup : Point Name not Found', aName ); return this; }
        if( !b ){ console.error( 'rangedSegmentGroup : Point Name not Found', bName ); return this; }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const pnts : Array< VerletPoint > = [ a, b ];
        this.constraints.push( new DistanceConstraint( a, b ).ranged() );
        this.groups.set( grpName, new VerletGroup( grpName, "segment", pnts ) );

        return this;
    }

    segmentGroup( grpName: string, aName:string, bName: string ): this{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~        
        const a   = this.getPoint( aName );
        const b   = this.getPoint( bName );

        if( !a ){ console.error( 'segmentGroup : Point Name not Found', aName ); return this; }
        if( !b ){ console.error( 'segmentGroup : Point Name not Found', bName ); return this; }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const pnts : Array< VerletPoint > = [ a, b ];
        this.constraints.push( new DistanceConstraint( a, b ) );
        this.groups.set( grpName, new VerletGroup( grpName, "segment", pnts ) );

        return this;
    }

    chainGroup( grpName: string, pntNames: string[] ): this{
        const pnts : Array< VerletPoint > = new Array();
        const len  = pntNames.length - 1;
        let a   : VerletPoint | undefined;
        let b   : VerletPoint | undefined;
        let i   : number;
        let ii  : number;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for( i=0; i < len; i++ ){
            ii = i + 1;

            //-------------------------------------------
            a  = this.getPoint( pntNames[ i ] );
            if( !a ){ console.error( 'chainGroup : Point Name not Found', pntNames[ i ] ); return this; }

            //-------------------------------------------
            b  = this.getPoint( pntNames[ ii ] );
            if( !b ){ console.error( 'chainGroup : Point Name not Found', pntNames[ ii ] ); return this; }
            
            //-------------------------------------------
            pnts.push( a );
            this.constraints.push( new DistanceConstraint( a, b ) );
        }

        // Add Final Point of the chain.
        a = this.getPoint( pntNames[ len ] );
        if( a ) pnts.push( a ); 

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.groups.set( grpName, new VerletGroup( grpName, "chain", pnts ) );

        return this;
    }

    triGroup( grpName: string, pntNames: string[] ): this{
        const pnts : Array< VerletPoint > = new Array();
        const len  = pntNames.length;
        let a   : VerletPoint | undefined;
        let b   : VerletPoint | undefined;
        let i   : number;
        let ii  : number;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for( i=0; i < len; i++ ){
            ii = ( i + 1 ) % len;
            
            //-------------------------------------------
            a  = this.getPoint( pntNames[ i ] );
            if( !a ){ console.error( 'TriGroup : Point Name not Found', pntNames[ i ] ); return this; }

            //-------------------------------------------
            b  = this.getPoint( pntNames[ ii ] );
            if( !b ){ console.error( 'TriGroup : Point Name not Found', pntNames[ ii ] ); return this; }
            
            //-------------------------------------------
            pnts.push( a );
            this.constraints.push( new DistanceConstraint( a, b ) );
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.groups.set( grpName, new VerletGroup( grpName, "tri", pnts ) );
        return this;
    }

    axisGroup( pntMain: string, pntUp: string, pntEff: string, pntPol: string ): this{
        this.segmentGroup( pntMain + '__MU', pntMain, pntUp );
        this.segmentGroup( pntMain + '__ME', pntMain, pntEff );
        this.segmentGroup( pntMain + '__MP', pntMain, pntPol );
        this.segmentGroup( pntMain + '__UE', pntUp, pntEff );
        this.segmentGroup( pntMain + '__UP', pntUp, pntPol );
        this.segmentGroup( pntMain + '__EP', pntEff, pntPol );
        return this;
    }
    //#endregion

    //#region CONSTRAINTS

    /** Have constraints reset its values based */
    rebindConstraints(){
        let c: IConstraint;
        for( c of this.constraints ) c.rebind();
    }

    resolve(){
        let i   : number;
        let c   : IConstraint; 
        let chg : boolean;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for( i=0; i < this.iterations; i++ ){
            chg = false;
            
            for( c of this.constraints ){
                if( c.resolve() ) chg = true;
            }

            if( !chg ) break;  // Nothing has changed, Exit early.
        }
    }
    //#endregion ////////////////////////////////////////////////////

}

export default VerletSkeleton;