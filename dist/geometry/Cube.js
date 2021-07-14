class Cube {
    static get(width = 1, height = 1, depth = 1) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const x1 = width * 0.5, y1 = height * 0.5, z1 = depth * 0.5, x0 = -x1, y0 = -y1, z0 = -z1;
        // Starting bottom left corner, then working counter clockwise to create the front face.
        // Backface is the first face but in reverse (3,2,1,0)
        // keep each quad face built the same way to make index and uv easier to assign
        const vert = [
            x0, y1, z1,
            x0, y0, z1,
            x1, y0, z1,
            x1, y1, z1,
            x1, y1, z0,
            x1, y0, z0,
            x0, y0, z0,
            x0, y1, z0,
            x1, y1, z1,
            x1, y0, z1,
            x1, y0, z0,
            x1, y1, z0,
            x0, y0, z1,
            x0, y0, z0,
            x1, y0, z0,
            x1, y0, z1,
            x0, y1, z0,
            x0, y0, z0,
            x0, y0, z1,
            x0, y1, z1,
            x0, y1, z0,
            x0, y1, z1,
            x1, y1, z1,
            x1, y1, z0, //4
        ];
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //Build the index of each quad [0,1,2, 2,3,0]
        let i;
        const idx = [];
        for (i = 0; i < vert.length / 3; i += 2)
            idx.push(i, i + 1, (Math.floor(i / 4) * 4) + ((i + 2) % 4));
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //Build UV data for each vertex
        const uv = [];
        for (i = 0; i < 6; i++)
            uv.push(0, 0, 0, 1, 1, 1, 1, 0);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return {
            vertices: vert,
            indices: idx,
            texcoord: uv,
            normals: [
                0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
                1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
                0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
                -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
                0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 //Top
            ],
        };
    }
}
export default Cube;
