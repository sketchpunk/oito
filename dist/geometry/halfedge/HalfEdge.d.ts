import type Topology from './Topology';
import type Vertex from './Vertex';
import type Edge from './Edge';
import type Face from './Face';
declare class HalfEdge {
    index: number;
    prev: number;
    next: number;
    twin: number;
    edge: number;
    vertex: number;
    face: number;
    constructor(idx?: number, twinIdx?: number);
    /** Get Next HalfEdge Object */
    getNext(top: Topology): HalfEdge;
    /** Get Prev HalfEdge Object */
    getPrev(top: Topology): HalfEdge;
    /** Get the Next HE's Twin Object */
    getNextTwin(top: Topology): HalfEdge | null;
    /** Get the Twin's Next HE Object */
    getTwinNext(top: Topology): HalfEdge | null;
    /** Get the Previous HE's Twin */
    getPrevTwin(top: Topology): HalfEdge | null;
    getTwin(top: Topology): HalfEdge;
    getVertex(top: Topology): Vertex;
    getEdge(top: Topology): Edge;
    getFace(top: Topology): Face;
    static makePair(ai: number, bi: number, ei: number, v0: number, v1: number): Array<HalfEdge>;
}
export default HalfEdge;
