import Maths from "../Maths.js";
import Vec3 from "../Vec3.js";

class Util{

    // #region INDICES

    /** Generate Indices of both a Looped or Unlooped Grid, Backslash Pattern */
    static gridIndices( out: Array<number>, row_size: number, row_cnt: number, start_idx=0, do_loop=false, rev_quad=false ) : void{    
        const row_stop = ( do_loop )? row_cnt : row_cnt - 1,
              col_stop = row_size - 1;

        let row_a: number, row_b: number, 
            r: number, rr: number, 
            a: number, b: number, c: number, d: number;
    
        for( r=0; r < row_stop; r++ ){
            // Figure out the starting Index for the Two Rows
            // 2nd row might loop back to starting row when Looping.
            row_a = start_idx + row_size * r;
            row_b = start_idx + row_size * ( (r+1) % row_cnt );
    
            for( rr=0; rr < col_stop; rr++ ){
                // Defined the Vertex Index of a Quad
                a 	= row_a + rr;		
                b 	= row_a + rr + 1;
                d 	= row_b + rr;
                c 	= row_b + rr + 1;
    
                if( !rev_quad ) out.push( a,b,c, c,d,a ); // Counter ClockWise
                else 			out.push( a,d,c, c,b,a ); // ClockWise
            }
        }
    }

    /** Alternating Triangle Pattern, Front/Back Slash */
    static gridAltIndices( out: Array<number>, row_size: number, row_cnt: number, start_idx=0, rev_quad=false ): void{
        const row_stop = row_cnt - 1;
        const col_stop = row_size - 1;
        let x, y, a, b, c, d, bit;

        for( y=0; y < row_stop; y++ ){
            bit = y & 1; // Alternate the starting Quad Layout for every row 
    
            for( x=0; x < col_stop; x++ ){
                a   = start_idx + y * row_size + x;
                b   = a + row_size;
                c   = b + 1
                d   = a + 1;

                // Alternate the Quad Layout for each cell
                if( rev_quad ){
                    if( ( x & 1 ) == bit )	out.push( d, a, b, b, c, d ); // Front Slash
                    else					out.push( a, b, c, c, d, a ); // Back Slash
                }else{
                    if( ( x & 1 ) == bit )	out.push( d, c, b, b, a, d ); // Front Slash
                    else					out.push( a, d, c, c, b, a ); // Back Slash
                }
            }
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

    // #region VERTICES
	static arcVertices( out: Array<number>, angle_a: number, angle_b: number, div: number, radius=1, offset=[0,0,0] ): void{
		const inc = 1 / ( div - 1 );
		let x: number, y: number, t: number, angle: number;

		for( let i=0; i < div; i++ ){
			t		= i * inc;
			angle 	= angle_a * ( 1 - t ) + angle_b * t;
			x		= Math.cos( angle ) * radius;
			y		= Math.sin( angle ) * radius;
			out.push( x + offset[0], y + offset[1], offset[2] );
		}
	}

    static gridVertices( out: Array<number>, width=1, height=1, xCells=2, yCells=2, useCenter=false ): void{
        const   x_inc   = width / xCells,
                y_inc   = height / yCells;
        let     ox      = 0,
                oz      = 0,
                x, z, xi, yi;
    
        if( useCenter ){
            ox = -width * 0.5;
            oz = -height * 0.5;
        }
    
        for( yi=0; yi <= yCells; yi++ ){
            z = yi * y_inc;
            for( xi=0; xi <= xCells; xi++ ){
                x = xi * x_inc;
                out.push( x+ox, 0.0, z+oz );
            }
        }
    }

    /*
	static circleVertices( pnt_cnt=6, radius=1 ){
		let out = new Vec3Buffer( pnt_cnt ),
			x, y, t, angle;

		for( let i=0; i < pnt_cnt; i++ ){
			t		= i / pnt_cnt;
			angle 	= Math.PI * 2 * t;
			x		= Math.cos( angle ) * radius;
			y		= Math.sin( angle ) * radius;
			out.push_raw( x, y, 0 );
		}
		return out;
	}

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

    // #region UVs
    static gridTexcoord( out: Array<number>, xLen: number , yLen: number ): void{
        let x, y, yt;
        for( y=0; y <= yLen; y++ ){
            yt = 1 - ( y / yLen );
            for( x=0; x <= xLen; x++ ) out.push( x / xLen, yt );
        }
    }
    // #endregion ////////////////////////////////////////////////////////////////////////////////

    // #region OPERATIONS
    static lathe( base: Array<number>, out: Array<number>, steps=2, repeatStart=false, angleRng=Maths.PI_2, rotAxis="y" ) : void{
        const inc   = angleRng / steps;
        const v     = new Vec3();
        const len   = base.length;

        let i, j, angle, cos, sin;
        let rx = 0, ry = 0, rz = 0;

        for( i=0; i < steps; i++ ){
            angle   = i * inc;
            cos     = Math.cos( angle );
            sin     = Math.sin( angle );

            for( j=0; j < len; j+=3 ){
                v.fromBuf( base, j );

                switch( rotAxis ){ // https://www.siggraph.org/education/materials/HyperGraph/modeling/mod_tran/3drota.htm#Y-Axis%20Rotation
                    case "y": ry = v.y;		rx = v.z*sin + v.x*cos;		rz = v.z*cos - v.x*sin; break;
                    case "x": rx = v.x; 	ry = v.y*cos - v.z*sin;		rz = v.y*sin + v.z*cos; break;
                    case "z": rz = v.z;		rx = v.x*cos - v.y*sin;		ry = v.x*sin + v.y*cos; break;
                }

                out.push( rx, ry, rz );
            }
        }

        if( repeatStart ) out.push( ...base );
    }

    /*
    function rev_triangle_winding( idx ){
        let t;
        for( let i=0; i < idx.length; i+=3 ){
            t			= idx[ i ];
            idx[ i ]	= idx[ i+2 ];
            idx[ i+2 ]	= t;
        }
    }

	// Make a Mirror Copy of Points
	static mirror( flat_ary, x=1, y=-1, z=1 ){
		let out = new Array();

		for( let i=0; i < flat_ary.length; i+=3 ){
			out.push(
				flat_ary[ i ]	* x,
				flat_ary[ i+1 ]	* y,
				flat_ary[ i+2 ]	* z,
			);
		}

		return out;
    }
    // Create points between two points
	static line_lerp( a, b, steps, out=null ){
		out = out || new Array();

		let t, ti;
		for( let i=0; i <= steps; i++ ){
			t	= i / steps;
			ti	= 1 - t;
			out.push(
				a[ 0 ] * ti + b[ 0 ] * t,
				a[ 1 ] * ti + b[ 1 ] * t,
				a[ 2 ] * ti + b[ 2 ] * t,
			);
		}

		return out;
    }
    */
    // #endregion ////////////////////////////////////////////////////////////////////////////////

}


export default Util;