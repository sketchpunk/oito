import Vec3 from '../Vec3.js';
const NEIGHBOR_OFFSETS = [
    [0, 0, 1], [0, 0, -1],
    [0, 1, 0], [0, -1, 0],
    [1, 0, 0], [-1, 0, 0],
];
class VoxelChunk {
    //#region MAIN
    _cellState; // On/Off set of each Cell
    _cellData = null; // User Data for each cell
    cellSize = 0; // Size of
    xzCount = 0; // x cell cnt * z cell cnt
    dimension = new Vec3(); // How Many Cells available at each axis.
    maxCoord = new Vec3(); // Maximum Coord
    minBound = new Vec3(); // Min Position
    maxBound = new Vec3(); // Max Position
    constructor(cellSize) {
        if (cellSize != undefined)
            this.cellSize = cellSize;
    }
    //#endregion ////////////////////////////////////////////////////////////
    //#region SETUP
    setCellSize(n) { this.cellSize = n; return this; }
    /** Compute a Min/Max Chunk Boundary that fits over another bounds by using cell size */
    fitBound(bMin, bMax, overScale = 1) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Figure out how many voxels can be made in mesh bounding box
        const vsize = Vec3
            .sub(bMax, bMin) // Get Length of Each Axis
            .scale(overScale) // Pad some extra space
            .divScale(this.cellSize) // How Many Cells Fit per Axis
            .ceil() // OverShoot
            .copyTo(this.dimension) // Save Cell Counts
            .scale(this.cellSize); // Actual Volume Size
        this.xzCount = this.dimension[0] * this.dimension[2];
        this.maxCoord.fromSub(this.dimension, [1, 1, 1]);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Set the starting volume
        this.minBound.xyz(0, 0, 0);
        this.maxBound.copy(vsize);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Move Volume's Mid Point to the Mesh's Mid Point
        const aMid = Vec3.lerp(bMin, bMax, 0.5);
        const bMid = Vec3.lerp(this.minBound, this.maxBound, 0.5);
        const delta = Vec3.sub(bMid, aMid);
        this.minBound.sub(delta);
        this.maxBound.sub(delta);
        this._buildStateArray();
        return this;
    }
    /** Create a Chunk Boundary based on how many cells are needed and its size, plus the origin point optional */
    asAxisBlock(cellSize, xCnt, yCnt, zCnt, origin) {
        this.cellSize = cellSize;
        this.dimension.xyz(xCnt, yCnt, zCnt);
        if (origin)
            this.minBound.copy(origin);
        else
            this.minBound.xyz(0, 0, 0);
        const mx = cellSize * xCnt;
        const my = cellSize * yCnt;
        const mz = cellSize * zCnt;
        this.maxBound
            .xyz(mx, my, mz)
            .add(this.minBound);
        this.xzCount = this.dimension[0] * this.dimension[2];
        return this;
    }
    _buildStateArray() {
        this._cellState = new Uint8Array(this.dimension.x * this.dimension.z * this.dimension.y);
    }
    //#endregion ////////////////////////////////////////////////////////////
    //#region SETTERS / GETTERS
    get cellCount() { return (this._cellState) ? this._cellState.length : 0; }
    getStateArrayRef() {
        return this._cellState;
    }
    setState(coord, isOn) {
        if (this._cellState) {
            const idx = this.coordIdx(coord);
            this._cellState[idx] = (isOn) ? 1 : 0;
        }
        return this;
    }
    getState(coord) {
        if (this._cellState) {
            const idx = this.coordIdx(coord);
            return (this._cellState[idx] == 1);
        }
        return false;
    }
    resetState() {
        if (this._cellState) {
            let i;
            for (i = 0; i < this._cellState.length; i++)
                this._cellState[i] = 0;
        }
        return this;
    }
    getNeighbors(coord) {
        const rtn = [];
        const x = coord[0];
        const y = coord[1];
        const z = coord[2];
        if (z < this.maxCoord[2])
            rtn.push([x, y, z + 1]); // Forward
        if (z > 0)
            rtn.push([x, y, z - 1]); // Back
        if (x < this.maxCoord[0])
            rtn.push([x + 1, y, z]); // Right
        if (x > 0)
            rtn.push([x - 1, y, z]); // Left
        if (y < this.maxCoord[2])
            rtn.push([x, y + 1, z]); // Up
        if (y > 0)
            rtn.push([x, y - 1, z]); // Down
        return rtn;
    }
    getActiveNeighbors(coord) {
        const rtn = [];
        const v = new Vec3();
        let no;
        for (no of NEIGHBOR_OFFSETS) {
            v.fromAdd(coord, no);
            if (this.isCoord(v) && this.getState(v))
                rtn.push(v.toArray());
        }
        return rtn;
    }
    //#endregion
    //#region USER DATA
    /*
    prepareDataSpace(): this{
        if( this._cellState && !this._cellData ){
            this._cellData = new Array( this._cellState.length );
        }
        return this;
    }
    */
    //#endregion
    //#region COORDINATE MATH
    /** Using Voxel Coordinates, Gets the Cell Array Index */
    coordIdx(coord) {
        // ( xLen * zLen * y ) + ( xLen * z ) + x
        return this.xzCount * coord[1] + this.dimension[0] * coord[2] + coord[0];
    }
    /** Using Cell Array Index, Compute Voxel Coordinate */
    idxCoord(i, out) {
        const y = Math.floor(i / this.xzCount); // How Many Y Levels Can We Get?
        const xz = i - y * this.xzCount; // Subtract Y Levels from total, To get remaining Layer
        const z = Math.floor(xz / this.dimension[0]); // How many rows in the last layer can we get?
        out = out || [0, 0, 0];
        out[0] = xz - z * this.dimension[0];
        out[1] = y;
        out[2] = z;
        return out;
    }
    /** Convert Worldspace Position to Voxel Coordinates */
    posCoord(pos, out) {
        out = out || new Vec3();
        out.fromSub(pos, this.minBound) // Localize Postion in relation to Chunk's Starting position
            .divScale(this.cellSize) // Divide  the Local Position by Voxel's Size.
            .floor(); // Floor it to get final coordinate value.
        return out;
    }
    /** Get the cell min/max boundary from voxel coordinates */
    coordBound(coord, minOut, maxOut) {
        minOut.fromScale(coord, this.cellSize)
            .add(this.minBound);
        maxOut.fromAdd(coord, [1, 1, 1])
            .scale(this.cellSize)
            .add(this.minBound);
    }
    /** Get the cell min boundary from voxel coordinates */
    coordMinBound(coord, minOut) {
        minOut.fromScale(coord, this.cellSize)
            .add(this.minBound);
    }
    /** Get the center point of a cell */
    coordMidPoint(coord, out) {
        const h = this.cellSize * 0.5;
        out.fromScale(coord, this.cellSize)
            .add(this.minBound)
            .add([h, h, h]);
    }
    isCoord(coord) {
        if (coord[0] < 0 || coord[0] > this.maxCoord[0])
            return false;
        if (coord[1] < 0 || coord[1] > this.maxCoord[1])
            return false;
        if (coord[2] < 0 || coord[2] > this.maxCoord[2])
            return false;
        return true;
    }
    //#endregion ////////////////////////////////////////////////////////////
    //#region ITER
    /** Loop over all the cells */
    iterAllCells() {
        let i = 0;
        const sCell = this._cellState;
        const len = sCell.length;
        const val = {
            min: new Vec3(),
            max: new Vec3(),
            coord: new Vec3(),
            isOn: false,
        };
        const result = { done: false, value: val };
        const next = () => {
            if (i >= len)
                result.done = true;
            else {
                val.isOn = (sCell[i] != 0); // Is Cell Active
                this.idxCoord(i++, val.coord); // Compute Voxel Coordinate
                val.min // Compute Min Bounds for Cell
                    .fromScale(val.coord, this.cellSize)
                    .add(this.minBound);
                val.max // Compute Max Bounds for Cell
                    .fromAdd(val.coord, [1, 1, 1])
                    .scale(this.cellSize)
                    .add(this.minBound);
            }
            return result;
        };
        return { [Symbol.iterator]() { return { next }; } };
    }
    /** Loop over only cells that are active */
    iterActiveCells() {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get a list of cell indices that are currently active
        let ii;
        const indices = [];
        const sCell = this._cellState;
        for (ii = 0; ii < sCell.length; ii++) {
            if (sCell[ii] == 1)
                indices.push(ii);
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let i = 0;
        const len = indices.length;
        const val = {
            min: new Vec3(),
            max: new Vec3(),
            coord: new Vec3(),
        };
        const result = { done: false, value: val };
        const next = () => {
            if (i >= len)
                result.done = true;
            else {
                ii = indices[i]; // Get Cell Index
                this.idxCoord(ii, val.coord); // Compute Voxel Coordinate
                val.min // Compute Min Bounds for Cell
                    .fromScale(val.coord, this.cellSize)
                    .add(this.minBound);
                val.max // Compute Max Bounds for Cell
                    .fromAdd(val.coord, [1, 1, 1])
                    .scale(this.cellSize)
                    .add(this.minBound);
                i++;
            }
            return result;
        };
        return { [Symbol.iterator]() { return { next }; } };
    }
}
export default VoxelChunk;
