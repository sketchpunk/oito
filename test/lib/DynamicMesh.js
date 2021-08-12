import * as THREE  from "../../node_modules/three/build/three.module.js";

class DynamicMesh{
    mesh        = null;

    vertices    = [];
    indices     = [];
    normals     = [];
    texcoord    = [];

    _vertCount  = 0;
    _normCount  = 0;
    _idxCount   = 0;
    _texCount   = 0;

    constructor( mat=null ){
        this.mesh           = new THREE.Mesh();
        this.mesh.material  = mat || new THREE.MeshPhongMaterial( {color:0x00ffff, side:THREE.DoubleSide } );
    }

    rebuild( nGeo=null ){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( nGeo ){
            if( nGeo.vertices ) this.vertices   = nGeo.vertices;
            if( nGeo.indices )  this.indices    = nGeo.indices;
            if( nGeo.normals )  this.normals    = nGeo.normals;
            if( nGeo.texcoord ) this.texcoord   = nGeo.texcoord;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Geometry Buffers can't not be resized in ThreeJS
        // Note : Buffers themselves in WebGL can, just a limitation of the Framework.
        // Because of this, will need to recreate the Geometry Object if size is larger.
        if( this.vertices.length    > this._vertCount ||
            this.indices.length     > this._idxCount  ||
            this.normals.length     > this._normCount ||
            this.texcoord.length    > this._texCount ){
            
            this.mesh.geometry.dispose();
            this.mesh.geometry = null;
            this._mkGeo();

            return this;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let geo = this.mesh.geometry;

        geo.attributes.position.array.set( this.vertices );
        geo.attributes.position.needsUpdate = true;
        
        if( this.normals.length > 0 ){
            geo.attributes.normal.array.set( this.normals );
            geo.attributes.normal.needsUpdate = true;
        }

        if( this.texcoord.length > 0 ){
            geo.attributes.uv.array.set( this.texcoord );
            geo.attributes.uv.needsUpdate = true;
        }

        if( this.indices.length > 0 ){
            geo.index.array.set( this.indices );
            geo.index.needsUpdate = true;
            geo.setDrawRange( 0, this.indices.length );
        }else geo.setDrawRange( 0, this.vertices.length / 3 );

        geo.computeBoundingBox();
        geo.computeBoundingSphere();

        return this;
    }

    reset(){
        this.vertices.length    = 0;
        this.indices.length     = 0;
        this.normals.length     = 0;
        this.texcoord.length    = 0;
        return this;
    }

    _mkGeo(){
        //----------------------------------
        // Define Geometry Object
        const bGeo = new THREE.BufferGeometry();
        bGeo.setAttribute( "position",  new THREE.BufferAttribute( new Float32Array( this.vertices ), 3 ) );

        if( this.indices.length > 0 )   bGeo.setIndex( this.indices );
        if( this.normals.length > 0 )   bGeo.setAttribute( "normal", new THREE.BufferAttribute( new Float32Array( this.normals ), 3 ) );
        if( this.texcoord.length > 0 )  bGeo.setAttribute( "uv", new THREE.BufferAttribute( new Float32Array( this.texcoord ), 2 ) );

        this.mesh.geometry = bGeo;

        //----------------------------------
        if( this.vertices.length > this._vertCount )    this._vertCount     = this.vertices.length;
        if( this.indices.length > this._idxCount )      this._idxCount      = this.indices.length;
        if( this.normals.length > this._normCount )     this._normCount     = this.normals.length;
        if( this.texcoord.length > this._texCount )     this._texCount      = this.texcoord.length;
    }
}

export default DynamicMesh;