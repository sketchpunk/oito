//#region IMPORTS
import Vec3 from "../Vec3.js";
//#endregion///////////////////////////////////////////////////
class VoxelMesh {
    //#region STATIC VOXEL CELL DATA
    // Direction of Quads to build a Voxel
    static XP = 3;
    static XN = 1;
    static YP = 4;
    static YN = 5;
    static ZP = 2;
    static ZN = 0;
    // Information needed for each quad that is created.
    // Quads are 1 Unit with its origin set at the bottom left corner
    static UV = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
    static INDEX = [0, 1, 2, 2, 3, 0];
    static FACES = [
        { n: [0.0, 0.0, -1.0], nOffset: false,
            v: [
                [1.0, 0.0, 0.0],
                [0.0, 0.0, 0.0],
                [0.0, 1.0, 0.0],
                [1.0, 1.0, 0.0]
            ] },
        { n: [-1.0, 0.0, 0.0], nOffset: false,
            v: [
                [0.0, 0.0, 0.0],
                [0.0, 0.0, 1.0],
                [0.0, 1.0, 1.0],
                [0.0, 1.0, 0.0]
            ] },
        { n: [0.0, 0.0, 1.0], nOffset: true,
            v: [
                [0.0, 0.0, 0.0],
                [1.0, 0.0, 0.0],
                [1.0, 1.0, 0.0],
                [0.0, 1.0, 0.0]
            ] },
        { n: [1.0, 0.0, 0.0], nOffset: true,
            v: [
                [0.0, 0.0, 1.0],
                [0.0, 0.0, 0.0],
                [0.0, 1.0, 0.0],
                [0.0, 1.0, 1.0]
            ] },
        { n: [0.0, 1.0, 0.0], nOffset: true,
            v: [
                [0.0, 0.0, 1.0],
                [1.0, 0.0, 1.0],
                [1.0, 0.0, 0.0],
                [0.0, 0.0, 0.0]
            ] },
        { n: [0.0, -1.0, 0.0], nOffset: false,
            v: [
                [0.0, 0.0, 0.0],
                [1.0, 0.0, 0.0],
                [1.0, 0.0, 1.0],
                [0.0, 0.0, 1.0]
            ] } //Bottom
    ];
    //#endregion
    static fromChunk(chunk, geo) {
        const cells = chunk.getStateArrayRef();
        if (!cells)
            return;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const coord = [0, 0, 0];
        const csize = chunk.cellSize;
        const yIdx = chunk.xzCount;
        const zIdx = chunk.dimension[0];
        const xMax = chunk.dimension[0] - 1;
        const yMax = chunk.dimension[1] - 1;
        const zMax = chunk.dimension[2] - 1;
        const bMin = new Vec3();
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for (let i = 0; i < cells.length; i++) {
            if (cells[i] == 0)
                continue; // If Cell is Empty, Skip
            chunk.idxCoord(i, coord);
            chunk.coordMinBound(coord, bMin);
            if (cells[i - 1] === 0 || coord[0] === 0)
                this.appendFace(VoxelMesh.XN, csize, bMin, geo);
            if (cells[i + 1] === 0 || coord[0] >= xMax)
                this.appendFace(VoxelMesh.XP, csize, bMin, geo);
            if (cells[i - zIdx] === 0 || coord[2] === 0)
                this.appendFace(VoxelMesh.ZN, csize, bMin, geo);
            if (cells[i + zIdx] === 0 || coord[2] >= zMax)
                this.appendFace(VoxelMesh.ZP, csize, bMin, geo);
            if (cells[i - yIdx] === 0 || coord[1] === 0)
                this.appendFace(VoxelMesh.YN, csize, bMin, geo);
            if (cells[i + yIdx] === 0 || coord[1] >= yMax)
                this.appendFace(VoxelMesh.YP, csize, bMin, geo);
        }
    }
    static fromChunkRange(chunk, geo, minCoord, maxCoord) {
        const cells = chunk.getStateArrayRef();
        if (!cells)
            return;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const coord = [0, 0, 0];
        const csize = chunk.cellSize;
        const yIdx = chunk.xzCount;
        const zIdx = chunk.dimension[0];
        const xMax = chunk.dimension[0] - 1;
        const yMax = chunk.dimension[1] - 1;
        const zMax = chunk.dimension[2] - 1;
        const bMin = new Vec3();
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for (let i = 0; i < cells.length; i++) {
            if (cells[i] == 0)
                continue; // If Cell is Empty, Skip
            chunk.idxCoord(i, coord);
            if (coord[0] < minCoord[0] || coord[0] > maxCoord[0])
                continue;
            if (coord[1] < minCoord[1] || coord[0] > maxCoord[1])
                continue;
            if (coord[2] < minCoord[2] || coord[0] > maxCoord[2])
                continue;
            chunk.coordMinBound(coord, bMin);
            if (cells[i - 1] === 0 || coord[0] === 0)
                this.appendFace(VoxelMesh.XN, csize, bMin, geo);
            if (cells[i + 1] === 0 || coord[0] >= xMax)
                this.appendFace(VoxelMesh.XP, csize, bMin, geo);
            if (cells[i - zIdx] === 0 || coord[2] === 0)
                this.appendFace(VoxelMesh.ZN, csize, bMin, geo);
            if (cells[i + zIdx] === 0 || coord[2] >= zMax)
                this.appendFace(VoxelMesh.ZP, csize, bMin, geo);
            if (cells[i - yIdx] === 0 || coord[1] === 0)
                this.appendFace(VoxelMesh.YN, csize, bMin, geo);
            if (cells[i + yIdx] === 0 || coord[1] >= yMax)
                this.appendFace(VoxelMesh.YP, csize, bMin, geo);
        }
    }
    static appendFace(fIdx, scl, origin, geo) {
        const face = VoxelMesh.FACES[fIdx];
        const vIdx = geo.vertices.length / 3;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Face Vertices
        let v;
        const p = new Vec3();
        for (v of face.v) {
            if (face.nOffset)
                p.fromAdd(v, face.n); // Face Needs to be Pushed by Normal Direction
            else
                p.copy(v); // No Pushing, Just copy vert
            p.scale(scl) // Resize Face to match voxel size
                .add(origin) // Move to Voxel Origin
                .pushTo(geo.vertices); // Save Vertices
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Indices, Normals and UVs
        let i;
        for (i = 0; i < 6; i++)
            geo.indices.push(VoxelMesh.INDEX[i] + vIdx); // Face Index with Vertex Index Offset
        for (i = 0; i < 4; i++)
            geo.normals.push(...face.n); // Face Normal
        geo.texcoord.push(...VoxelMesh.UV); // Face UV
    }
}
export default VoxelMesh;
