class Quad {
    static getInterleaved() {
        return {
            indices: [0, 1, 2, 2, 3, 0],
            buffer: [
                -0.5, 0.5, 0.0, 0, 0, 1, 0, 0,
                -0.5, -0.5, 0.0, 0, 0, 1, 0, 1,
                0.5, -0.5, 0.0, 0, 0, 1, 1, 1,
                0.5, 0.5, 0.0, 0, 0, 1, 1, 0
            ]
        };
    }
    static get(w = 1, h = 1, isPlane = false) {
        const wh = w * 0.5;
        const hh = h * 0.5;
        const rtn = {
            indices: [0, 1, 2, 2, 3, 0],
            texcoord: [0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0],
            normals: [],
            vertices: [],
        };
        if (isPlane) { // Quad Facing Up
            rtn.normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
            rtn.vertices.push(-wh, 0.0, hh, -wh, 0.0, -hh, wh, 0.0, -hh, wh, 0.0, hh);
        }
        else { // Quad Facing Forward
            rtn.normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
            rtn.vertices.push(-wh, hh, 0.0, -wh, -hh, 0.0, wh, -hh, 0.0, wh, hh, 0.0);
        }
        return rtn;
    }
}
export default Quad;
