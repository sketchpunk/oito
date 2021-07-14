import Maths from "../Maths.js";
import Vec3 from "../Vec3.js";
class Torus {
    // https://github.com/glo-js/primitive-torus
    static get(outerRadius = 0.5, outerSteps = 8, innerRadius = 0.15, innerSteps = 6) {
        const rtn = {
            indices: [],
            vertices: [],
            normals: [],
            texcoord: [],
        };
        const pv = new Vec3();
        const cv = [0, 0, 0]; // Center Point
        let u_cos, u_sin, v_cos, v_sin;
        let i, j, u = 0, v = 0, jt = 0, ti = 0;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for (j = 0; j <= innerSteps; j++) {
            jt = j / innerSteps;
            v = jt * Maths.PI_2;
            v_cos = Math.cos(v);
            v_sin = Math.sin(v);
            for (i = 0; i <= outerSteps; i++) {
                ti = i / outerSteps;
                u = ti * Maths.PI_2;
                u_cos = Math.cos(u);
                u_sin = Math.sin(u);
                // Center Point Around
                cv[0] = outerRadius * u_cos;
                cv[2] = outerRadius * u_sin;
                // Point Round Center
                pv[0] = (outerRadius + innerRadius * v_cos) * u_cos;
                pv[1] = innerRadius * v_sin;
                pv[2] = (outerRadius + innerRadius * v_cos) * u_sin;
                pv.pushTo(rtn.vertices)
                    .sub(cv)
                    .norm()
                    .pushTo(rtn.normals);
                rtn.texcoord.push(ti, jt);
            }
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let a, b, c, d;
        for (j = 1; j <= innerSteps; j++) {
            for (i = 1; i <= outerSteps; i++) {
                a = (outerSteps + 1) * j + i - 1;
                b = (outerSteps + 1) * (j - 1) + i - 1;
                c = (outerSteps + 1) * (j - 1) + i;
                d = (outerSteps + 1) * j + i;
                rtn.indices.push(a, d, c, c, b, a);
            }
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return rtn;
    }
}
export default Torus;
