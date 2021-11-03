//#region IMPORTS
import Vec3 from "../Vec3.js";
import Intersect from "../geometry/Intersect.js";
class Voxelizer {
    constructor() {
        //#region MAIN
        this.a = new Vec3(); // Triangle Points
        this.b = new Vec3();
        this.c = new Vec3();
        this.vmin = new Vec3(); // Triangle Bounding Box
        this.vmax = new Vec3();
        this.minCoord = new Vec3(); // Min/Max Voxel Coordinates
        this.maxCoord = new Vec3();
        this.minCell = new Vec3(); // Min/Max Voxel Cell Bounds
        this.maxCell = new Vec3();
    }
    //#endregion
    fromGeometry(chunk, vertices, indices) {
        let i;
        for (i = 0; i < indices.length; i += 3) {
            this.setTriVoxIntersect(indices[i], indices[i + 1], indices[i + 2], vertices, chunk);
        }
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
        let x, y, z, isHit;
        for (y = miny; y <= maxy; y++) {
            for (z = minz; z <= maxz; z++) {
                for (x = minx; x <= maxx; x++) {
                    chunk.coordBound([x, y, z], this.minCell, this.maxCell); // Get Cell Boundary Position
                    isHit = Intersect.triangle_aabb(a, b, c, this.minCell, this.maxCell); // Test Triangle-AABB Intersection
                    if (isHit)
                        chunk.setState([x, y, z], true); // If hit, set Cell as ON.
                }
            }
        }
    }
}
export default Voxelizer;
