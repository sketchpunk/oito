import Vec3 from '../Vec3.js';

interface IterCellAllInfo{
    min   : Vec3,
    max   : Vec3,
    coord : Vec3,
    isOn  : boolean,
}

interface IterCellInfo{
    min   : Vec3,
    max   : Vec3,
    coord : Vec3,
}

class VoxelChunk{

    //#region MAIN
    _cellState : Uint8Array | null  = null;         // On/Off set of each Cell
    _cellData  : Array<any> | null  = null;         // User Data for each cell
    cellSize                        = 0;            // Size of
    xzCount                         = 0;            // x cell cnt * z cell cnt
    dimension                       = new Vec3();   // How Many Cells available at each axis.
    minBound                        = new Vec3();   // Min Position
    maxBound                        = new Vec3();   // Max Position
    
    constructor( cellSize ?: number ){
        if( cellSize != undefined ) this.cellSize = cellSize;
    }
    //#endregion ////////////////////////////////////////////////////////////

    //#region SETUP

    setCellSize( n:number ): this{ this.cellSize = n; return this; }

    /** Compute a Min/Max Chunk Boundary that fits over another bounds by using cell size */
    fitBound( bMin:TVec3, bMax:TVec3 ): this{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Figure out how many voxels can be made in mesh bounding box
        const vsize = Vec3
            .sub( bMax, bMin )          // Get Length of Each Axis
            .divScale( this.cellSize ) // How Many Cells Fit per Axis
            .ceil()                     // OverShoot
            .copyTo( this.dimension )   // Save Cell Counts
            .scale( this.cellSize );   // Actual Volume Size

        this.xzCount = this.dimension[0] * this.dimension[2];

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Set the starting volume
        this.minBound.xyz( 0, 0, 0 );
        this.maxBound.copy( vsize );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Move Volume's Mid Point to the Mesh's Mid Point
        const aMid  = Vec3.lerp( bMin, bMax, 0.5 );
        const bMid  = Vec3.lerp( this.minBound, this.maxBound, 0.5 );
        const delta = Vec3.sub( bMid, aMid );

        this.minBound.sub( delta );
        this.maxBound.sub( delta );

        this._buildStateArray();
        return this;
    }

    _buildStateArray(): void{
        this._cellState = new Uint8Array( this.dimension.x * this.dimension.z * this.dimension.y );
    }
    
    //#endregion ////////////////////////////////////////////////////////////

    //#region SETTERS / GETTERS
    getStateArrayRef(){ return this._cellState; }

    setState( x:number, y:number, z:number, isOn: boolean ): this{
        if( this._cellState ){
            const idx = this.coordIdx( x, y, z );
            this._cellState[ idx ] = ( isOn )? 1 : 0;
        }
        return this;
    }

    resetState(): this{
        if( this._cellState ){
            let i;
            for( i=0; i < this._cellState.length; i++ ) this._cellState[ i ] = 0;
        }
        return this;
    }
    //#endregion

    //#region COORDINATE MATH

    /** Using Voxel Coordinates, Gets the Cell Array Index */
    coordIdx( x:number, y:number, z:number ): number{
        // ( xLen * zLen * y ) + ( xLen * z ) + x
        return this.xzCount * y + this.dimension[ 0 ] * z + x;
    }

    /** Using Cell Array Index, Compute Voxel Coordinate */
    idxCoord( i: number, out ?: TVec3 ): TVec3{
        const y     = Math.floor( i / this.xzCount );      // How Many Y Levels Can We Get?
        const xz    = i - y * this.xzCount;                // Subtract Y Levels from total, To get remaining Layer
        const z     = Math.floor( xz / this.dimension[0] ); // How many rows in the last layer can we get?

        out    = out || [0,0,0];
        out[0] = xz - z * this.dimension[0];
        out[1] = y;
        out[2] = z;
        return out;
    }

    /** Convert Worldspace Position to Voxel Coordinates */
    posCoord( pos: TVec3, out ?: Vec3 ): Vec3 {
        out = out || new Vec3();

        out .fromSub( pos, this.minBound )  // Localize Postion in relation to Chunk's Starting position
            .divScale( this.cellSize )     // Divide  the Local Position by Voxel's Size.
            .floor();                       // Floor it to get final coordinate value.

        return out;
    }

    /** Get the cell min/max boundary from voxel coordinates */
    coordBound( coord: TVec3, minOut: Vec3, maxOut: Vec3 ): void{
        minOut .fromScale( coord, this.cellSize )
            .add( this.minBound );
        
        maxOut .fromAdd( coord, [1,1,1] )
            .scale( this.cellSize )
            .add( this.minBound );
    }

    /** Get the cell min boundary from voxel coordinates */
    coordMinBound( coord: TVec3, minOut: Vec3 ): void{
        minOut .fromScale( coord, this.cellSize )
            .add( this.minBound );
    }

    //#endregion ////////////////////////////////////////////////////////////

    //#region ITER
    /** Loop over all the cells */
    iterAllCells(): Iterable< IterCellAllInfo > | null{
        if( this._cellState == null ) return null;

        let   i      = 0;
        const sCell  = this._cellState;
        const len    = sCell.length;

        const val : IterCellAllInfo = {
            min   : new Vec3(),
            max   : new Vec3(),
            coord : new Vec3(),
            isOn  : false,
        };

        const result = { done: false, value: val };
        const next   = ()=>{
            if( i >= len ) result.done = true;
            else{
                val.isOn = ( sCell[ i ] != 0 );             // Is Cell Active

                this.idxCoord( i++, val.coord );            // Compute Voxel Coordinate

                val.min                                     // Compute Min Bounds for Cell
                    .fromScale( val.coord, this.cellSize ) 
                    .add( this.minBound );

                val.max                                     // Compute Max Bounds for Cell
                    .fromAdd( val.coord, [1,1,1] )
                    .scale( this.cellSize )
                    .add( this.minBound );
            }
            return result;
        };

        return { [Symbol.iterator]() { return { next }; } };
    }

    /** Loop over only cells that are active */
    iterActiveCells(): Iterable< IterCellInfo > | null{
        if( this._cellState == null ) return null;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get a list of cell indices that are currently active
        let ii:number;
        const indices : Array<number> = [];
        const sCell   = this._cellState;
        for( ii=0; ii < sCell.length; ii++ ){
            if( sCell[ ii ] == 1 ) indices.push( ii );
        }
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let i     = 0;
        const len = indices.length;
        const val : IterCellInfo = {
            min   : new Vec3(),
            max   : new Vec3(),
            coord : new Vec3(),
        };

        const result = { done: false, value: val };

        const next   = ()=>{
            if( i >= len ) result.done = true;
            else{
                ii = indices[ i ];                          // Get Cell Index
                this.idxCoord( ii, val.coord );             // Compute Voxel Coordinate

                val.min                                     // Compute Min Bounds for Cell
                    .fromScale( val.coord, this.cellSize ) 
                    .add( this.minBound );

                val.max                                     // Compute Max Bounds for Cell
                    .fromAdd( val.coord, [1,1,1] )
                    .scale( this.cellSize )
                    .add( this.minBound );
                
                i++;
            }
            return result;
        };

        return { [Symbol.iterator]() { return { next }; } };
    }
    //#endregion ////////////////////////////////////////////////////////////
}

export default VoxelChunk;