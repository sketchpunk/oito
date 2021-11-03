/* eslint-disable @typescript-eslint/no-explicit-any */

import Vec3 from "../Vec3.js";

//#region SUPPORT OBJECTS
class SpatialCell{
    items : Array<SpatialItem> = [];

    push( itm:SpatialItem ):void{ this.items.push( itm ); }

    clear(): void{ this.items.length = 0; }
}

class SpatialItem{
    pos      : Array<number> = [ 0, 0, 0 ];
    userData : any           = null;
    queryId                  = 0;

    constructor( x: number, y: number, z: number, data:any = null ){
        this.setPos( x, y, z );
        this.userData = data;
    }

    setData( d: any ): this{ this.userData = d; return this; }
    setPos( x: number, y: number, z: number ): this{
        this.pos[ 0 ] = x;
        this.pos[ 1 ] = y;
        this.pos[ 2 ] = z;
        return this;
    }
}
//#endregion

class Spatial3DGrid{
    //#region MAIN
    cells : Array<SpatialCell | null> = [];

    minBound    = new Vec3();   // Min Position of Grid in World Space
    maxBound    = new Vec3();   // Max Position of Grid in World Space
    cellSize    = 1;            // Size of Each cell in grid
    dimension   = new Vec3();   // How many cells in each axis
    maxCoord    = new Vec3();   // Max Coordinate for the Grid
    xzCount     = 0;
    
    queryId     = 0;            // Help create a unqiue list of spatialItems.

    //constructor(){}
    //#endregion

    //#region PRIVATE METHODS
    /** Resize Cell buffer */
    _computeCells(): void{
        // Append to Cell if Needed
        const cellLen = this.dimension[0] * this.dimension[1] * this.dimension[2];
        for( let i = this.cells.length; i < cellLen; i++ ){
            this.cells.push( null );
        }
    }

    /** Convert Grid Coordinates to Cell Index */
    _gridIdx( coord: TVec3 ) : number{
        const c = new Vec3( coord ).clamp( [0,0,0], this.maxCoord );

        return  c[ 1 ] * this.xzCount +
                c[ 2 ] * this.dimension[ 0 ] + c[ 0 ];
    }

    /** Convert WorldSpace Position to Cell Index */
    _coordIdx( pos: TVec3 ): number{
        const coord = this._coordGrid( pos );
        return this._gridIdx( coord );
    }

    /** Convert WorldSpace Position to Grid Coordinates */
    _coordGrid( pos: TVec3 ): Array<number>{
        return new Vec3( pos )          // World Position
            .sub( this.minBound )       // Set it to Local Space in relation to Grid's Origin Point
            .divScale( this.cellSize )  // Divide by Cells
            .floor()                    // Floor to get Int Grid Coordinate
            .toArray()
    }

    /** Get Midpoint of a cell from Grid Coordinates */
    _cellMidPoint( coord: TVec3 ): Array<number>{
        return [
            coord[0] * this.cellSize + this.cellSize * 0.5,
            coord[1] * this.cellSize + this.cellSize * 0.5,
            coord[2] * this.cellSize + this.cellSize * 0.5,
        ];
    }

    _posInGrid( pos: TVec3 ): boolean{
        const min = this.minBound;
        const max = this.maxBound;
        return (
            pos[0] >= min[0] && 
            pos[0] <= max[0] &&

            pos[1] >= min[1] && 
            pos[1] <= max[1] &&

            pos[2] >= min[2] && 
            pos[2] <= max[2]
        );
    }
    //#endregion

    //#region SETTERS
    setCellSize( v: number ): this{
        this.cellSize = v;
        return this;
    }

    /** Compute a Min/Max Chunk Boundary that fits over another bounds by using cell size */
    fitBound( bMin:TVec3, bMax:TVec3 ): this{

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Figure out how many voxels can be made in bounding box
        const vsize = Vec3
            .sub( bMax, bMin )          // Get Length of Each Axis
            .divScale( this.cellSize )  // How Many Cells Fit per Axis
            .ceil()                     // OverShoot
            .copyTo( this.dimension )   // Save Cell Counts
            .scale( this.cellSize );    // Actual Volume Size

        this.xzCount = this.dimension[ 0 ] * this.dimension[ 2 ];
        this.maxCoord.fromSub( this.dimension, [1,1,1] );

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

        this._computeCells();
        return this;
    }

    //#endregion

    //#region MANAGE CELLS
    _addToCell( coord: TVec3, sItem: SpatialItem ): void{
        const idx = this._gridIdx( coord );
        let  cell = this.cells[ idx ];
        if( !cell ) this.cells[ idx ] = cell = new SpatialCell();
        cell.push( sItem );
    }

