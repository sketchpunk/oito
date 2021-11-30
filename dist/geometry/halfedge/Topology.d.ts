import HalfEdge from './HalfEdge.js';
import { Edge, EdgeCollection } from './Edge.js';
import { Face, FaceCollection } from './Face.js';
import { Vertex, VertexCollection } from './Vertex.js';
declare class Topology {
    vertices: VertexCollection;
    edges: EdgeCollection;
    faces: FaceCollection;
    get faceCount(): number;
    getVertex(idx: number): Vertex;
    getHalfEdge(idx: number): HalfEdge;
    getEdge(idx: number): Edge;
    getFace(idx: number): Face;
    delVertex(vIdx: number): void;
}
export default Topology;
