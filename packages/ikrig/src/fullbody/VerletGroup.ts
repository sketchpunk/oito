

// IK Skeleton can group Points into specific structures.

import type VerletPoint from "./VerletPoint";

// Makes it easier to know how to render the skeleton by using groups
class VerletGroup{
    name    : string;
    type    : string;
    points  : Array< VerletPoint >;
    count   = 0;
    constructor( name: string, type: string, points: Array< VerletPoint > ){
        this.name    = name;
        this.type    = type;
        this.points  = points;
        this.count   = points.length;
    }
}

export default VerletGroup;