import HalfEdge from './HalfEdge.js';
import Topology from './Topology.js';
import { Vertex } from './Vertex.js';
declare class Edge {
    index: number;
    halfedge: number;
    v0: number;
    v1: number;
    constructor(v0: number, v1: number, idx?: number);
    reset(): this;
    getKey(): string;
    getPositions(top: Topology): Array<TVec3>;
    getHalfEdge(top: Topology): HalfEdge;
    getVertices(top: Topology): Array<Vertex>;
    static key(v0: number, v1: number): string;
}
declare class EdgeCollection {
    top: Topology;
    edges: Array<Edge>;
    hedges: Array<HalfEdge>;
    map: Map<string, number>;
    freeEdges: Array<number>;
    freeHEdges: Array<number>;
    constructor(top: Topology);
    getEdgePositions(idx: number): Array<TVec3>;
    add(v0: number, v1: number): Edge;
    getHalfEdgeByOrigin(heIdx: number, vertIdx: number): HalfEdge | undefined;
    recycleEdge(eIdx: number): void;
    iter(): {
        [Symbol.iterator](): {
            next: () => IterNext;
        };
    };
}
interface IterNext {
    value: {
        idx: number;
        v0: Vertex | null;
        v1: Vertex | null;
    };
    done: boolean;
}
export default Edge;
export { Edge, EdgeCollection };
