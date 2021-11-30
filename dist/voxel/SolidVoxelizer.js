//#region IMPORTS
import Vec3 from "../Vec3.js";
import Intersect from "../geometry/Intersect.js";
class CellData {
    norm = new Vec3();
    hasBackface = false;
    hasFrontface = false;
    //constructor(){}
    setNorm(n) {
        this.norm.add(n);
        const dot = Vec3.dot(n, Vec3.FORWARD);
        if (dot >= 0)
            this.hasFrontface = true;
        else
            this.hasBackface = true;
        return this;
    }
    static genKey(x, y, z) { return x + '_' + y + '_' + z; }
}
class SolidVoxelizer {
    //#region MAIN
    a = new Vec3(); // Triangle Points
    b = new Vec3();
    c = new Vec3();
    vmin = new Vec3(); // Triangle Bounding Box
    vmax = new Vec3();
    minCoord = new Vec3(); // Min/Max Voxel Coordinates
    maxCoord = new Vec3();
    minCell = new Vec3(); // Min/Max Voxel Cell Bounds
    maxCell = new Vec3();
    v0 = new Vec3();
    v1 = new Vec3();
    data = new Map();
    //#endregion
    fromGeometry(chunk, vertices, indices) {
        this.data.clear();
        let i;
        for (i = 0; i < indices.length; i += 3) {
            this.setTriVoxIntersect(indices[i], indices[i + 1], indices[i + 2], vertices, chunk);
        }
        this.fillVolume(chunk);
    }
    setTriVoxIntersect(ia, ib, ic, vertices, chunk) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get the Vertices
        const a = this.a.fromBuf(vertices, ia * 3);
        const b = this.b.fromBuf(vertices, ib * 3);
        const c = this.c.fromBuf(vertices, ic * 3);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Compute its bounding Box
        const vmin = this.vmin.copy(a).min(b).min(c);
        const vmax = this.vmax.copy(a).max(b).max(c);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Compute the Voxel Coordinates of the area
        // the triangle takes up with its bounding box.
        chunk.posCoord(vmin, this.minCoord);
        chunk.posCoord(vmax, this.maxCoord);
        const [minx, miny, minz] = this.minCoord;
        const [maxx, maxy, maxz] = this.maxCoord;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Loop every voxel the triangle might be in and do
        // an intersection test to see if the triangle is truely
        // in the voxel cell.
        let x, y, z, isHit, key, cell;
        const norm = new Vec3();
        for (y = miny; y <= maxy; y++) {
            for (z = minz; z <= maxz; z++) {
                for (x = minx; x <= maxx; x++) {
                    chunk.coordBound([x, y, z], this.minCell, this.maxCell); // Get Cell Boundary Position
                    isHit = Intersect.triangle_aabb(a, b, c, this.minCell, this.maxCell); // Test Triangle-AABB Intersection
                    if (isHit) {
                        chunk.setState([x, y, z], true); // If hit, set Cell as ON.
                        //------------------------------------------
                        key = CellData.genKey(x, y, z); // Generate Cell Key
                        cell = this.data.get(key); // Get Existing Data
                        if (!cell) { // ... If not exist, create it.
                            cell = new CellData();
                            this.data.set(key, cell);
                        }
                        //------------------------------------------
                        this.getTriNorm(a, b, c, norm); // Compute Normal Dir of Triangle
                        cell.setNorm(norm); // Save Normal to Cell, computes face direction, etc.
                    }
                }
            }
        }
    }
    getTriNorm(a, b, c, out) {
        this.v0.fromSub(b, a);
        this.v1.fromSub(c, a);
        out.fromCross(this.v0, this.v1).norm();
    }
    /*
    This fill isn't perfect, there are a few false positives that happens in the back of the volume.
    Some back voxels might still trigger a "inner" state at the end. Possible solution is when a voxel
    is found as an entry, scan ahead looking for an exit voxel. If it does exist then fill the in between
    voxels. If a an entry is found but no exit, can skip them as the entry is most likely a falsey.

    BUT, if using this for AutoSkinning, a few extra voxels turned on won't hurt things. The most
    important thing is to have all the inner voxels filled. If there are hollow parts inside the voxel
    volume, they can get in the way of doing heat traversal which will cause inaccurate heat values. Its
    very important to be able to reach any shell voxel during heat traversal since those voxels are the ones
    that actually contain vertices.
    
    Bad if vertices are unable to be assigned to a bone because the heat traverse
    wasn't able to reach the voxel they exist in.
    */
    fillVolume(chunk) {
        const [mx, my, mz] = chunk.dimension;
        let x, y, z, isOn, key, cell, dot, inner = false;
        for (x = 0; x < mx; x++) {
            for (y = 0; y < my; y++) {
                inner = false; // Reset before each loop
                for (z = mz - 1; z >= 0; z--) {
                    isOn = chunk.getState([x, y, z]);
                    if (isOn) {
                        // Get Cell Data, if theres none, skip thisc cell
                        key = CellData.genKey(x, y, z);
                        cell = this.data.get(key);
                        if (!cell)
                            continue;
                        // Heck if the voxel is an entry or exit point
                        dot = Vec3.dot(cell.norm.norm(), Vec3.FORWARD);
                        inner = (dot > -0.1 || (cell.hasFrontface && !cell.hasBackface));
                    }
                    else {
                        // This cell if off, Did we pass an Entry Voxel & is this not the last voxel in the row
                        // if so, turn on this cell since it most likely inner volume voxel.
                        if (inner && z != 0) {
                            chunk.setState([x, y, z], true);
                        }
                    }
                }
            }
        }
    }
}
export default SolidVoxelizer;
