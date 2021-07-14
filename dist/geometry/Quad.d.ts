declare class Quad {
    static getInterleaved(): {
        indices: Array<number>;
        buffer: Array<number>;
    };
    static get(w?: number, h?: number, isPlane?: boolean): TGeo;
}
export default Quad;
