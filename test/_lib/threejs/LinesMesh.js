import * as THREE from './three.module.js';

//################################################################################

const DASH_SEG = 1 / 0.07;
const DASH_DIV = 0.4;

class LinesMesh{

    constructor( maxLen=100, name="lines" ){
        this.cnt        = 0;	// How many items are in the buffer.
        this.use_size   = 10;	// Default size to use
        this.use_shape  = 1;	// Default Shape to use

        this.buf_pos    = null; // Interleaved Data : XYZ - Position, W - Distance
        this.buf_cls    = null; // Color Data
        this.geo        = null; // Geometry Buffer, Holds Shader Attributes
        this.mesh       = null; // Renderable Mesh Object

        this._init( maxLen, name );
    }

    _init( maxLen=100, name="lines" ){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // BUFFERS
        this.buf_pos = new THREE.BufferAttribute( new Float32Array( maxLen * 4 * 2 ), 4 ); // 2 Points Per Line
        this.buf_pos.setUsage( THREE.DynamicDrawUsage );

        this.buf_clr = new THREE.BufferAttribute( new Float32Array( maxLen * 3 * 2 ), 3 );
        this.buf_clr.setUsage( THREE.DynamicDrawUsage );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // GEOMETRY
        this.geo = new THREE.BufferGeometry();
        this.geo.setAttribute( "position",	this.buf_pos );
        this.geo.setAttribute( "color",		this.buf_clr );
        this.geo.setDrawRange( 0, 0 );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // MESH
        this.mesh = new THREE.LineSegments( this.geo, get_material() ); 
        this.mesh.name = name;

        return this;
    }

    add( p0, p1, hex_0=0xff0000, hex_1=null, is_dash=false ){
        if( Array.isArray( p0 ) || p0 instanceof Float32Array  )
            this.addRaw( p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], hex_0, hex_1, is_dash );
        else if( p0 instanceof THREE.Vector3 )
            this.addRaw( p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, hex_0, hex_1, is_dash );

        this.geo.needsUpdate = true;
        return this;
    }

    addRaw( x0, y0, z0, x1, y1, z1, hex_0=0xff0000, hex_1=null, is_dash=false ){
        let idx 	= this.cnt * 2,
            len_0	= -1,
            len_1	= -1;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // VERTEX POSITION - LEN
        if( is_dash ){
            len_0 = 0;
            len_1 = Math.sqrt(
                (x1 - x0) ** 2 +
                (y1 - y0) ** 2 +
                (z1 - z0) ** 2
            );
        }

        this.buf_pos.setXYZW( idx,   x0, y0, z0, len_0 );
        this.buf_pos.setXYZW( idx+1, x1, y1, z1, len_1 );
        this.buf_pos.needsUpdate = true;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // VERTEX COLOR
        let c0 = gl_color( hex_0 );
        let c1 = ( hex_1 != null )? gl_color( hex_1 ) : c0;

        this.buf_clr.setXYZ( idx, c0[0], c0[1], c0[2] );
        this.buf_clr.setXYZ( idx+1, c1[0], c1[1], c1[2] );
        this.buf_clr.needsUpdate = true;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // INCREMENT AND UPDATE DRAW RANGE
        this.cnt++;
        this.geo.setDrawRange( 0, this.cnt * 2 );
        this.geo.needsUpdate = true;

        return this;
    }

	box( v0, v1, col=0x00ffff, is_dash=false ){
		const x1 = v0[0], y1 = v0[1], z1 = v0[2], 
			  x2 = v1[0], y2 = v1[1], z2 = v1[2];

		this.add( [x1,y1,z1], [x1,y1,z2], col, null, is_dash ); // Bottom
		this.add( [x1,y1,z2], [x2,y1,z2], col, null, is_dash );
		this.add( [x2,y1,z2], [x2,y1,z1], col, null, is_dash );
		this.add( [x2,y1,z1], [x1,y1,z1], col, null, is_dash );
		this.add( [x1,y2,z1], [x1,y2,z2], col, null, is_dash ); // Top
		this.add( [x1,y2,z2], [x2,y2,z2], col, null, is_dash );
		this.add( [x2,y2,z2], [x2,y2,z1], col, null, is_dash );
		this.add( [x2,y2,z1], [x1,y2,z1], col, null, is_dash );
		this.add( [x1,y1,z1], [x1,y2,z1], col, null, is_dash ); // Sides
		this.add( [x1,y1,z2], [x1,y2,z2], col, null, is_dash );
		this.add( [x2,y1,z2], [x2,y2,z2], col, null, is_dash );
		this.add( [x2,y1,z1], [x2,y2,z1], col, null, is_dash );
		return this;
	}


    reset(){
        this.cnt = 0;
        this.geo.setDrawRange( 0, 0 );
        this.geo.needsUpdate = true;
        return this;
    }
}

//################################################################################
// #region SHADER
let gMat = null;
function get_material(){
    if( gMat ) return gMat;

    gMat = new THREE.RawShaderMaterial( {
        depthTest       : false,
        vertexShader    : vert_src, 
        fragmentShader  : frag_src, 
        transparent     : true, 
        uniforms        : { 
            dash_seg : { value : DASH_SEG },
            dash_div : { value : DASH_DIV },
        }
    } );

    return gMat;
}

const vert_src = `#version 300 es
in	vec4	position;
in	vec3	color;

uniform 	mat4	modelViewMatrix;
uniform 	mat4	projectionMatrix;

out vec3	frag_color;
out float	frag_len;

void main(){
    vec4 ws_position 	= modelViewMatrix * vec4( position.xyz, 1.0 );
    frag_color			= color;
    frag_len			= position.w;
    gl_Position			= projectionMatrix * ws_position;	
}`;

const frag_src = `#version 300 es
precision mediump float;

uniform float dash_seg;
uniform float dash_div;

in vec3		frag_color;
in float	frag_len;

out	vec4	out_color;

void main(){
    float alpha = 1.0;
    if( frag_len >= 0.0 ) alpha = step( dash_div, fract( frag_len * dash_seg ) );
    out_color = vec4( frag_color, alpha );
}`;

// #endregion

//################################################################################

function gl_color( hex, out = null ){
    const NORMALIZE_RGB = 1 / 255;
    out = out || [0,0,0];

    out[0] = ( hex >> 16 & 255 ) * NORMALIZE_RGB;
    out[1] = ( hex >> 8 & 255 )  * NORMALIZE_RGB;
    out[2] = ( hex & 255 )       * NORMALIZE_RGB;

    return out;
}

//################################################################################
export default LinesMesh;