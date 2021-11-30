import Transform from '../Transform.js';
declare class Bone {
    name: string;
    idx: number;
    pidx: number | null;
    len: number;
    local: Transform;
    world: Transform;
    constructor(name: string, idx: number, len?: number);
    setLocal(rot?: TVec4, pos?: TVec4, scl?: TVec4): this;
    clone(): Bone;
}
export default Bone;
