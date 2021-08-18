import * as THREE from "../../node_modules/three/build/three.module.js";
import Gltf 	  from "./Gltf.js";

class GltfUtil{

	//#region FETCHING FILES
    static async fetch_files( path ){
        return Promise.all([
            fetch( path + ".gltf" ).then( r=>r.json() ),
            fetch( path + ".bin" ).then( r=>r.arrayBuffer() ),
        ])
    }
    //#endregion /////////////////////////////////////////////////


    //#region PULLING DATA 
    static pull_meshes( json, bin, mat=null, mesh_names=null ){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Load all meshes in file
        if( !mesh_names ){
            mesh_names = new Array();
            for( let i=0; i < json.meshes.length; i++ ) mesh_names.push( json.meshes[i].name );
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Mesh can be made up of sub-meshes, So need to loop through em.
        let n, g, geo_ary, list = [];
        
        for( n of mesh_names ){
            geo_ary = Gltf.get_mesh( n, json, bin, true ); // Load Type Arrays

            for( g of geo_ary ) list.push( this.mk_geo_mesh( g, mat ) );
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Return mesh Or if multiple, a Group of Meshes.
        if( list.length == 1 ) return list[0];

        let rtn = new THREE.Group();
        for( g of list ) rtn.add( g );

        return rtn;
    }

    static pull_geo( json, bin, mesh_names=null ){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Load all meshes in file
        if( !mesh_names ){
            mesh_names = new Array();
            for( let i=0; i < json.meshes.length; i++ ) mesh_names.push( json.meshes[i].name );
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Mesh can be made up of sub-meshes, So need to loop through them.
        let n, g, geo_ary, list = [];
        
        for( n of mesh_names ){
            geo_ary = Gltf.get_mesh( n, json, bin, true ); // Load Type Arrays

            for( g of geo_ary ) list.push( this.mk_geo( g ) );
        }

        return list;
    }
    //#endregion /////////////////////////////////////////////////
 

    //#region THREE.JS 
	// Create Geometry Buffers
	static mk_geo( g ){
		let geo = new THREE.BufferGeometry();
		geo.setAttribute( "position", new THREE.BufferAttribute( g.vertices.data, g.vertices.component_len ) );

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		if( g.indices ) geo.setIndex( new THREE.BufferAttribute( g.indices.data, 1 ) );
		if( g.normal )  geo.setAttribute( "normal", new THREE.BufferAttribute( g.normal.data, g.normal.component_len ) );
		if( g.uv )      geo.setAttribute( "uv", new THREE.BufferAttribute( g.uv.data, g.uv.component_len ) );

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		geo.name = g.name;
		return geo;
	}

	// Make a Mesh & Geometry Buffers
	static mk_geo_mesh( g, mat ){
        let geo = this.mk_geo( g );
        let m   = new THREE.Mesh( geo, mat );
        m.name  = g.name;
		return m;
	}
    //#endregion /////////////////////////////////////////////////
}

export default GltfUtil;
export { Gltf };