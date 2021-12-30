import type { TVec3 } from "@oito/type";

class RenderLine{
    head: TVec3;
    tail: TVec3;

    constructor( head: TVec3, tail: TVec3 ){
        this.head = head;
        this.tail = tail;
    }
}

export default RenderLine;