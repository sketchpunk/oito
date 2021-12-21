//#region INPUT
import * as THREE from 'three';
//#endregion

class DynPointMesh extends THREE.Points{
    //#region MAIN
    _defaultSize    = 6;
    _defaultColor   = 0x00ff00;
    _cnt            = 0;
    _verts          = [];
    _color          = [];
    _dirty          = false;

    constructor( initSize = 20 ){
        super( 
            _newPointsMeshGeometry( new Float32Array( initSize * 3 ), new Float32Array( initSize * 4 ), false ),
            newPointMeshMaterial() //new THREE.PointsMaterial( { color: 0xffffff, size:8, sizeAttenuation:false } )
        );

        this.geometry.setDrawRange( 0, 0 );
        this.onBeforeRender = ()=>{ if( this._dirty ) this._updateGeometry(); }
    }
    //#endregion

    //#region METHODS
    reset(){
		this._cnt           = 0;
		this._verts.length  = 0;
        this._color.length  = 0;
        this.geometry.setDrawRange( 0, 0 );
		return this;
    }

    add( pos, color = this._defaultColor, size = this._defaultSize ){
        this._verts.push( pos[0], pos[1], pos[2] );
        this._color.push( ...glColor( color ), size );
        this._cnt++;
        this._dirty = true;
        return this;
    }

    setColorAt( idx, color ){
        const c = glColor( color );
        idx    *= 4;

        this._color[ idx     ] = c[ 0 ];
        this._color[ idx + 1 ] = c[ 1 ];
        this._color[ idx + 2 ] = c[ 2 ];
        this._dirty            = true;
        return this;
    }

    setPosAt( idx, pos ){
        idx    *= 3;
        this._verts[ idx     ] = pos[ 0 ];
        this._verts[ idx + 1 ] = pos[ 1 ];
        this._verts[ idx + 2 ] = pos[ 2 ];
        this._dirty            = true;
        return this;
    }

    getPosAt( idx ){
        idx    *= 3;
        return [
            this._verts[ idx + 0 ],
            this._verts[ idx + 1 ],
            this._verts[ idx + 2 ],
        ];
    }
    
    //#endregion

    //#region PRIVATE METHODS
    _updateGeometry(){
        const geo       = this.geometry;
        const bVerts    = geo.attributes.position;
        const bColor    = geo.attributes.color;     //this.geometry.index;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( this._verts.length > bVerts.array.length || 
            this._color.length > bColor.array.length
        ){
            if( this.geometry ) this.geometry.dispose();
            this.geometry   = _newPointsMeshGeometry( this._verts, this._color );
            this._dirty     = false;
            return;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        bVerts.array.set( this._verts );
        bVerts.count       = this._verts.length / 3;
        bVerts.needsUpdate = true;

        bColor.array.set( this._color );
        bColor.count       = this._color.length / 4;
        bColor.needsUpdate = true;

        geo.setDrawRange( 0, bVerts.count );
        geo.computeBoundingBox();
        geo.computeBoundingSphere();
        
        this._dirty = false;
    }
    //#endregion
}

//#region SUPPORT 
function _newPointsMeshGeometry( aVerts, aColor, doCompute=true ){
    //if( !( aVerts instanceof Float32Array) ) aVerts = new Float32Array( aVerts );
    //if( !( aColor instanceof Float32Array) ) aColor = new Float32Array( aColor );

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const bVerts    = new THREE.Float32BufferAttribute( aVerts, 3 );
    const bColor    = new THREE.Float32BufferAttribute( aColor, 4 );   // Color + Size
    bVerts.setUsage( THREE.DynamicDrawUsage );
    bColor.setUsage( THREE.DynamicDrawUsage );

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const geo = new THREE.BufferGeometry();
    geo.setAttribute( 'position', bVerts );
    geo.setAttribute( 'color', bColor );

    if( doCompute ){
        geo.computeBoundingSphere();
        geo.computeBoundingBox();
    }
    return geo;
}

function glColor( hex, out = null ){
    const NORMALIZE_RGB = 1 / 255;
    out = out || [0,0,0];

    out[0] = ( hex >> 16 & 255 ) * NORMALIZE_RGB;
    out[1] = ( hex >> 8 & 255 )  * NORMALIZE_RGB;
    out[2] = ( hex & 255 )       * NORMALIZE_RGB;

    return out;
}
//#endregion

//#region SHADER

function newPointMeshMaterial(){
    return new THREE.RawShaderMaterial({
    uniforms        :{},
    vertexShader    : `#version 300 es
    in	vec3	position;
    in	vec4	color;
    
    uniform 	mat4	modelViewMatrix;
    uniform 	mat4	projectionMatrix;
    out 	    vec3	fragColor;
    
    void main(){
        vec4 wPos 	        = modelViewMatrix * vec4( position.xyz, 1.0 );
        fragColor			= color.rgb;
        gl_Position			= projectionMatrix * wPos;
        gl_PointSize		= color.w; //position.w * ( u_scale / -wPos.z );
    }`,
    fragmentShader  : `#version 300 es
    precision mediump float;
    in		vec3		fragColor;
    out		vec4		outColor;
    void main(){ outColor = vec4( fragColor, 1.0 ); }
    `});
}

//#endregion

export default DynPointMesh;