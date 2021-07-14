"use strict";
Torus.knot_geo = function (col_cnt = 10, row_cnt = 60, tube_radius = 0.3, curve_p = 2, curve_q = 3, curve_radius = 1.0) {
    let shape = Util.circle_verts(col_cnt, tube_radius), // Shape to Extrude
    v_ary = new Vec3Buffer(col_cnt * row_cnt), // Vertex Buffer
    n_ary = new Vec3Buffer(col_cnt * row_cnt), // Vertex Normal Buffer
    p = new App.Vec3(), // Curve Position
    v = new App.Vec3(), // Final vertex
    n = new App.Vec3(), // Final vertex norma.
    fwd = new App.Vec3(), // axis directions
    lft = new App.Vec3(), up = new App.Vec3(), q = new App.Quat(), // Rotation for extruded shape
    ct, i, j;
    for (i = 0; i < row_cnt; i++) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        ct = i / row_cnt; // Curve Time
        torus_knot(p, ct, curve_p, curve_q, curve_radius); // Pos On Curve
        torus_knot_dxdy(fwd, ct, curve_p, curve_q, curve_radius); // Fwd Dir of Point
        torus_knot_dxdy(up, (i + 0.00001) / row_cnt, curve_p, curve_q, curve_radius); // Near Future Fwd Dir
        fwd.norm(); // Forward
        up.add(p); // Temp Up ( Adding to pos makes it twist less )
        lft.from_cross(up, fwd).norm(); // Left
        up.from_cross(fwd, lft).norm(); // Orthogonal Up
        q.from_axis(lft, up, fwd); // Create Rotation Based on Orthogonal Axis
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for (j = 0; j < shape.len; j++) {
            shape.copy_to(j, v); // Get position from vert buffer
            v.transform_quat(q); // Rotate the vector
            n.from_norm(v); // Normalize a copy
            v.add(p); // Move vert into position
            v_ary.push(v); // Save Verts
            n_ary.push(n); // Save Normal
        }
    }
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    return {
        vert: v_ary.dissolve(),
        norm: n_ary.dissolve(),
        idx: Util.grid_indices(col_cnt, row_cnt, true, true, true)
    };
};
