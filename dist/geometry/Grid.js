import Util from "./Util.js";
class Grid {
    static get(width = 1, height = 1, xCells = 2, yCells = 2, fromCenter = true) {
        const rtn = {
            vertices: [],
            indices: [],
            texcoord: [],
            normals: [],
        };
        Util.gridVertices(rtn.vertices, width, height, xCells, yCells, fromCenter);
        Util.gridIndices(rtn.indices, xCells + 1, yCells + 1, 0, false, true);
        Util.gridTexcoord(rtn.texcoord, xCells + 1, yCells + 1);
        repeatVec(rtn.normals, rtn.vertices.length / 3, 0, 1, 0);
        return rtn;
    }
    static getAlt(width = 1, height = 1, xCells = 2, yCells = 2, fromCenter = true) {
        const rtn = {
            vertices: [],
            indices: [],
            texcoord: [],
            normals: [],
        };
        Util.gridVertices(rtn.vertices, width, height, xCells, yCells, fromCenter);
        Util.gridAltIndices(rtn.indices, xCells + 1, yCells + 1, 0, true);
        Util.gridTexcoord(rtn.texcoord, xCells + 1, yCells + 1);
        repeatVec(rtn.normals, rtn.vertices.length / 3, 0, 1, 0);
        return rtn;
    }
}
function repeatVec(out, cnt, x, y, z) {
    for (let i = 0; i < cnt; i++)
        out.push(x, y, z);
}
/*
static mkVerts( geo, w=1, h=1, x_cells=2, y_cells=2, center_offset=false ){
    let vert	= geo.getVertices(),
        x_inc   = w / x_cells,
        y_inc   = h / y_cells,
        v       = new Vec3(),
        vv      = new Vec3(),
        offset  = [0,0,0],
        xx, yy;

    if( center_offset ){
        offset[ 0 ] = -w * 0.5;
        offset[ 2 ] = -h * 0.5;
    }

    for( yy=0; yy <= y_cells; yy++ ){
        v.z = yy * y_inc;

        for( xx=0; xx <= x_cells; xx++ ){
            v.x = xx * x_inc;  //App.Debug.pnt( v );
            vv.from_add( v, offset ).push_to( vert );
        }
    }
}

static grid_tri_idx( x_cells, y_cells ){
    let ary     = new Array(),
        col_cnt = x_cells + 1,
        x, y, a, b, c, d;

    for( y=0; y < y_cells; y++ ){
        for( x=0; x < x_cells; x++ ){
            a   = y * col_cnt + x;
            b   = a + col_cnt;
            c   = b + 1
            d   = a + 1;
            ary.push( a, b, c, c, d, a );
        }
    }

    return new Uint16Array( ary );
}

static AltIndices( geo, x_cells, y_cells ){
    let ary     = geo.getIndices(),
        col_cnt = x_cells + 1,
        x, y, a, b, c, d, bit;

    for( y=0; y < y_cells; y++ ){
        bit = y & 1; // Alternate the starting Quad Layout for every row

        for( x=0; x < x_cells; x++ ){
            a   = y * col_cnt + x;
            b   = a + col_cnt;
            c   = b + 1
            d   = a + 1;
            // Alternate the Quad Layout for each cell
            if( ( x & 1 ) == bit )	ary.push( d, a, b, b, c, d ); // Front Slash
            else					ary.push( a, b, c, c, d, a ); // Back Slash
        }
    }
}

*/
export default Grid;
