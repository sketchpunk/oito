import { TTypeArray } from "./types";
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
export default Accessor;
