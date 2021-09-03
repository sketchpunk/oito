import UniqueVertexGeo from "./UniqueVertexGeo.js";
import Util from "./Util.js";
class Polyhedron {
    static get(div = 0, radius = 1) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const base = {
            texcoord: [],
            normals: [],
            indices: [
                2, 1, 0, 0, 3, 2,
                0, 4, 7, 7, 3, 0,
                0, 1, 5, 5, 4, 0,
                1, 2, 6, 6, 5, 1,
                2, 3, 7, 7, 6, 2,
                4, 5, 6, 6, 7, 4
            ],
            vertices: [
                -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
                -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
            ],
        };
        if (div == 0) {
            Util.normalizeScaleVertices(base, radius, true);
            return base;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const uvg = new UniqueVertexGeo();
        uvg.subdivGeo(base, div + 1); // Sub Divide Basic Shape without creating duplicate vertices
        Util.normalizeScaleVertices(uvg.geo, radius, true); // Make the shape a sphere & create normals in the process.
        return uvg.geo;
    }
}
export default Polyhedron;
