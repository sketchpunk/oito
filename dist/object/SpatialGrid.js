/* eslint-disable @typescript-eslint/no-explicit-any */
//#region SUPPORT OBJECTS
class SpatialCell {
    constructor() {
        this.items = [];
    }
    push(itm) { this.items.push(itm); }
    clear() { this.items.length = 0; }
}
class SpatialItem {
    constructor(x, y, data = null) {
        this.pos = [0, 0];
        this.userData = null;
        this.queryId = 0;
        this.setPos(x, y);
        this.userData = data;
    }
    setData(d) { this.userData = d; return this; }
    setPos(x, y) {
        this.pos[0] = x;
        this.pos[1] = y;
        return this;
    }
}
//#endregion
class SpatialGrid {
    constructor() {
        //#region MAIN
        this.cells = [];
        this.width = 0;
        this.height = 0;
        this.cellSize = 100;
        this.cellXLen = 0;
        this.cellYLen = 0;
        this.queryId = 0; // Help create a unqiue list of spatialItems.
        //#endregion
    }
    //constructor(){}
    //#endregion
    //#region PRIVATE METHODS
    /** Resize Cell buffer while computing the Cell X Y Count */
    _computeCellCount() {
        this.cellXLen = Math.ceil(this.width / this.cellSize);
        this.cellYLen = Math.ceil(this.height / this.cellSize);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Append to Cell if Needed
        const cellLen = this.cellXLen * this.cellYLen;
        for (let i = this.cells.length; i < cellLen; i++) {
            this.cells.push(null);
        }
    }
    /** Convert Grid Coordinates to Cell Index */
    _gridIdx(x, y) {
        if (y > this.cellYLen)
            y = this.cellYLen;
        else if (y < 0)
            y = 0;
        if (x > this.cellXLen)
            x = this.cellXLen;
        else if (x < 0)
            x = 0;
        return y * this.cellXLen + x;
    }
    /** Convert Screen Coordinates to Cell Index */
    _coordIdx(x, y) {
        const gx = Math.floor(x / this.cellSize);
        const gy = Math.floor(y / this.cellSize);
        return this._gridIdx(gx, gy);
    }
    /** Convert Screen Coordinates to Grid Coordinates */
    _coordGrid(x, y) {
        const gx = Math.floor(x / this.cellSize);
        const gy = Math.floor(y / this.cellSize);
        return [gx, gy];
    }
    _cellMidPoint(x, y) {
        return [
            x * this.cellSize + this.cellSize * 0.5,
            y * this.cellSize + this.cellSize * 0.5,
        ];
    }
    //#endregion
    //#region SETTERS
    setAreaSize(w, h) {
        this.width = w;
        this.height = h;
        this._computeCellCount();
        return this;
    }
    setCellSize(v) {
        this.cellSize = v;
        return this;
    }
    //#endregion
    //#region MANAGE CELLS
    _addToCell(gx, gy, sItem) {
        const idx = this._gridIdx(gx, gy);
        let cell = this.cells[idx];
        if (!cell)
            this.cells[idx] = cell = new SpatialCell();
        cell.push(sItem);
    }
    getCell(gx, gy) {
        const idx = this._gridIdx(gx, gy);
        return this.cells[idx];
    }
    clear() {
        let i;
        for (i of this.cells)
            if (i)
                i.clear();
        this.queryId = 0;
        return this;
    }
    //#endregion
    //#region METHODS
    addCircle(x, y, radius, data = null) {
        // Compute the bounding area of the Circle
        const minX = Math.max(x - radius, 0);
        const minY = Math.max(y - radius, 0);
        const maxX = Math.min(x + radius, this.width);
        const maxY = Math.min(y + radius, this.height);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Min & Max Grid Cordinates that the Circle Fits in.
        const gMin = this._coordGrid(minX, minY);
        const gMax = this._coordGrid(maxX, maxY);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Add Item to all the cells its within range
        const sItem = new SpatialItem(x, y, data);
        let gx, gy;
        for (gy = gMin[1]; gy <= gMax[1]; gy++) {
            for (gx = gMin[0]; gx <= gMax[0]; gx++) {
                this._addToCell(gx, gy, sItem);
            }
        }
    }
    getNear(x, y, xRange = 0, yRange = 0) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const gCoord = this._coordGrid(x, y);
        const midPnt = this._cellMidPoint(gCoord[0], gCoord[1]);
        //const minX   = Math.max( 0, gCoord[0] - xRange );
        //const minY   = Math.max( 0, gCoord[1] - yRange );
        //const maxX   = Math.min( this.cellXLen, gCoord[0] + xRange );
        //const maxY   = Math.min( this.cellYLen, gCoord[1] + yRange );
        // Use Mid Point to define range
        let minX, maxX;
        if (x < midPnt[0]) {
            minX = Math.max(gCoord[0] - xRange, 0);
            maxX = gCoord[0];
        }
        else {
            minX = gCoord[0];
            maxX = Math.min(gCoord[0] + xRange, this.cellXLen);
        }
        let minY, maxY;
        if (y < midPnt[1]) {
            minY = Math.max(gCoord[1] - yRange, 0);
            maxY = gCoord[1];
        }
        else {
            minY = gCoord[1];
            maxY = Math.min(gCoord[1] + yRange, this.cellYLen);
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const qId = ++this.queryId;
        const rtn = [];
        let gx, gy, cell, itm;
        for (gy = minY; gy <= maxY; gy++) {
            for (gx = minX; gx <= maxX; gx++) {
                //----------------------------------
                // Get Cell and Check if there are any items available
                cell = this.getCell(gx, gy);
                if (!cell || cell.items.length == 0)
                    continue;
                //----------------------------------
                // Collect a unique list of items
                //console.log( "near", gx, gy, cell );
                for (itm of cell.items) {
                    if (itm.queryId != qId) {
                        itm.queryId = qId; // Update ID so it won't be picked again.
                        rtn.push(itm); // Save item for return list
                    }
                }
            }
        }
        return rtn;
    }
}
export default SpatialGrid;
