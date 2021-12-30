//#region IMPORTS
import type { Armature, Bone, Pose }    from '@oito/armature';
import { Quat, Vec3, Transform }        from '@oito/core';
//#endregion

class Link{
    //#region MAIN
    idx     : number;                       // Bone Index
    pidx    : number;                       // Bone Parent Index
    len     : number;                       // Bone Length
    bind    : Transform = new Transform();  // LocalSpace BindPose ( TPose ) Transform

    effectorDir = [0,1,0];                  // WorldSpace Target Alt Direction ( May be created from Inverted Worldspace Rotation of bone ) 
    poleDir     = [0,0,1];                  // WorldSpace Bend   Alt Direction ...

	constructor( idx: number, len: number ){
		this.idx    = idx;
        this.pidx   = -1;
		this.len    = len;
	}
    //#endregion

    //#region STATICS
    static fromBone( b: Bone ): Link{
        const l = new Link( b.idx, b.len );
        l.bind.copy( b.local );
        l.pidx = ( b.pidx != null )? b.pidx : -1;
        return l;
    }
    //#endregion
}


class IKChain{
    //#region MAIN
    links   : Link[]    = [];
    solver  : any       = null;
    count   : number    = 0;
    length  : number    = 0;

    constructor( bName?: string[], arm ?:Armature ){
        if( bName && arm ) this.setBones( bName, arm );
    }
    //#endregion

    //#region SETTERS
    setBones( bNames: string[], arm: Armature ): this{
        let b: Bone | null;
        let n: string;

        this.length = 0;    // Reset Chain Length

        for( n of bNames ){
            b = arm.getBone( n );
            if( b ){
                this.length += b.len;
                this.links.push( Link.fromBone( b ) );
            }else console.log( 'Chain.setBones - Bone Not Found:', n );
        }        

        this.count = this.links.length;
        return this;
    }

    setSolver( s: any ): this{ this.solver = s; return this; }

    // Change the Bind Transform
    // Mostly used for late binding a TPose when armature isn't naturally in a TPose
    bindToPose( pose: Pose ): this{
        let lnk : Link;
        for( lnk of this.links )
            lnk.bind.copy( pose.bones[ lnk.idx ].local );

        return this;
    }

    //#region METHIDS
    resetLengths( pose: Pose ): void{
        let lnk: Link;
        let len: number;

        this.length = 0;
        for( lnk of this.links ){
            len         = pose.bones[ lnk.idx ].len;    // Get Current Length in Pose
            lnk.len     = len;                          // Save it to Link
            this.length += len;                         // Accumulate the total chain length
        }
    }
    //#endregion

    //#endregion

    //#region GETTERS
    first() : Link{ return this.links[ 0 ]; }
    last()  : Link{ return this.links[ this.count-1 ]; }
    //#endregion

    resolveToPose( pose: Pose, debug ?: any ): this{
        if( !this.solver ){ console.warn( 'Chain.resolveToPose - Missing Solver' ); return this; }
        this.solver.resolve( this, pose, debug );
        return this;
    }

    getEndPositions( pose: Pose ): Array< number[] >{
        let rtn: Array< number[] > = [];

        if( this.count != 0 ) rtn.push( pose.bones[ this.links[ 0 ].idx ].world.pos.toArray() );

        if( this.count > 1 ){
            let lnk = this.last();
            let v = new Vec3( 0, lnk.len, 0 );
            pose.bones[ lnk.idx ].world.transformVec3( v );

            rtn.push( v.toArray() );
        }

        return rtn;
    }

    getPositionAt( pose: Pose, idx: number ): number[]{
        const b = pose.bones[ this.links[ idx ].idx ];
        return b.world.pos.toArray();
    }

    getAllPositions( pose: Pose ): Array< number[] >{
        const rtn : Array< number[] > = [];
        let   lnk : Link;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get head position of every bone
        for( lnk of this.links ){
            rtn.push( pose.bones[ lnk.idx ].world.pos.toArray() );
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get tail position of the last bone
        lnk     = this.links[ this.count-1 ];
        const v = new Vec3( 0, lnk.len, 0 );
        pose.bones[ lnk.idx ].world.transformVec3( v );

        rtn.push( v.toArray() );
        
        return rtn;
    }

    getStartPosition( pose: Pose ): number[]{
        const b = pose.bones[ this.links[ 0 ].idx ];
        return b.world.pos.toArray();
    }

    getMiddlePosition( pose: Pose ): number[]{
        if( this.count == 2 ){
            const b = pose.bones[ this.links[ 1 ].idx ];
            return b.world.pos.toArray();
        }
        console.warn( 'TODO: Implemenet IKChain.getMiddlePosition' );
        return [0,0,0];
    }

    getLastPosition( pose: Pose ): number[]{
        const b = pose.bones[ this.links[ this.count-1 ].idx ];
        return b.world.pos.toArray();
    }

    getTailPosition( pose: Pose, ignoreScale=false ): number[]{
        const b = pose.bones[ this.links[ this.count - 1 ].idx ];
        const v = new Vec3( 0, b.len, 0 );

        if( !ignoreScale ) return b.world.transformVec3( v ).toArray();

        return v
            .transformQuat( b.world.rot )
            .add( b.world.pos )
            .toArray();
    }

    getAltDirections( pose: Pose, idx = 0 ): Array< number[] >{
        const lnk = this.links[ idx ];          // Get Link & Bone
        const b   = pose.bones[ lnk.idx ];
        const eff = lnk.effectorDir.slice( 0 ); // Clone the Directions
        const pol = lnk.poleDir.slice( 0 );

        b.world.rot.transformVec3( eff );       // Transform Directions
        b.world.rot.transformVec3( pol );

        return [ eff, pol ];
    }

    bindAltDirections( pose: Pose, effectorDir: number[], poleDir: number[] ): this{
        let l: Link;
        let v   = new Vec3();
        let inv = new Quat();
        
        for( l of this.links ){
            inv.fromInvert( pose.bones[ l.idx ].world.rot );
            v.fromQuat( inv, effectorDir ).copyTo( l.effectorDir );
            v.fromQuat( inv, poleDir ).copyTo( l.poleDir );
        }

        return this;
    }
}

export { IKChain, Link };