type TVec3 = Vec3 | Float32Array | [number,number,number] | number[]
type TVec4 = Quat | Vec4 | Float32Array | [number,number,number,number] | number[]

type TVec3Struct = { x: number, y: number, z: number } // Handle Data form ThreeJS
type TVec4Struct = { x: number, y: number, z: number, w: number }

type TGeo = { 
    indices     : Array<number>,
    vertices    : Array<number>,
    normals     : Array<number>,
    texcoord    : Array<number>,
};