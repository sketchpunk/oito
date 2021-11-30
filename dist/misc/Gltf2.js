//#endregion
//#region DATA STRUCTS
// ByteSize : TypeArray : JS Type name, Gltf Type name
const ComponentTypeMap = {
    5120: [1, Int8Array, "int8", "BYTE"],
    5121: [1, Uint8Array, "uint8", "UNSIGNED_BYTE"],
    5122: [2, Int16Array, "int16", "SHORT"],
    5123: [2, Uint16Array, "uint16", "UNSIGNED_SHORT"],
    5125: [4, Uint32Array, "uint32", "UNSIGNED_INT"],
    5126: [4, Float32Array, "float", "FLOAT"],
};
const ComponentVarMap = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16,
};
class Accessor {
    componentLen = 0;
    elementCnt = 0;
    byteOffset = 0;
    byteSize = 0;
    boundMin = null;
    boundMax = null;
    type = null;
    data = null;
    constructor(accessor, bufView, bin) {
        const [compByte, // Type Byte Size
        compType, typeName] = ComponentTypeMap[accessor.componentType]; // Ref to TypeArray
        if (!compType) {
            console.error("Unknown Component Type for Accessor", accessor.componentType);
            return;
        }
        this.componentLen = ComponentVarMap[accessor.type]; // How many Components in Value
        this.elementCnt = accessor.count; // Like, How many Vector3s exist?
        this.byteOffset = (accessor.byteOffset || 0) + (bufView.byteOffset || 0);
        this.byteSize = this.elementCnt * this.componentLen * compByte;
        this.boundMin = (accessor.min) ? accessor.min.slice(0) : null;
        this.boundMax = (accessor.max) ? accessor.max.slice(0) : null;
        this.type = typeName; //accessor.type;
        if (bin) {
            const size = this.elementCnt * this.componentLen;
            this.data = new compType(bin, this.byteOffset, size);
        }
    }
}
//#endregion
//#region MESH DATA
class Mesh {
    index = null; // Index in Mesh Collection
    name = null; // Mesh Name
    primitives = []; // Mesh is made up of more then one Primative
    position = null; // Node's Position
    rotation = null; // Node's Rotation
    scale = null; // Node's Scale
}
class Primitive {
    materialName = null;
    materialIdx = null;
    indices = null;
    position = null;
    normal = null;
    tangent = null;
    texcoord_0 = null;
    texcoord_1 = null;
    color_0 = null;
    joints_0 = null;
    weights_0 = null;
}
//#endregion
//#region SKIN DATA
class Skin {
    index = null; // Index in Mesh Collection
    name = null; // Skin Name
    joints = []; // Collection of Joints
}
class SkinJoint {
    name = null; // Name of Joint
    index = null; // Joint Index
    parentIndex = null; // Parent Joint Index, Null if its a Root Joint
    bindMatrix = null; // Inverted WorldSpace Transform
    position = null; // Local Space Position
    rotation = null; // Local Space Rotation
    scale = null; // Local Space Scale
}
//#endregion
class Gltf {
    //#region MAIN
    json;
    bin;
    constructor(json, bin) {
        this.json = json;
        this.bin = bin || new ArrayBuffer(0); // TODO, Fix for base64 inline buffer
    }
    //#endregion ///////////////////////////////////////////////////////////////////////
    //#region NODES
    //#endregion ///////////////////////////////////////////////////////////////////////
    //#region MESHES
    getMeshNames() {
        const json = this.json, rtn = [];
        let i;
        for (i of json.meshes)
            rtn.push(i.name);
        return rtn;
    }
    getMeshByName(n) {
        let o, i;
        for (i = 0; i < this.json.meshes.length; i++) {
            o = this.json.meshes[i];
            if (o.name == n)
                return [o, i];
        }
        return null;
    }
    getMeshNodes(idx) {
        const out = [];
        let n;
        for (n of this.json.nodes) {
            if (n.mesh == idx)
                out.push(n);
        }
        return out;
    }
    getMesh(id) {
        if (!this.json.meshes) {
            console.warn("No Meshes in GLTF File");
            return null;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const json = this.json;
        let m = null;
        let mIdx = null;
        switch (typeof id) {
            case "string": {
                const tup = this.getMeshByName(id);
                if (tup !== null) {
                    m = tup[0];
                    mIdx = tup[1];
                }
                break;
            }
            case "number":
                if (id < json.meshes.length) {
                    m = json.meshes[id];
                    mIdx = id;
                }
                break;
            default:
                m = json.meshes[0];
                mIdx = 0;
                break;
        }
        if (m == null || mIdx == null) {
            console.warn("No Mesh Found", id);
            return null;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const mesh = new Mesh();
        mesh.name = m.name;
        mesh.index = mIdx;
        let p, prim, attr;
        for (p of m.primitives) {
            attr = p.attributes;
            prim = new Primitive();
            //------------------------------------------------------
            if (p.material != undefined && p.material != null) {
                prim.materialIdx = p.material;
                prim.materialName = json.materials[p.material].name;
            }
            //------------------------------------------------------
            if (p.indices != undefined)
                prim.indices = this.parseAccessor(p.indices);
            if (attr.POSITION != undefined)
                prim.position = this.parseAccessor(attr.POSITION);
            if (attr.NORMAL != undefined)
                prim.normal = this.parseAccessor(attr.NORMAL);
            if (attr.TANGENT != undefined)
                prim.tangent = this.parseAccessor(attr.TANGENT);
            if (attr.TEXCOORD_0 != undefined)
                prim.texcoord_0 = this.parseAccessor(attr.TEXCOORD_0);
            if (attr.TEXCOORD_1 != undefined)
                prim.texcoord_1 = this.parseAccessor(attr.TEXCOORD_1);
            if (attr.JOINTS_0 != undefined)
                prim.joints_0 = this.parseAccessor(attr.JOINTS_0);
            if (attr.WEIGHTS_0 != undefined)
                prim.weights_0 = this.parseAccessor(attr.WEIGHTS_0);
            if (attr.COLOR_0 != undefined)
                prim.color_0 = this.parseAccessor(attr.COLOR_0);
            //------------------------------------------------------
            mesh.primitives.push(prim);
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const nodes = this.getMeshNodes(mIdx);
        // Save Position, Rotation and Scale if Available.
        if (nodes?.length) {
            if (nodes[0].translation)
                mesh.position = nodes[0].translation.slice(0);
            if (nodes[0].rotation)
                mesh.rotation = nodes[0].rotation.slice(0);
            if (nodes[0].scale)
                mesh.scale = nodes[0].scale.slice(0);
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return mesh;
    }
    //#endregion ///////////////////////////////////////////////////////////////////////
    //#region SKINS
    getSkinNames() {
        const json = this.json, rtn = [];
        let i;
        for (i of json.skins)
            rtn.push(i.name);
        return rtn;
    }
    getSkinByName(n) {
        let o, i;
        for (i = 0; i < this.json.skins.length; i++) {
            o = this.json.skins[i];
            if (o.name == n)
                return [o, i];
        }
        return null;
    }
    getSkin(id) {
        if (!this.json.skins) {
            console.warn("No Skins in GLTF File");
            return null;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const json = this.json;
        let js = null;
        let idx = null;
        switch (typeof id) {
            case "string": {
                const tup = this.getSkinByName(id);
                if (tup !== null) {
                    js = tup[0];
                    idx = tup[1];
                }
                break;
            }
            case "number":
                if (id < json.skins.length) {
                    js = json.meshes[id];
                    idx = id;
                }
                break;
            default:
                js = json.skins[0];
                idx = 0;
                break;
        }
        if (js == null) {
            console.warn("No Skin Found", id);
            return null;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const bind = this.parseAccessor(js.inverseBindMatrices);
        if (bind && bind.elementCnt != js.joints.length) {
            console.warn("Strange Error. Joint Count & Bind Matrix Count dont match");
            return null;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let i, bi, ni, joint, node;
        const jMap = new Map(); // Map Node Index to Joint Index;
        const skin = new Skin();
        skin.name = js.name;
        skin.index = idx;
        for (i = 0; i < js.joints.length; i++) {
            //console.log( i, js.joints[ i ] );
            ni = js.joints[i];
            node = json.nodes[ni];
            jMap.set(ni, i); // Map Node Index to Joint Index
            //-----------------------------------------
            joint = new SkinJoint();
            joint.index = i;
            joint.name = (node.name) ? node.name : "bone_" + i;
            // Get Local Space Transform if available on the Node
            joint.rotation = node?.rotation?.slice(0) ?? null;
            joint.position = node?.translation?.slice(0) ?? null;
            joint.scale = node?.scale?.slice(0) ?? null;
            if (bind && bind.data) {
                bi = i * 16;
                joint.bindMatrix = Array.from(bind.data.slice(bi, bi + 16));
            }
            //-----------------------------------------
            // Because of Rounding Errors, If Scale is VERY close to 1, Set it to 1.
            // This helps when dealing with transform hierachy since small errors will
            // compound and cause scaling in places that its not ment to.
            if (joint.scale) {
                if (Math.abs(1 - joint.scale[0]) <= 0.000001)
                    joint.scale[0] = 1;
                if (Math.abs(1 - joint.scale[1]) <= 0.000001)
                    joint.scale[1] = 1;
                if (Math.abs(1 - joint.scale[2]) <= 0.000001)
                    joint.scale[2] = 1;
            }
            //-----------------------------------------
            skin.joints.push(joint);
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Update Joints with the index to their parent. In GLTF we only know a joint's
        // children. Using the Node-Joint Map, we can translate the node children to
        // joints.
        let j;
        for (i = 0; i < js.joints.length; i++) {
            ni = js.joints[i]; // Joint Points t a Node
            node = json.nodes[ni]; // Get that Joint's Node
            // If joint Node has children, Loop threw the list and
            // update their parentIndex to match this current joint.
            if (node?.children?.length) {
                for (j = 0; j < node.children.length; j++) {
                    bi = jMap.get(node.children[j]); // Joint Node Children Index, get their mapped joint index.
                    skin.joints[bi].parentIndex = i; // With Child Joint Index, Save this Index as its parent.
                }
            }
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return skin;
    }
    //#endregion ///////////////////////////////////////////////////////////////////////
    //#region MATERIALS
    // https://github.com/KhronosGroup/glTF-Tutorials/blob/master/gltfTutorial/gltfTutorial_010_Materials.md
    getMaterial(id) {
        console.log(id);
        if (!this.json.materials) {
            console.warn("No Materials in GLTF File");
            return null;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const json = this.json;
        let mat = null;
        switch (typeof id) {
            case "number":
                if (id < json.materials.length) {
                    mat = json.materials[id].pbrMetallicRoughness;
                }
                break;
            default:
                mat = json.materials[0].pbrMetallicRoughness;
                break;
        }
        return mat;
    }
    //#endregion ///////////////////////////////////////////////////////////////////////
    //#region SUPPORT
    // https://github.com/KhronosGroup/glTF-Tutorials/blob/master/gltfTutorial/gltfTutorial_005_BuffersBufferViewsAccessors.md
    parseAccessor(accID) {
        const accessor = this.json.accessors[accID];
        const bufView = this.json.bufferViews[accessor.bufferView];
        if (bufView.byteStride) {
            console.error("UNSUPPORTED - Parsing Stride Buffer");
            return null;
        }
        return new Accessor(accessor, bufView, this.bin);
    }
    //#endregion ///////////////////////////////////////////////////////////////////////
    //#region STATIC
    static async fetch(url) {
        let bin = null;
        const json = await fetch(url)
            .then(r => { return (r.ok) ? r.json() : null; });
        if (!json)
            return null;
        if (json.buffers && json.buffers.length > 0) {
            const path = url.substring(0, url.lastIndexOf('/') + 1);
            bin = await fetch(path + json.buffers[0].uri).then(r => r.arrayBuffer());
        }
        return new Gltf(json, bin);
    }
}
//#region OLD LIB's FUNCTIONS
/*
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
//#endregion
export default Gltf;
