import Vec3 from "../../Vec3.js";
// Based on White Paper
// http://www.delasa.net/data/sca2013_voxelization.pdf
class VoxelGeodesic {
    //#region MAIN
    cells = new Map();
    smooth = 0.7;
    minDistance = 0.0001; // Can't use Zero because of Weight equation, so need a min number.
    maxDistance = 0;
    //constructor(){}
    //#endregion
    addCell(coord, midPoint) {
        const k = Vec3.toKey(coord);
        const c = new GeodesicCell(midPoint);
        this.cells.set(k, c);
        return this;
    }
    getCell(coord) {
        const k = Vec3.toKey(coord);
        return this.cells.get(k);
    }
    setDistanceIfLower(coord, bIdx, dist) {
        const c = this.getCell(coord);
        if (!c)
            return false;
        let i = c.items.get(bIdx);
        if (!i)
            i = c.add(bIdx);
        if (dist < i.distance) {
            i.distance = dist;
            return true;
        }
        return false;
    }
    getDistance(coord, bIdx) {
        const c = this.getCell(coord);
        if (!c)
            return Infinity;
        const i = c.items.get(bIdx);
        return (i) ? i.distance : Infinity;
    }
    getCellMidPoint(coord) {
        const k = Vec3.toKey(coord);
        const o = this.cells.get(k);
        return (o) ? o.midPoint : null;
    }
    /** Get the Vertex's Bone Weight & Indices */
    getVertexWeight(coord, vert, outWeights, outIndices) {
        // D   = Product of BBox Extends, using VecLen( minPos, maxPos )
        // distNormalized : dn = ( boneDistance + ( vertex - cellMidPoint ) ) / D;
        // weight = ( 1 / (1-smooth)*dn + smooth*dn^2 )^2
        // 1. Get Vert delta distance from voxel center.
        // 2. Get the Top 4 Bones
        // 3. Compute Vertex Normalized Distance for each bone
        // 4. Compute The Vertex Weight.
        // 5. Compute Weight Sum
        // 6. Normalize Weight with sum
        // 7. Filter out bones with very little influence
        const cell = this.getCell(coord);
        if (!cell)
            return false;
        const vlen = Vec3.len(cell.midPoint, vert);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Collect the bone data thats needed.
        const bones = Array
            .from(cell.items.values())
            .sort((a, b) => (a.distance < b.distance) ? -1 : 1) // Shortest to Furthest distance
            .slice(0, 4) // Cap at 4 bones because of Vec4 Limit
        ;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Add Vertex to Centroid Distance to Voxel Distance, then divide it by max possible distance for the chunk.
        const ndist = bones.map(i => { return Math.max(this.minDistance, i.distance + vlen) / this.maxDistance; });
        // For each Normalized Distance, Compute its overall weight with a smoothing factor
        const wgt = ndist.map(dist => { return (1 / ((1 - this.smooth) * dist + this.smooth * (dist ** 2))) ** 2; });
        // Total Weight of all Bones
        let sum = wgt.reduce((p, c) => p + c, 0);
        // Normalize Weight
        wgt.forEach((v, i, a) => a[i] /= sum);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Extra Filtering to limit bone influence
        // Remove bone influence if less then 0.1
        const MIN_NWGT = 0.1;
        const minW = wgt.reduce((p, c) => Math.min(p, c), Infinity);
        if (minW < MIN_NWGT) {
            wgt.forEach((v, i, a) => { if (v < 0.1)
                a[i] = 0; }); // Set Zero on Specific Bones
            sum = wgt.reduce((p, c) => p + c, 0); // Compute new Sum
            wgt.forEach((v, i, a) => a[i] /= sum); // Normalize Again
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Save Results
        wgt.forEach((v, i) => {
            if (v != 0) {
                outWeights[i] = v;
                outIndices[i] = bones[i].boneIdx;
            }
        });
        return true;
    }
    /** Create GeoDesic Cell data for each active voxel cell  */
    fromChunk(chunk) {
        this.maxDistance = Vec3.len(chunk.minBound, chunk.maxBound);
        const v = new Vec3();
        for (const itm of chunk.iterAllCells()) {
            if (!itm.isOn)
                continue;
            v.fromLerp(itm.min, itm.max, 0.5); // cell mid point
            this.addCell(itm.coord, v); // add active cell to collection
        }
    }
}
//#region SUB TYPES
class GeodesicCell {
    items = new Map();
    midPoint = [0, 0, 0];
    constructor(mid) {
        Vec3.copy(mid, this.midPoint);
    }
    add(idx) {
        const gi = new GeodesicItem(idx);
        this.items.set(idx, gi);
        return gi;
    }
    getDistance(bIdx) {
        const o = this.items.get(bIdx);
        return (o) ? o.distance : Infinity;
    }
}
class GeodesicItem {
    distance = Infinity; // Distance Voxel is away from Bone
    boneIdx = 0; // Index of Bone
    constructor(idx) { this.boneIdx = idx; }
}
//#endregion
export default VoxelGeodesic;
