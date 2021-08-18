
class Gltf{
	// #region HELPERS
	//https://github.com/KhronosGroup/glTF-Tutorials/blob/master/gltfTutorial/gltfTutorial_005_BuffersBufferViewsAccessors.md
	static parse_accessor( idx, json, bin, inc_data=true ){
		let access		= json.accessors[ idx ],					// Reference to Accessor JSON Element
			buf_view 	= json.bufferViews[ access.bufferView ],	// Buffer Information
			comp_len	= Gltf[ "COMP_" + access.type ],			// Component Length for Data Element
			data_type, tsize;
	
		

		if( buf_view.byteStride ){
			console.error( "UNSUPPORTED - Parsing Stride Buffer " );
			return null;
		}
	
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		switch( access.componentType ){
			case Gltf.TYPE_FLOAT:			data_type = "float";	tsize = 4; break;
			case Gltf.TYPE_SHORT:			data_type = "int16";	tsize = 2; break;
			case Gltf.TYPE_UNSIGNED_SHORT:	data_type = "uint16";	tsize = 2; break;
			case Gltf.TYPE_UNSIGNED_INT:	data_type = "uint32";	tsize = 4; break;
			case Gltf.TYPE_UNSIGNED_BYTE: 	data_type = "uint8";	tsize = 1; break;
			default: console.error( "ERROR processAccessor - componentType unknown : %s", access.componentType ); return null; break;
		}
	
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		let out = { 
			min 			: access.min,
			max 			: access.max,
			element_cnt		: access.count,
			component_len	: comp_len,
			data_type		: data_type,
			byte_offset		: ( access.byteOffset || 0 ) + ( buf_view.byteOffset || 0 ),
			byte_size		: access.count * comp_len * tsize,
		};
	
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		if( inc_data ){
			let size = access.count * comp_len; ; // ElementCount * ComponentLength
			switch( access.componentType ){
				case Gltf.TYPE_FLOAT:			out.data = new Float32Array( bin, out.byte_offset, size ); break;
				case Gltf.TYPE_SHORT:			out.data = new Int16Array( bin, out.byte_offset, size ); break;
				case Gltf.TYPE_UNSIGNED_SHORT:	out.data = new Uint16Array( bin, out.byte_offset, size ); break;
				case Gltf.TYPE_UNSIGNED_INT:	out.data = new Uint32Array( bin, out.byte_offset, size ); break;
				case Gltf.TYPE_UNSIGNED_BYTE: 	out.data = new Uint8Array( bin, out.byte_offset, size ); break;
			}				
		}
		
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		return out
	}
	// #endregion /////////////////////////////////////////////////////////////////////////

	// #region MESHES
	static get_mesh( name, json, bin, inc_data=false ){
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Search for Mesh Name
		let i, mesh = null, mesh_idx=0;
		for( i=0; i < json.meshes.length; i++ ){
			if( json.meshes[i].name == name ){
				mesh		= json.meshes[ i ];
				mesh_idx	= i;
				break;
			}
		}
		if( !mesh ){ console.log( "Unable to find mesh by the nane : %s", name ); return null; }
	
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Find if there is any nodes using the mesh.
		let n, node = null;
		for( n of json.nodes ){
			if( n.mesh == mesh_idx ){ node = n; break; }
		}
	
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		let prim, attr, itm,
			prim_len	= mesh.primitives.length,
			ary			= new Array();
	
		//console.log( mesh );
		for( prim of mesh.primitives ){
			//-------------------------------------------
			attr	= prim.attributes;
			itm		= {
				name		: name + (( prim_len != 1 )? "_p" + i : ""),
				draw_mode 	: ( prim.mode != undefined )? prim.mode : Gltf.MODE_TRIANGLES,
			};
	
			//-------------------------------------------
			// Save Position, Rotation and Scale if Available.
			if( node ){
				if( node.translation )	itm.position	= node.translation.slice( 0 );
				if( node.rotation )		itm.rotation	= node.rotation.slice( 0 );
				if( node.scale )		itm.scale		= node.scale.slice( 0 );
			}

			//-------------------------------------------
			// Get Primitive
			itm.vertices = this.parse_accessor( attr.POSITION, json, bin, inc_data );
			if( prim.indices != undefined ) itm.indices	= this.parse_accessor( prim.indices,	json, bin, inc_data );
			if( attr.NORMAL )		itm.normal	= this.parse_accessor( attr.NORMAL,		json, bin, inc_data );
			if( attr.TEXCOORD_0 )	itm.uv		= this.parse_accessor( attr.TEXCOORD_0,	json, bin, inc_data );
			if( attr.WEIGHTS_0 )	itm.weights	= this.parse_accessor( attr.WEIGHTS_0,	json, bin, inc_data ); 
			if( attr.JOINTS_0 )		itm.joints	= this.parse_accessor( attr.JOINTS_0,	json, bin, inc_data );
			if( attr.COLOR_0 )		itm.color	= this.parse_accessor( attr.COLOR_0,	json, bin, inc_data );
	
			ary.push( itm )
		}
	
		return ary;
	}
	// #endregion /////////////////////////////////////////////////////////////////////////

