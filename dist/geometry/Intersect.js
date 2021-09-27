/* eslint-disable prefer-const */
import Vec3 from "../Vec3.js";
class Intersect {
    // Original : https://gist.github.com/yomotsu/d845f21e2e1eb49f647f
    static triangle_aabb(a, b, c, minBox, maxBox) {
        let p0, p1, p2, r;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Compute box center and extents of AABoundingBox (if not already given in that format)
        const center = Vec3.lerp(minBox, maxBox, 0.5);
        const extents = Vec3.sub(maxBox, center);
        // Translate triangle as conceptually moving AABB to origin
        const v0 = Vec3.sub(a, center), v1 = Vec3.sub(b, center), v2 = Vec3.sub(c, center);
        // Compute edge vectors for triangle
        const f0 = Vec3.sub(v1, v0), f1 = Vec3.sub(v2, v1), f2 = Vec3.sub(v0, v2);
        // Test axes a00..a22 (category 3)
        const a00 = [0, -f0[2], f0[1]], a01 = [0, -f1[2], f1[1]], a02 = [0, -f2[2], f2[1]], a10 = [f0[2], 0, -f0[0]], a11 = [f1[2], 0, -f1[0]], a12 = [f2[2], 0, -f2[0]], a20 = [-f0[1], f0[0], 0], a21 = [-f1[1], f1[0], 0], a22 = [-f2[1], f2[0], 0];
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Axis Testing
        /*
        p0 = v0.dot( a00 );
        p1 = v1.dot( a00 );
        p2 = v2.dot( a00 );
        r  = extents[1] * Math.abs( f0[2] ) + extents[2] * Math.abs( f0[1] );
        if( Math.max( -Math.max( p0, p1, p2 ), Math.min( p0, p1, p2 ) ) > r ) return false;
        */
        const axis_test = [
            [a00, f0, 1, 2],
            [a01, f1, 1, 2],
            [a02, f2, 1, 2],
            [a10, f0, 0, 2],
            [a11, f1, 0, 2],
            [a12, f2, 0, 2],
            [a20, f0, 0, 1],
            [a21, f1, 0, 1],
            [a22, f2, 0, 1],
        ];
        let i, aa, // First Axis Component
        bb, // Second Axis Component
        ann, // Axis Point
        fn; // Triangle Vector Length Edges
        for (i of axis_test) {
            ann = i[0];
            fn = i[1];
            aa = i[2];
            bb = i[3];
            // Project all 3 vertices of the triangle onto the seperating axis
            p0 = v0.dot(ann);
            p1 = v1.dot(ann);
            p2 = v2.dot(ann);
            // Project the aabb onto the seperating axis
            r = extents[aa] * Math.abs(fn[bb]) + extents[bb] * Math.abs(fn[aa]);
            // Axis is a separating axis, then false
            // Actual test, basically see if either of the most extreme of the triangle points intersects r.
            // Points of the projected triangle are outside the projected half-length of the aabb
            // the axis is seperating and we can exit.
            if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r)
                return false;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Test the three axes corresponding to the face normals of AABB b (category 1). Exit if...
        // ... [-extents.x, extents.x] and [min(v0.x,v1.x,v2.x), max(v0.x,v1.x,v2.x)] do not overlap
        if (Math.max(v0.x, v1.x, v2.x) < -extents.x || Math.min(v0.x, v1.x, v2.x) > extents.x)
            return false;
        // ... [-extents.y, extents.y] and [min(v0.y,v1.y,v2.y), max(v0.y,v1.y,v2.y)] do not overlap
        if (Math.max(v0.y, v1.y, v2.y) < -extents.y || Math.min(v0.y, v1.y, v2.y) > extents.y)
            return false;
        // ... [-extents.z, extents.z] and [min(v0.z,v1.z,v2.z), max(v0.z,v1.z,v2.z)] do not overlap
        if (Math.max(v0.z, v1.z, v2.z) < -extents.z || Math.min(v0.z, v1.z, v2.z) > extents.z)
            return false;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Intersection AABB-Plane
        // Test separating axis corresponding to triangle face normal (category 2)
        // Face Normal is -ve as Triangle is clockwise winding (and XNA uses -z for into screen)
        const planeNorm = Vec3.cross(f1, f0).norm();
        const planeConst = planeNorm.dot(a);
        r = extents[0] * Math.abs(planeNorm[0]) +
            extents[1] * Math.abs(planeNorm[1]) +
            extents[2] * Math.abs(planeNorm[2]);
        const s = Math.abs(planeNorm.dot(center) - planeConst);
        return (s <= r);
    }
}
export default Intersect;
