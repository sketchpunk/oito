declare type TTypeArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Uint32Array | Float32Array;
declare type TBufferView = {
    byteOffset?: number;
};
declare type TAccessor = {
    componentType: number;
    type: number;
    count: number;
    byteOffset?: number;
    min?: Array<number>;
    max?: Array<number>;
};
declare class Accessor {
    componentLen: number;
    elementCnt: number;
    byteOffset: number;
    byteSize: number;
    boundMin: Array<number> | null;
    boundMax: Array<number> | null;
    type: string | null;
    data: TTypeArray | null;
    constructor(accessor: TAccessor, bufView: TBufferView, bin: ArrayBuffer);
}
declare class Mesh {
    index: number | null;
    name: string | null;
    primitives: Array<Primitive>;
    position: TVec3 | null;
    rotation: TVec4 | null;
    scale: TVec3 | null;
}
declare class Primitive {
    materialName: string | null;
    materialIdx: number | null;
    indices: Accessor | null;
    position: Accessor | null;
    normal: Accessor | null;
    tangent: Accessor | null;
    texcoord_0: Accessor | null;
    texcoord_1: Accessor | null;
    color_0: Accessor | null;
    joints_0: Accessor | null;
    weights_0: Accessor | null;
}
declare class Skin {
    index: number | null;
    name: string | null;
    joints: Array<SkinJoint>;
}
declare class SkinJoint {
    name: string | null;
    index: number | null;
    parentIndex: number | null;
    bindMatrix: TMat4 | null;
    position: TVec3 | null;
    rotation: TVec4 | null;
    scale: TVec3 | null;
}
declare class Gltf {
    json: any;
    bin: ArrayBuffer;
    constructor(json: any, bin?: ArrayBuffer | null);
    getMeshNames(): Array<string>;
    getMeshByName(n: string): [any, number] | null;
    getMeshNodes(idx: number): Array<any>;
    getMesh(id: string | number | undefined): Mesh | null;
    getSkinNames(): Array<string>;
    getSkinByName(n: string): [any, number] | null;
    getSkin(id: string | number | undefined): Skin | null;
    getMaterial(id: number | undefined): any;
    parseAccessor(accID: number): Accessor | null;
    static fetch(url: string): Promise<Gltf>;
}
export default Gltf;