	// #region SKIN
	// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
	// https://github.com/KhronosGroup/glTF-Tutorials/blob/master/gltfTutorial/gltfTutorial_020_Skins.md
			
	// This one uses the Inverted Bind Matrices in the bin file then converts
	// to local space transforms
	// Node: Latest version of Blender Can Make the BindPose Data incorrect
	// If there is a transform applied to the Armature Node.
	static get_skin( json, bin, name=null, node_info=null ){
		if( !json.skins ){
			console.error( "There is no skin in the GLTF file." );
			return null;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Skin Checking
		let ji, skin = null;
		if( name != null ){
			for( ji of json.skins ) if( ji.name == name ){ skin = ji; break; }
			if( !skin ){ console.error( "skin not found", name ); return null; }
		}else{
			// Not requesting one, Use the first one available
			for( ji of json.skins ){ 
				skin = ji;
				name = ji.name; // Need name to fill in node_info
				break;
			}
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Create Bone Items
		let boneCnt = skin.joints.length,
			bones 	= new Array(boneCnt),
			n2j 	= {},			// Lookup table to link Parent-Child (Node Idx to Joint Idx) Key:NodeIdx, Value:JointIdx
			n, 						// Node
			ni, 					// Node Index
			itm;					// Bone Item

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Create Bone Array and Loopup Table.
		for(ji=0; ji < boneCnt; ji++ ){
			ni				= skin.joints[ ji ];
			n2j[ "n"+ni ] 	= ji;

			bones[ ji ] = {
				idx : ji, p_idx : null, lvl : 0, name : null,
				pos : null, rot : null, scl : null };
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Get Bone's name and set it's parent index value
		for( ji=0; ji < boneCnt; ji++){
			n				= json.nodes[ skin.joints[ ji ] ];
			itm 			= bones[ ji ];
			
			// Each Bone Needs a Name, create one if one does not exist.
			if( n.name === undefined || n.name == "" )	itm.name = "bone_" + ji;
			else{
				itm.name = n.name.replace("mixamorig:", "");
			} 										

			// Set Children who the parent is.
			if( n.children && n.children.length > 0 ){
				for( ni of n.children ) bones[ n2j["n"+ni] ].p_idx = ji;
			}
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Set the Hierarchy Level for each bone
		let lvl;
		for( ji=0; ji < boneCnt; ji++){
			// Check for Root Bones
			itm = bones[ ji ];
			if( itm.p_idx == null ){ itm.lvl = 0; continue; }

			// Traverse up the tree to count how far down the bone is
			lvl = 0;
			while( itm.p_idx != null ){ lvl++; itm = bones[ itm.p_idx ]; }

			bones[ ji ].lvl = lvl;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Get Parent Node Transform, Node with the same name as the armature.
		if( node_info ){
			for( ji of json.nodes ){ 
				if( ji.name == name ){ 
					if( ji.rotation )	node_info["rot"] = ji.rotation;
					if( ji.scale )		node_info["scl"] = ji.scale;
					if( ji.position )	node_info["pos"] = ji.position;
					break;
				}
			}
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Bind Pose from Inverted Model Space Matrices
		let bind		= Gltf.parse_accessor( skin.inverseBindMatrices, json, bin ),
			m0			= new Mat4(),
			m1			= new Mat4(),
			near_one	= ( v )=>{	// Need to cleanup scale, ex: 0.9999 is pretty much 1
				if(1 - Math.abs(v[0]) <= 1e-4) v[0] = 1;
				if(1 - Math.abs(v[1]) <= 1e-4) v[1] = 1;
				if(1 - Math.abs(v[2]) <= 1e-4) v[2] = 1;
				return v;
			};

		for( ji=0; ji < boneCnt; ji++ ){
			itm = bones[ ji ];

			// If no parent bone, The inverse is enough
			if( itm.p_idx == null ){
				m1.copy( bind.data, ji * 16 ).invert();

			// if parent exists, keep it parent inverted since thats how it exists in gltf
			// BUT invert the child bone then multiple to get local space matrix.
			// parent_worldspace_mat4_invert * child_worldspace_mat4 = child_localspace_mat4
			}else{
				m0.copy( bind.data, itm.p_idx * 16 );	// Parent Bone Inverted
				m1.copy( bind.data, ji * 16 ).invert();	// Child Bone UN-Inverted
				Mat4.mul( m0, m1, m1 );
			}

			itm.pos = m1.get_translation( new Vec3() ).near_zero();
			itm.rot = m1.get_rotation( new Quat() ).norm();
			itm.scl = near_one( m1.get_scale( new Vec3() ) );
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		return bones;
	}

	// Uses the nodes to get the local space bind pose transform. But the real bind pose
	// isn't always available there, blender export has a habit of using the current pose/frame in nodes.
	static get_skin_by_nodes( json, name=null, node_info=null ){
		if( !json.skins ){
			console.error( "There is no skin in the GLTF file." );
			return null;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Skin Checking
		let ji, skin = null;
		if( name != null ){
			for( ji of json.skins ) if( ji.name == name ){ skin = ji; break; }
			if( !skin ){ console.error( "skin not found", name ); return null; }
		}else{
			// Not requesting one, Use the first one available
			for( ji of json.skins ){ 
				skin = ji;
				name = ji.name; // Need name to fill in node_info
				break;
			}
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Create Bone Items
		let boneCnt = skin.joints.length,
			bones 	= new Array(boneCnt),
			n2j 	= {},			// Lookup table to link Parent-Child (Node to Joint Indexes)
			n, 						// Node
			ni, 					// Node Index
			itm;					// Bone Item

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Create Bone Array and Lookup Table.
		for(ji=0; ji < boneCnt; ji++ ){
			ni				= skin.joints[ ji ];
			n2j[ "n"+ni ] 	= ji;

			bones[ ji ] = {
				idx : ji, p_idx : null, lvl : 0, name : null,
				pos : null, rot : null, scl : null };
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Collect bone information
		for( ji=0; ji < boneCnt; ji++){
			n				= json.nodes[ skin.joints[ ji ] ]; // Bone Node
			itm 			= bones[ ji ];	// Output

			// Each Bone Needs a Name, create one if one does not exist.
			if( n.name === undefined || n.name == "" )	itm.name = "bone_" + ji;
			else{
				// Remove Any Mixamo stuff, makes bone names long.
				itm.name = n.name.replace("mixamorig:", "");
			} 										
			// Get Transform Data if Available
			if( n.translation ) 	itm.pos = n.translation.slice(0);
			if( n.rotation ) 		itm.rot = n.rotation.slice(0);

			// Scale isn't always available
			if( n.scale ){
				// Near Zero Testing, Clean up the data because of Floating point issues.
				itm.scl = n.scale.slice(0);
				if( Math.abs( 1 - itm.scl[0] ) <= 0.000001 ) itm.scl[0] = 1;
				if( Math.abs( 1 - itm.scl[1] ) <= 0.000001 ) itm.scl[1] = 1;
				if( Math.abs( 1 - itm.scl[2] ) <= 0.000001 ) itm.scl[2] = 1;
			}

			// Set Children who the parent is.
			if( n.children && n.children.length > 0 ){
				for( ni of n.children ) bones[ n2j["n"+ni] ].p_idx = ji;
			}
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Set the Hierarchy Level for each bone
		// TODO, May no longer need this. Bones always seem in order
		// from Parent to Child.
		let lvl;
		for( ji=0; ji < boneCnt; ji++){
			// Check for Root Bones
			itm = bones[ ji ];
			if( itm.p_idx == null ){ itm.lvl = 0; continue; }

			// Traverse up the tree to count how far down the bone is
			lvl = 0;
			while( itm.p_idx != null ){ lvl++; itm = bones[ itm.p_idx ]; }

			bones[ ji ].lvl = lvl;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Some Armature Nodes have transform data to display correctly.
		// Usually the case when dealing with Animations from Mixamo	
		if( node_info ){
			for( ji of json.nodes ){ 
				if( ji.name == name ){ 
					if( ji.rotation )	node_info["rot"] = ji.rotation;
					if( ji.scale )		node_info["scl"] = ji.scale;
					if( ji.position )	node_info["pos"] = ji.position;
					break;
				}
			}
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		return bones;
	}
	// #endregion /////////////////////////////////////////////////////////////////////////



	////////////////////////////////////////////////////////
	// ANIMATION
	////////////////////////////////////////////////////////
		/*
		https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
		https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#appendix-c-spline-interpolation (Has math for cubic spline)

		animation = {
			frame_cnt		: int
			time			: float,
			times			: [ float32array, float32array, etc ],
			tracks			: [
				{ 
					type		: "rot || pos || scl",
					time_idx 	: 0,
					joint_idx	: 0,
					lerp 		: "LINEAR || STEP || CUBICSPLINE",
					data		: float32array,
				},
			]
		}
		*/
		static get_animation( json, bin, name=null, limit=true ){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Validate there is animations and an anaimtion by a name exists in the json file.
			if( json.animations === undefined || json.animations.length == 0 ){ console.error("There is no animations in gltf"); return null; }

			let i, a = null;
			if( name ){
				for( i of json.animations ) if( i.name === name ){ a = i; break; }
				if( !a ){ console.error("Animation by the name", name, "not found in GLTF"); return null; }
			}else a = json.animations[ 0 ]; // No Name, Grab First One.

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Create Lookup Table For Node Index to Bone Index.
			let joints	= {},
				j_ary	= json.skins[ 0 ].joints;

			for( i=0; i < j_ary.length; i++ ){ 
				joints[ j_ary[i] ] = i; // Node Index to Joint Index
				//console.log( "Idx :", i, " Name: ", json.nodes[ j_ary[i] ].name );
			}
			
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			let chi = 0, ch, s, n, prop,
				t_idx, n_name, s_time,
				ch_ary		= [],	// Store all the channel information structs
				time_ary	= [],	// Shared Time Information between Tracks
				time_tbl	= {},	// Keep Track of Time Accessor ID thats been extracted
				time_max	= 0,	// Max Time of the Track Animations
				frame_max	= 0;

			for( chi=0; chi < a.channels.length; chi++ ){
				//.......................
				// Must check that the channel points to a node that the animation is attached to.
				ch = a.channels[ chi ];
				if( ch.target.node == undefined ) continue;
				n = ch.target.node;

				if( joints[ n ] == undefined ){
					console.log("Channel's target node is not a joint of the first skin.");
					continue;
				}

				//.......................
				// User a smaller property name then what GLTF uses.
				switch( ch.target.path ){
					case "rotation"		: prop = "rot"; break;
					case "translation"	: prop = "pos"; break;
					case "scale"		: prop = "scl"; break;
					default: console.log( "unknown channel path", ch.path ); continue;
				}

				//.......................
				// When limit it set, only want rotation tracks and if its the hip, position to.
				n_name = json.nodes[ n ].name.toLowerCase();

				if( limit && 
					!( prop == "rot" ||  
						( n_name.indexOf("hip") != -1 && prop == "pos" )
					) 
				) continue;

				//.......................
				// Parse out the Sampler Data from the Bin file.
				s = a.samplers[ ch.sampler ];

				// Get Time for all keyframes, cache it since its shared.
				t_idx = time_tbl[ s.input ];
				if( t_idx == undefined ){
					time_tbl[ s.input ] = t_idx = time_ary.length;
					s_time = this.parse_accessor( s.input, json, bin );

					time_ary.push( s_time.data );

					time_max	= Math.max( time_max, s_time.max[0] );
					frame_max	= Math.max( frame_max, s_time.data.length );
				}

				//.......................
				// Get the changing value per frame for the property
				ch_ary.push({
					type		: prop,
					time_idx 	: t_idx,
					joint_idx	: joints[ n ],
					interp 		: s.interpolation,
					data		: this.parse_accessor( s.output, json, bin ).data,
				});
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			let rtn = { time:time_max, frame_cnt: frame_max, times: time_ary, tracks:ch_ary };
			return rtn;
		}


	////////////////////////////////////////////////////////
	// MISC
	////////////////////////////////////////////////////////
		
		// Binary Buffer can exist in GLTF file encoded in base64. 
		// This function converts the data into an ArrayBuffer.
		static parse_b64_buffer( json ){
			let buf = json.buffers[ 0 ];
			if( buf.uri.substr(0,5) != "data:" ) return null;

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Create and Fill DataView with buffer data
			let pos		= buf.uri.indexOf( "base64," ) + 7,
				blob	= window.atob( buf.uri.substr( pos ) ),
				ary_buf = new ArrayBuffer( blob.length ),
				dv		= new DataView( ary_buf );

			for( let i=0; i < blob.length; i++ ) dv.setUint8( i, blob.charCodeAt( i ) );

			return ary_buf;
		}
}

////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////
	Gltf.MODE_POINTS 			= 0;		// Mode Constants for GLTF and WebGL are identical
	Gltf.MODE_LINES				= 1;		// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
	Gltf.MODE_LINE_LOOP			= 2;
	Gltf.MODE_LINE_STRIP		= 3;
	Gltf.MODE_TRIANGLES			= 4;
	Gltf.MODE_TRIANGLE_STRIP	= 5;
	Gltf.MODE_TRIANGLE_FAN		= 6;

	Gltf.TYPE_BYTE				= 5120;
	Gltf.TYPE_UNSIGNED_BYTE		= 5121;
	Gltf.TYPE_SHORT				= 5122;
	Gltf.TYPE_UNSIGNED_SHORT	= 5123;
	Gltf.TYPE_UNSIGNED_INT		= 5125;
	Gltf.TYPE_FLOAT				= 5126;

	Gltf.COMP_SCALAR			= 1;		// Component Length based on Type
	Gltf.COMP_VEC2				= 2;
	Gltf.COMP_VEC3				= 3;
	Gltf.COMP_VEC4				= 4;
	Gltf.COMP_MAT2				= 4;
	Gltf.COMP_MAT3				= 9;
	Gltf.COMP_MAT4				= 16;

	Gltf.TARGET_ARY_BUF			= 34962;	// bufferview.target
	Gltf.TARGET_ELM_ARY_BUF		= 34963;


/*
//https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#glb-file-format-specification
const GLB_MAGIC	= 0x46546C67;
const GLB_JSON	= 0x4E4F534A;
const GLB_BIN	= 0x004E4942;
function parse_glb( arybuf ){
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	let dv		= new DataView( arybuf );
	let magic	= dv.getUint32( 0, true );
	if( magic != GLB_MAGIC ){
		console.error("GLB's Magic Number does not match.");
		return null;
	}

	let version	= dv.getUint32( 4, true );
	if( version != 2 ){
		console.error("GLB is number version 2.");
		return null;
	}

	let main_blen	= dv.getUint32( 8, true );
	console.log( "Version :", version );
	console.log( "Binary Length :", main_blen );

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// LOAD CHUNK 0 & 1 TESTING

	let chk0_len	= dv.getUint32( 12, true );
	let chk0_type	= dv.getUint32( 16, true );

	if( chk0_type != GLB_JSON ){
		console.error("GLB Chunk 0 is not the type: JSON ");
		return null;
	}

	let chk0_offset	= 20;						// Start of JSON
	let chk1_offset	= chk0_offset + chk0_len;	// Start of BIN's 8 byte header

	let chk1_len	= dv.getUint32( chk1_offset, true );
	let chk1_type	= dv.getUint32( chk1_offset+4, true );

	if( chk1_type != GLB_BIN ){ //TODO, this does not have to exist, just means no bin data.
		console.error("GLB Chunk 1 is not the type: BIN ");
		return null;
	}

	chk1_offset += 8; // Skip the Header

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// PARSE JSON
	let txt_decoder	= new TextDecoder( "utf8" );
	let json_bytes	= new Uint8Array( arybuf, chk0_offset, chk0_len );
	let json_text	= txt_decoder.decode( json_bytes );
	let json		= JSON.parse( json_text );

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// PARSE BIN - TODO, Not efficent to slice the array buffer
	// but need to fix GLTF parser to have a root offset to use 
	// original buffer.
	let bin = arybuf.slice( chk1_offset );

	if( bin.byteLength != chk1_len ){
		console.error( "GLB Bin length does not match value in header.");
		return null;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	return [ json, bin ];
}
*/


//###############################################################################
export default Gltf;