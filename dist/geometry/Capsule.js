import Util from "./Util.js";
import Vec3 from "../Vec3.js";
import Maths from "../Maths.js";
class Capsule {
    static get(radius = 0.5, height = 1.0, latheSteps = 10, arcSteps = 5) {
        const rtn = {
            vertices: [],
            indices: [],
            texcoord: [],
            normals: [],
        };
        const cLen = arcSteps * 2;
        const rLen = latheSteps + 1;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Util.gridIndices(rtn.indices, cLen, rLen, 0, false, false);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Vertices 
        const base = [];
        const hh = height / 2;
        const up = [0, hh, 0];
        const dn = [0, -hh, 0];
        Util.arcVertices(base, Maths.PI_H, 0, arcSteps, radius, up); // Top Dome
        Util.arcVertices(base, 0, -Maths.PI_H, arcSteps, radius, dn); // Bottom Dome
        Util.lathe(base, rtn.vertices, latheSteps, true); // Repeat Pattern in a Circular Y Axis
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Normals
        let v;
        for (v of Vec3.bufIter(rtn.vertices)) {
            v.add((v[1] > 0) ? dn : up)
                .norm()
                .pushTo(rtn.normals);
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // UV
        let x, y, yt;
        for (y = 0; y <= rLen; y++) {
            yt = 1 - (y / rLen);
            for (x = 0; x <= cLen; x++)
                rtn.texcoord.push(x / cLen, yt);
        }
        return rtn;
    }
}
export default Capsule;
