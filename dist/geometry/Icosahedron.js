import UniqueVertexGeo from "./extra/UniqueVertexGeo.js";
import Util from "./extra/Util.js";
class Icosahedron {
    static get(div = 0, radius = 1) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const t = (1 + Math.sqrt(5)) / 2;
        const base = {
            texcoord: [],
            normals: [],
            indices: [
                0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
                1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
                3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
                4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
            ],
            vertices: [
                -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0,
                0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t,
                t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1
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
export default Icosahedron;
