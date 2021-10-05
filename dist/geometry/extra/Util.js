import Maths from "../../Maths.js";
import Vec3 from "../../Vec3.js";
class Util {
    // #region GEN INDICES
    /** Generate Indices of both a Looped or Unlooped Grid, Backslash Pattern, Loops on Rows */
    static gridIndices(out, row_size, row_cnt, start_idx = 0, do_loop = false, rev_quad = false) {
        const row_stop = (do_loop) ? row_cnt : row_cnt - 1, col_stop = row_size - 1;
        let row_a, row_b, r, rr, a, b, c, d;
        for (r = 0; r < row_stop; r++) {
            // Figure out the starting Index for the Two Rows
            // 2nd row might loop back to starting row when Looping.
            row_a = start_idx + row_size * r;
            row_b = start_idx + row_size * ((r + 1) % row_cnt);
            for (rr = 0; rr < col_stop; rr++) {
                // Defined the Vertex Index of a Quad
                a = row_a + rr;
                b = row_a + rr + 1;
                d = row_b + rr;
                c = row_b + rr + 1;
                if (!rev_quad)
                    out.push(a, b, c, c, d, a); // Counter ClockWise
                else
                    out.push(a, d, c, c, b, a); // ClockWise
            }
        }
    }
    /** Generate Indices of both a Looped or Unlooped Grid, Backslash Pattern, Loops on Columns */
    static gridIndicesCol(out, row_size, row_cnt, start_idx = 0, do_loop = false, rev_quad = false) {
        const row_stop = row_cnt - 1, col_stop = (do_loop) ? row_size : row_size - 1;
        let row_a, row_b, r, rr, rrr, a, b, c, d;
        for (r = 0; r < row_stop; r++) {
            // Figure out the starting Index for the Two Rows
            // 2nd row might loop back to starting row when Looping.
            row_a = start_idx + row_size * r;
            row_b = start_idx + row_size * (r + 1);
            for (rr = 0; rr < col_stop; rr++) {
                // Defined the Vertex Index of a Quad
                rrr = (rr + 1) % row_size;
                a = row_a + rr;
                b = row_a + rrr;
                d = row_b + rr;
                c = row_b + rrr;
                if (!rev_quad)
                    out.push(a, b, c, c, d, a); // Counter ClockWise
                else
                    out.push(a, d, c, c, b, a); // ClockWise
            }
        }
    }
    /** Alternating Triangle Pattern, Front/Back Slash */
    static gridAltIndices(out, row_size, row_cnt, start_idx = 0, rev_quad = false) {
        const row_stop = row_cnt - 1;
        const col_stop = row_size - 1;
        let x, y, a, b, c, d, bit;
        for (y = 0; y < row_stop; y++) {
            bit = y & 1; // Alternate the starting Quad Layout for every row 
            for (x = 0; x < col_stop; x++) {
                a = start_idx + y * row_size + x;
                b = a + row_size;
                c = b + 1;
                d = a + 1;
                // Alternate the Quad Layout for each cell
                if (rev_quad) {
                    if ((x & 1) == bit)
                        out.push(d, a, b, b, c, d); // Front Slash
                    else
                        out.push(a, b, c, c, d, a); // Back Slash
                }
                else {
                    if ((x & 1) == bit)
                        out.push(d, c, b, b, a, d); // Front Slash
                    else
                        out.push(a, d, c, c, b, a); // Back Slash
                }
            }
        }
    }
    static fanIndices(out, midIdx, edgeStart, edgeEnd, rev_quad = false) {
        const len = (edgeEnd - edgeStart) + 1;
        let i, ii;
        for (i = 0; i < len; i++) {
            ii = (i + 1) % len; // Next Point on the edge
            if (!rev_quad)
                out.push(midIdx, edgeStart + i, edgeStart + ii); // Counter ClockWise
            else
                out.push(midIdx, edgeStart + ii, edgeStart + i); // ClockWise
        }
    }
    /*
    static fan_indices( c_idx, edge_ary, rev_quad=false, out=null ){
        out = out || new Array();

        let i, ii, len = edge_ary.length;
        for( i=0; i < len; i++ ){
            ii = ( i + 1 ) % len;	// Next Point on the edge

            if( !rev_quad )	out.push( c_idx, edge_ary[ i ],	edge_ary[ ii ] ); // Counter ClockWise
            else			out.push( c_idx, edge_ary[ ii ], edge_ary[ i ] ); // ClockWise
        }
        
        return out;
    }

    //Create index that will work for TRIANGLE_TRIP draw mode
    static gridTriangleStrip(indAry,rLen,cLen,isLoop=false,doClose=false){
        // isLoop :: ties the left to the right
        // doClose :: is for paths that are closed shapes like a square
        var iLen = (rLen-1) * cLen,		//How many indexes do we need
            iEnd = (cLen*(rLen-1))-1,	//What the final index for triangle strip
            iCol = cLen - 1,			//Index of Last col
            posA = 0,					//Top Index
            posB = posA + cLen,			//Bottom Index
            c = 0;						//Current Column : 0 to iCol
        for(var i=0; i < iLen; i++){
            c = i % cLen;
            indAry.push(posA+c,posB+c);
            //Create degenerate triangles, The last then the first index of the current bottom row.
            if(c == iCol){
                if(i == iEnd && isLoop == true){
                    if(doClose == true) indAry.push(posA,posB);
                    indAry.push(posB+cLen-1,posB);
                    iLen += cLen; //Make loop go overtime for one more row that connects the final row to the first.
                    posA += cLen;
                    posB = 0;
                }else if(i >= iEnd && doClose == true){
                    indAry.push(posA,posB);
                }else if(i < iEnd){ //if not the end, then skip to next row
                    if(doClose == true) indAry.push(posA,posB);
                    indAry.push(posB+cLen-1, posB);
                    posA += cLen;
                    posB += cLen;
                }
            }
        }
    }
    // Indices to stitch to endges together
    static edge_stitch_indices( edge_a, edge_b, rev_quad=false, out=null ){
        out = out || new Array();
            
        let a, b, c, d, i, ii, len = edge_a.length;

        for( i=0; i < len; i++ ){
            ii = (i + 1) % len;

            a = edge_a[ i ];
            b = edge_a[ ii ];
            c = edge_b[ ii ];
            d = edge_b[ i ];

            if( !rev_quad )	out.push( a, b, c, c, d, a ); // Counter-ClockWise
            else			out.push( a, d, c, c, b, a ); // ClockWise
        }
        return out;
    }
    */
    // #endregion ////////////////////////////////////////////////////////////////////////////////
    // #region GEN VERTICES
    static arcVertices(out, angle_a, angle_b, div, radius = 1, offset = [0, 0, 0]) {
        const inc = 1 / (div - 1);
        let x, y, t, angle;
        for (let i = 0; i < div; i++) {
            t = i * inc;
            angle = angle_a * (1 - t) + angle_b * t;
            x = Math.cos(angle) * radius;
            y = Math.sin(angle) * radius;
            out.push(x + offset[0], y + offset[1], offset[2]);
        }
    }
    static gridVertices(out, width = 1, height = 1, xCells = 2, yCells = 2, useCenter = false) {
        const x_inc = width / xCells, y_inc = height / yCells;
        let ox = 0, oz = 0, x, z, xi, yi;
        if (useCenter) {
            ox = -width * 0.5;
            oz = -height * 0.5;
        }
        for (yi = 0; yi <= yCells; yi++) {
            z = yi * y_inc;
            for (xi = 0; xi <= xCells; xi++) {
                x = xi * x_inc;
                out.push(x + ox, 0.0, z + oz);
            }
        }
    }
    static circleVertices(out, pntCnt = 6, radius = 1) {
        let t, angle;
        for (let i = 0; i < pntCnt; i++) {
            t = i / pntCnt;
            angle = Maths.PI_2 * t;
            out.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        }
    }
    /*
    static square_vertices( out, idx, x_div=1, y_div=1, w=1, h=1, y_pos=0 ){
        let x_inc		= w / x_div,
            y_inc		= h / y_div,
            x			= w / 2,
            y			= h / 2,
            i;

        let put = ( x, z )=>{ out[ idx++ ] = x;  out[ idx++ ] = y_pos;  out[ idx++ ] = z; }
        for(i=0; i <= y_div; i++)	put( -x, -y + i* y_inc );	// Left
        for(i=1; i <= x_div; i++)	put( -x + i* x_inc, y );	// Bottom
        for(i=1; i <= y_div; i++)	put( x, y - i* y_inc );		// Right
        for(i=1; i <  x_div; i++)	put( x - i* x_inc, -y );	// Top
    }
    */
    // #endregion ////////////////////////////////////////////////////////////////////////////////
    // #region GEN UVs
    static gridTexcoord(out, xLen, yLen) {
        let x, y, yt;
        for (y = 0; y <= yLen; y++) {
            yt = 1 - (y / yLen);
            for (x = 0; x <= xLen; x++)
                out.push(x / xLen, yt);
        }
    }
    // #endregion ////////////////////////////////////////////////////////////////////////////////
    // #region OPERATIONS
    /** Create a new TGeo Type Struct */
    static newGeo() { return { vertices: [], normals: [], indices: [], texcoord: [] }; }
    /** Duplicate a set of vertices while rotating them around an axis */
    static lathe(base, out, steps = 2, repeatStart = false, angleRng = Maths.PI_2, rotAxis = "y") {
        const inc = angleRng / steps;
        const v = new Vec3();
        const len = base.length;
        let i, j, angle, cos, sin;
        let rx = 0, ry = 0, rz = 0;
        for (i = 0; i < steps; i++) {
            angle = i * inc;
            cos = Math.cos(angle);
            sin = Math.sin(angle);
            for (j = 0; j < len; j += 3) {
                v.fromBuf(base, j);
                switch (rotAxis) { // https://www.siggraph.org/education/materials/HyperGraph/modeling/mod_tran/3drota.htm#Y-Axis%20Rotation
                    case "y":
                        ry = v.y;
                        rx = v.z * sin + v.x * cos;
                        rz = v.z * cos - v.x * sin;
                        break;
                    case "x":
                        rx = v.x;
                        ry = v.y * cos - v.z * sin;
                        rz = v.y * sin + v.z * cos;
                        break;
                    case "z":
                        rz = v.z;
                        rx = v.x * cos - v.y * sin;
                        ry = v.x * sin + v.y * cos;
                        break;
                }
                out.push(rx, ry, rz);
            }
        }
        if (repeatStart)
            out.push(...base);
    }
    /** SubDivide the 3 points of a triangle and save the results in a TGeo */
    static subDivideTriangle(out, a, b, c, div) {
        const irow = [[0]]; // Index of each vert per rowl
        const seg_a = new Vec3(); // Lerping
        const seg_b = new Vec3();
        const seg_c = new Vec3();
        let i, j, t, row, idx = 1; // Running Vertex Index Count
        out.vertices.push(a[0], a[1], a[2]); // Add First Point
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create new Vertices
        for (i = 1; i <= div; i++) {
            t = i / div; // Get Lerp T
            seg_b.fromLerp(a, b, t); // Get Position of two sides of the triangle.
            seg_c.fromLerp(a, c, t);
            row = [idx++]; // Start New Row index Array
            out.vertices.push(seg_b[0], seg_b[1], seg_b[2]); // Add First Point in the Row
            // Loop the Remaining Points of the row
            for (j = 1; j < i; j++) {
                t = j / i;
                seg_a.fromLerp(seg_b, seg_c, t);
                row.push(idx++);
                out.vertices.push(seg_a[0], seg_a[1], seg_a[2]);
            }
            // Add Last row point
            row.push(idx++);
            out.vertices.push(seg_c[0], seg_c[1], seg_c[2]);
            // Save Row indexes for later.
            irow.push(row);
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create Indices
        let ra, rb;
        for (i = 1; i < irow.length; i++) {
            ra = irow[i - 1]; // top Row
            rb = irow[i]; // bottom row
            // Create Quads if possible else just a triangle
            for (j = 0; j < ra.length; j++) {
                out.indices.push(rb[j], rb[j + 1], ra[j]);
                if (j + 1 < ra.length)
                    out.indices.push(ra[j], rb[j + 1], ra[j + 1]);
            }
        }
    }
    /** Compute normals for all the vertices in a TGeo */
    static appendTriangleNormals(geo) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Make sure there is enough space to for normals for each vertex
        // if not, append extra space to normals.
        let i;
        const iAry = geo.indices;
        const vAry = geo.vertices;
        const nAry = geo.normals;
        const vCnt = vAry.length;
        const nCnt = nAry.length;
        if (vCnt > nCnt) {
            for (i = nCnt; i < vCnt; i++)
                nAry.push(0);
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Accumlate the normal direction for each vertex.
        const a = new Vec3();
        const b = new Vec3();
        const c = new Vec3();
        const n = new Vec3();
        const aSeg = new Vec3();
        const bSeg = new Vec3();
        const cSeg = new Vec3();
        let ai, bi, ci;
        for (i = 0; i < geo.indices.length; i += 3) {
            // Flat Vertex Index from Indices for each triangel face.
            ai = 3 * iAry[i];
            bi = 3 * iAry[i + 1];
            ci = 3 * iAry[i + 2];
            // Grab the vertex position
            a.fromBuf(vAry, ai);
            b.fromBuf(vAry, bi);
            c.fromBuf(vAry, ci);
            // Get two side of a triangle and cross product to get face direction
            bSeg.fromSub(b, a);
            cSeg.fromSub(c, a);
            aSeg.fromCross(bSeg, cSeg);
            // Add new normal to the old ones for each point in triangle.
            n.fromBuf(nAry, ai).add(aSeg).toBuf(nAry, ai);
            n.fromBuf(nAry, bi).add(aSeg).toBuf(nAry, bi);
            n.fromBuf(nAry, ci).add(aSeg).toBuf(nAry, ci);
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Average Out All Normal Values by normalizing it
        for (i = 0; i < nAry.length; i += 3) {
            n.fromBuf(nAry, i).norm().toBuf(nAry, i);
        }
    }
    /** Flip the winding of the triangles inside of an indices array */
    static reverseWinding(iAry) {
        let t, ii;
        for (let i = 0; i < iAry.length; i += 3) {
            ii = i + 2;
            t = iAry[i];
            iAry[i] = iAry[ii];
            iAry[ii] = t;
        }
    }
    static normalizeScaleVertices(geo, scl = 1, updateNormals = false) {
        const vAry = geo.vertices;
        const nAry = geo.normals;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const vCnt = vAry.length;
        const nCnt = nAry.length;
        if (vCnt > nCnt) {
            for (let i = nCnt; i < vCnt; i++)
                nAry.push(0);
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const v = new Vec3();
        for (let i = 0; i < vAry.length; i += 3) {
            v.fromBuf(vAry, i).norm();
            if (updateNormals)
                v.toBuf(nAry, i);
            v.scale(scl).toBuf(vAry, i);
        }
    }
}
/*
    static area( contour ) {

        const n = contour.length;
        let a = 0.0;

        for ( let p = n - 1, q = 0; q < n; p = q ++ ) {

            a += contour[ p ].x * contour[ q ].y - contour[ q ].x * contour[ p ].y;

        }

        return a * 0.5;

    }

    static isClockWise( pts ) {

        return ShapeUtils.area( pts ) < 0;

    }
*/
export default Util;
