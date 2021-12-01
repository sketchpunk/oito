export type TVec2 = Float32Array | Array<number> | [ number,number ];
export type TVec3 = Float32Array | Array<number> | [ number,number,number ];
export type TVec4 = Float32Array | Array<number> | [ number,number,number,number ];
export type TVec8 = Float32Array | Array<number> | [ number,number,number,number, number,number,number,number ];

export type TVec3Struct = { x: number, y: number, z: number }; // Handle Data form ThreeJS
export type TVec4Struct = { x: number, y: number, z: number, w: number };

export type TMat4 = Float32Array | Array<number> | [ number,number,number,number, number,number,number,number, number,number,number,number, number,number,number,number ];
export type TMat3 = Float32Array | Array<number> | [ number,number,number, number,number,number, number,number,number ];