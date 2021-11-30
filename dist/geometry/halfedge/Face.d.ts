import HalfEdge from "./HalfEdge";
import type Topology from "./Topology";
import { Vertex } from "./Vertex";
declare class Face {
    index: number;
    halfedge: number;
    vertexCount: number;
    constructor(idx?: number);
    getHalfEdge(top: Topology): HalfEdge;
    getVertexHalfEdge(top: Topology, vIdx: number): HalfEdge | null;
}
declare class FaceCollection {
    top: Topology;
    items: Array<Face>;
    constructor(top: Topology);
    getVertices(fIdx: number): Array<Vertex>;
    delVertex(fIdx: number, vIdx: number): void;
    add(verts: Array<number> | Array<TVec3>): number;
}
export default Face;
export { Face, FaceCollection };
