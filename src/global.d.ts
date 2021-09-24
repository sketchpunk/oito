type TVec2 = Vec2 | Float32Array | [number,number] | number[]
type TVec3 = Vec3 | Float32Array | [number,number,number] | number[]
type TVec4 = Quat | Vec4 | Float32Array | [number,number,number,number] | number[]

type TVec3Struct = { x: number, y: number, z: number } // Handle Data form ThreeJS
type TVec4Struct = { x: number, y: number, z: number, w: number }

type TMat4 = Mat4 | Float32Array | number[] | [ number,number,number,number, number,number,number,number, number,number,number,number, number,number,number,number ]
type TMat3 = Float32Array | number[] | [ number,number,number, number,number,number, number,number,number ]

type TVec8 = DualQuat | Float32Array | number[] | [ number,number,number,number, number,number,number,number ]

type TGeo = { 
    indices     : Array<number>,
    vertices    : Array<number>,
    normals     : Array<number>,
    texcoord    : Array<number>,
};

type TGeoIVN = { 
    indices     : Array<number>,
    vertices    : Array<number>,
    normals     : Array<number>,
};

//type JSONValue = string | number | boolean | JSONObject | JSONArray;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
//interface JSONArray extends Array<JSONValue>{}
//interface JSONObject { [x: string]: JSONValue; }