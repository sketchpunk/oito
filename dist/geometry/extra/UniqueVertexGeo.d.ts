declare class UniqueVertexGeo {
    map: {
        [key: string]: number;
    };
    geo: TGeo;
    get vertexCount(): number;
    /** Add a Triangle by using 3 Points */
    addTri(a: TVec3, b: TVec3, c: TVec3): this;
    /** Adds a new vertex if it found in the map cache. Return back its vertex index */
    addVert(v: TVec3): number;
    /** Loops through the indices to find all the triangles, then creates new vertices by subdividing them */
    subdivGeo(geo: TGeo, div?: number): this;
    /** Sub divides a triangle by adding new vertices and indicies. */
    subdivTri(a: TVec3, b: TVec3, c: TVec3, div?: number): this;
}
export default UniqueVertexGeo;
