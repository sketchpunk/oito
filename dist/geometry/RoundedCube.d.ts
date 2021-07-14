declare class RoundedCube {
    static get(sx?: number, sy?: number, sz?: number, radius?: number, cells?: number): TGeo;
    /**  Create a Grid with most of the vertices pushed to the 4 corners, then curve them.
    Size X,Y,Z, Radius, Cell Count ( How many divisions our edges should have) */
    static edgeGrid(sx?: number, sy?: number, sz?: number, r?: number, cells?: number): TGeo;
    /**  Rotate Vertices/Normals, then Merge All the Vertex Attributes into One Geo */
    static geoRotMerge(geo: TGeo, obj: TGeo, fn_rot: (a: TVec3, b: TVec3) => TVec3): void;
}
export default RoundedCube;