    getCell( coord: TVec3 ) : SpatialCell | null {
        const idx = this._gridIdx( coord );
        return this.cells[ idx ];
    }

    clear(): this{
        let i;
        for( i of this.cells ) if( i ) i.clear();

        this.queryId = 0;
        return this;
    }
    //#endregion

    //#region METHODS

    /** Add a Sphere to the Spacing Grid */
    addSphere( pos: TVec3, radius: number, data:any=null ): void{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Compute the bounding area of the Circle
        const r    = [ radius, radius, radius ];
        const min   = Vec3.sub( pos, r ).max( this.minBound ); // Min Sphere Bound
        const max   = Vec3.add( pos, r ).min( this.maxBound ); // Max Sphere Bound
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Min & Max Grid Cordinates that the Circle Fits in.
        const gMin = this._coordGrid( min );
        const gMax = this._coordGrid( max );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Add Item to all the cells its within range
        const sItem = new SpatialItem( pos[0], pos[1], pos[2], data );
        let gx: number, gy: number, gz: number;

        for( gy=gMin[1]; gy <= gMax[1]; gy++ ){
            for( gz=gMin[2]; gz <= gMax[2]; gz++ ){
                for( gx=gMin[0]; gx <= gMax[0]; gx++ ){
                    this._addToCell( [gx, gy, gz], sItem );
                }
            }
        }
    }

    /** Find all the cells near a World Space position */
    getNear( pos: TVec3, xRange=0, yRange=0, zRange=0 ): Array<SpatialItem> | null{
        // Check if the point even exists in the spatial grid, exit out early if its not.
        if( !this._posInGrid( pos ) ) return null;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const gCoord    = this._coordGrid( pos );
        const minX      = Math.max( gCoord[ 0 ] - xRange, 0 );
        const maxX      = Math.min( gCoord[ 0 ] + xRange, this.maxCoord[ 0 ] );

        const minY      = Math.max( gCoord[ 1 ] - yRange, 0 );
        const maxY      = Math.min( gCoord[ 1 ] + yRange, this.maxCoord[ 1 ] );

        const minZ      = Math.max( gCoord[ 2 ] - zRange, 0 );
        const maxZ      = Math.min( gCoord[ 2 ] + zRange, this.maxCoord[ 2 ] );

        /*
        // Use Mid Point to define range
        const midPnt = this._cellMidPoint( gCoord );
        let minX: number, maxX: number;
        if( pos[0] < midPnt[ 0 ] ){
            minX = Math.max( gCoord[ 0 ] - xRange, 0 );
            maxX = gCoord[ 0 ];
        }else{
            minX = gCoord[ 0 ];
            maxX = Math.min( gCoord[ 0 ] + xRange, this.dimension[ 0 ] );
        }

        let minY: number, maxY: number;
        if( pos[1] < midPnt[ 1 ] ){
            minY = Math.max( gCoord[ 1 ] - yRange, 0 );
            maxY = gCoord[ 1 ];
        }else{
            minY = gCoord[ 1 ];
            maxY = Math.min( gCoord[ 1 ] + yRange, this.dimension[ 1 ] );
        }

        let minZ: number, maxZ: number;
        if( pos[2] < midPnt[ 2 ] ){
            minZ = Math.max( gCoord[ 2 ] - zRange, 0 );
            maxZ = gCoord[ 2 ];
        }else{
            minZ = gCoord[ 2 ];
            maxZ = Math.min( gCoord[ 2 ] + zRange, this.dimension[ 2 ] );
        }
        */

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const qId = ++this.queryId;
        const rtn : Array<SpatialItem> = [];

        let gx   : number, 
            gy   : number,
            gz   : number,
            cell : SpatialCell | null,
            itm  : SpatialItem;

        for( gy=minY; gy <= maxY; gy++ ){
            for( gz=minZ; gz <= maxZ; gz++ ){
                for( gx=minX; gx <= maxX; gx++ ){
                    //----------------------------------
                    // Get Cell and Check if there are any items available
                    cell = this.getCell( [gx, gy, gz] );
                    if( !cell || cell.items.length == 0 ) continue;

                    //----------------------------------
                    // Collect a unique list of items
                    //console.log( "near", gx, gy, gz, cell );
                    for( itm of cell.items ){
                        if( itm.queryId != qId ){
                            itm.queryId = qId;  // Update ID so it won't be picked again.
                            rtn.push( itm );    // Save item for return list
                        }
                    }
                }
            }
        }

        return rtn;
    }
    //#endregion
}

export default Spatial3DGrid;