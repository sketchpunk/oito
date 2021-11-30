import Vec3 from "../../Vec3.js";
import type Edge from "./Edge.js";
import type HalfEdge from "./HalfEdge.js";
import type Topology from "./Topology.js";
interface IterNext {
    value: Vertex | null;
    done: boolean;
}
declare class Vertex {
    index: number;
    halfedge: number;
    pos: Vec3;
    constructor(pos: TVec3, idx: number);
    reset(): this;
    getHalfEdge(top: Topology): HalfEdge;
    getAllEdges(top: Topology): Array<Edge>;
    static key(pos: TVec3, place?: number): string;
}
declare class VertexCollection {
    uniqueVertLevel: number;
    top: Topology;
    items: Array<Vertex>;
    map: Map<string, number>;
    constructor(top: Topology);
    add(pos: TVec3, overrideUnique?: boolean): number;
    _new(pos: TVec3): number;
    remove(idx: number): void;
    iter(): {
        [Symbol.iterator](): {
            next: () => IterNext;
        };
    };
}
export default Vertex;
export { Vertex, VertexCollection };
