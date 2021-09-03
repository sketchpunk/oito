import Vec3 from "../Vec3.js";
declare type TConfig = {
    r: number;
    t: number;
    A: number;
    B: number;
    C: number;
};
declare class SuperEllipsoid {
    static PietHeinSuperegg(geo: TGeo): TGeo;
    static from(geo: TGeo, ee?: number, nn?: number, A?: number, B?: number, C?: number): TGeo;
    static c(w: number, m: number): number;
    static s(w: number, m: number): number;
    static calcPoint(theta: number, phi: number, config: TConfig, v: Vec3): Vec3;
    static calcNormal(theta: number, phi: number, config: TConfig, n: Vec3): Vec3;
}
export default SuperEllipsoid;
