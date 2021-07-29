import Vec3 from "../Vec3.js";
import CircularLinkedList from "../object/CircularLinkedList.js";
declare class Vertex {
    idx: number | null;
    pos: Vec3;
    edge: CircularLinkedList<Edge>;
    dispose(): void;
}
declare class Edge {
    loop: CircularLinkedList<Loop>;
    idx: number | null;
    a: Vertex;
    b: Vertex;
    constructor(va: Vertex, vb: Vertex);
    containsVertex(v: Vertex): boolean;
    otherVertex(v: Vertex): Vertex;
    dispose(): void;
}
declare class Loop {
    vert: Vertex;
    edge: Edge;
    face: Face;
    /** Can have multiple normals per vert depending on the face or edge.
        If smooth shading, we average out all the normals
        If sharp edges, we duplicate each vertex of the edge so it keeps its normal
    */
    norm: Vec3;
    constructor(v: Vertex, e: Edge, f: Face);
    dispose(): void;
}
declare class Face {
    vertCount: number;
    loop: CircularLinkedList<Loop>;
    dispose(): void;
}
declare class BMesh {
    vert_map: {
        [key: string]: number;
    };
    vertices: Vertex[];
    edges: Edge[];
    loops: Loop[];
    faces: Face[];
    useUniqueVertex: boolean;
    addVert(x: TVec3): Vertex | null;
    addVert(x: number, y: number, z: number): Vertex | null;
    addEdge(va: Vertex, vb: Vertex): Edge;
    addFace(vert_ary: Array<Vertex>, norm_ary: Array<Vec3>): Face | null;
    findEdge(va: Vertex, vb: Vertex): Edge | null;
    reset(): void;
    buildVertices(): Float32Array;
    buildIndices(): Uint16Array | Uint32Array;
}
export default BMesh;
