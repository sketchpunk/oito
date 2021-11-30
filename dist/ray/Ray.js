import Vec3 from "../Vec3.js";
import Mat4 from "../Mat4.js";
class Ray {
    origin = new Vec3();
    end = new Vec3();
    dir = new Vec3();
    vecLen = new Vec3();
    //#region GETTERS / SETTERS
    /** Get position of the ray from T Scale of VecLen */
    posAt(t, out) {
        // RayVecLen * t + RayOrigin
        // also works lerp( RayOrigin, RayEnd, t )
        out = out || new Vec3();
        out[0] = this.vecLen[0] * t + this.origin[0];
        out[1] = this.vecLen[1] * t + this.origin[1];
        out[2] = this.vecLen[2] * t + this.origin[2];
        return out;
    }
    /** Get position of the ray from distance from origin */
    distAt(len, out) {
        out = out || new Vec3();
        out[0] = this.dir[0] * len + this.origin[0];
        out[1] = this.dir[1] * len + this.origin[1];
        out[2] = this.dir[2] * len + this.origin[2];
        return out;
    }
    /*
    prepare_aabb(){
        // Optimization trick from ScratchAPixel
        this.vec_len_inv = this.vec_len.clone().div_inv_scale( 1 ); //Do inverse of distance, to use mul instead of div for speed.

        // Determine which bound will result in tMin so there will be no need to test if tMax < tMin to swop.
        this.aabb = [ (this.vec_len_inv.x < 0)? 1 : 0, (this.vec_len_inv.y < 0)? 1 : 0, (this.vec_len_inv.z < 0)? 1 : 0 ];

        return this;
    }

    //https://github.com/sketchpunk/temp/blob/master/Fungi_v5_5/fungi.ray/Ray.js
    */
    fromScreenProjection(x, y, w, h, projMatrix, camMatrix) {
        // http://antongerdelan.net/opengl/raycasting.html
        // Normalize Device Coordinate
        const nx = x / w * 2 - 1;
        const ny = 1 - y / h * 2;
        // inverseWorldMatrix = invert( ProjectionMatrix * ViewMatrix ) OR
        // inverseWorldMatrix = localMatrix * invert( ProjectionMatrix ) 
        const invMatrix = Mat4.invert(projMatrix).pmul(camMatrix);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // https://stackoverflow.com/questions/20140711/picking-in-3d-with-ray-tracing-using-ninevehgl-or-opengl-i-phone/20143963#20143963
        // Clip Cords would be [nx,ny,-1,1];
        const clipNear = [nx, ny, -1, 1];
        const clipFar = [nx, ny, 1, 1];
        invMatrix.transformVec4(clipNear); // using 4d Homogeneous Clip Coordinates
        invMatrix.transformVec4(clipFar);
        // Normalize by using W component
        for (let i = 0; i < 3; i++) {
            clipNear[i] /= clipNear[3];
            clipFar[i] /= clipFar[3];
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.origin.copy(clipNear); // Starting Point of the Ray
        this.end.copy(clipFar); // The absolute end of the ray
        this.vecLen.fromSub(clipFar, clipNear); // Vector Length
        this.dir.fromNorm(this.vecLen); // Normalized Vector Length
        return this;
    }
    fromEndPoints(a, b) {
        this.origin.copy(a); // Starting Point of the Ray
        this.end.copy(b); // The absolute end of the ray
        this.vecLen.fromSub(b, a); // Vector Length
        this.dir.fromNorm(this.vecLen); // Normalized Vector Length
        return this;
    }
    //#endregion /////////////////////////////////////////////////////////////////
    //#region INTERSECTION TESTS
    nearPoint(p, distLimit = 0.1) {
        /* closest_point_to_line3D
        let dx	= bx - ax,
            dy	= by - ay,
            dz	= bz - az,
            t	= ( (px-ax)*dx + (py-ay)*dy + (pz-az)*dz ) / ( dx*dx + dy*dy + dz*dz ) ; */
        const dist = Vec3.sub(p, this.origin).mul(this.vecLen), t = (dist[0] + dist[1] + dist[2]) / this.vecLen.lenSqr();
        if (t < 0 || t > 1)
            return null; // Over / Under shoots the Ray Segment
        const lenSqr = this.posAt(t, dist).sub(p).lenSqr(); // Distance from point to nearest point on ray.
        return (lenSqr <= (distLimit * distLimit)) ? t : null;
    }
    /** Returns [ T of Segment, T of RayLen ] */
    nearSegment(p0, p1) {
        // http://geomalgorithms.com/a07-_distance.html
        const u = Vec3.sub(p1, p0), v = this.vecLen.clone(), w = Vec3.sub(p0, this.origin), a = Vec3.dot(u, u), // always >= 0
        b = Vec3.dot(u, v), c = Vec3.dot(v, v), // always >= 0
        d = Vec3.dot(u, w), e = Vec3.dot(v, w), D = a * c - b * b; // always >= 0
        let tU = 0, // T Of Segment 
        tV = 0; // T Of Ray
        // Compute the line parameters of the two closest points
        if (D < 0.000001) { // the lines are almost parallel
            tU = 0.0;
            tV = (b > c ? d / b : e / c); // use the largest denominator
        }
        else {
            tU = (b * e - c * d) / D;
            tV = (a * e - b * d) / D;
        }
        return (tU < 0 || tU > 1 || tV < 0 || tV > 1) ?
            null : [tU, tV];
        // Segment Position : u.scale( tU ).add( p0 )
        // Ray Position :     v.scale( tV ).add( this.origin ) ];
    }
    inPlane(planePos, planeNorm) {
        // ((planePos - rayOrigin) dot planeNorm) / ( rayVecLen dot planeNorm )
        // pos = t * rayVecLen + rayOrigin;
        const denom = Vec3.dot(this.vecLen, planeNorm); // Dot product of ray Length and plane normal
        if (denom <= 0.000001 && denom >= -0.000001)
            return null; // abs(denom) < epsilon, using && instead to not perform absolute.
        const t = Vec3.sub(planePos, this.origin).dot(planeNorm) / denom;
        return (t >= 0) ? t : null;
    }
    /*
    // https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/moller-trumbore-ray-triangle-intersection
    static inTri( ray, v0, v1, v2, out, cull_face=true ){
        let v0v1 	= Vec3.sub( v1, v0 ),
            v0v2 	= Vec3.sub( v2, v0 ),
            pvec 	= Vec3.cross( ray.dir, v0v2 ),
            det		= Vec3.dot( v0v1, pvec );

        if( cull_face && det < 0.000001 ) return false;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let idet 	= 1 / det,
            tvec 	= Vec3.sub( ray.origin, v0 ),
            u 		= Vec3.dot( tvec, pvec ) * idet;

        if( u < 0 || u > 1 ) return false;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let qvec 	= Vec3.cross( tvec, v0v1 ),
            v 		= Vec3.dot( ray.dir, qvec ) * idet;

        if( v < 0 || u+v > 1 ) return false;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        out = out || new Vec3();
        let len = Vec3.dot( v0v2, qvec ) * idet;
        
        ray.get_by_len( len, out );
        return true;
        }

Ray.pointInTriangle = pointInTriangle;
function pointInTriangle(p, a, b, c) {
    c.vsub(a,v0);
    b.vsub(a,v1);
    p.vsub(a,v2);
 
    var dot00 = v0.dot( v0 );
    var dot01 = v0.dot( v1 );
    var dot02 = v0.dot( v2 );
    var dot11 = v1.dot( v1 );
    var dot12 = v1.dot( v2 );
 
    var u,v;
 
    return  ( (u = dot11 * dot02 - dot01 * dot12) >= 0 ) &&
            ( (v = dot00 * dot12 - dot01 * dot02) >= 0 ) &&
            ( u + v < ( dot00 * dot11 - dot01 * dot01 ) );
}
    */
    // TODO : Need to handle precalc the 4 points of a quad AND handle scale, rotation and translation
    inQuad(centerPos, w, h) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //Figure out the 4 points in the quad based on center position and known width/height;
        //Note: If the quad has been rotated or scaled, need to apply those to the 4 points as well.
        const v0 = Vec3.add(centerPos, [-w, h, 0]), v1 = Vec3.add(centerPos, [-w, -h, 0]), v2 = Vec3.add(centerPos, [w, -h, 0]);
        //v3 = Vec3.add( centerPos, [ w,  h, 0] );
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Figure out the normal direction of the quad
        // To find normal direction, take 3 sequential corners, get two vector 
        // lengths then cross apply in counter-clockwise order
        const a = Vec3.sub(v0, v1);
        const b = Vec3.sub(v2, v1);
        const norm = Vec3.cross(b, a).norm();
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Determine if the ray intersects the same plane of the quad.
        const t = this.inPlane(centerPos, norm);
        if (t == null)
            return null;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // First Diagonal Test - Projecting intersection point onto Left Side of Quad
        const ip = this.posAt(t);
        let tt = 0;
        a.fromSub(ip, v0); // Top Corner to Plane Intersection Point
        b.fromSub(v1, v0); // Left Edge
        tt = Vec3.dot(a, b) / b.lenSqr(); // PROJECTION : |a|.|b| / |b|.|b| 
        if (tt < 0 || tt > 1)
            return null;
        //Second Diagonal Test - Projecting intersection point onto bottom Side of Quad
        a.fromSub(ip, v1); // Bottom Corner to Plane Intersection Point
        b.fromSub(v2, v1); // Bottom Edge
        tt = Vec3.dot(a, b) / b.lenSqr();
        if (tt < 0 || tt > 1)
            return null;
        return t;
    }
}
/*
        // Create Ray Based on Screen Mouse X,Y
        //Create actual point in 3d space the mouse clicked plus the furthest point the ray can travel.
        set_screen_mouse( ix, iy, for_aabb = false ){
            // http://antongerdelan.net/opengl/raycasting.html
            // Normalize Device Coordinate
            let nx = ix / App.gl.width * 2 - 1,
                ny = 1 - iy / App.gl.height * 2;

            // inverseWorldMatrix = invert(ProjectionMatrix * ViewMatrix);  // OR
            // inverseWorldMatrix = localMatrix * invert(ProjectionMatrix); // can cache invert projection matrix.
            let world_mtx = new Mat4();
            world_mtx.from_mul( App.cam_node.model_matrix, App.cam_com.proj_inv );

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // https://stackoverflow.com/questions/20140711/picking-in-3d-with-ray-tracing-using-ninevehgl-or-opengl-i-phone/20143963#20143963
            // Clip Cords would be [nx,ny,-1,1];
            let near_vec	= [ nx, ny, -1, 1.0 ],
                far_vec		= [ nx, ny,  1, 1.0 ];

            world_mtx.transform_vec4( near_vec ); // using 4d Homogeneous Clip Coordinates
            world_mtx.transform_vec4( far_vec );

            // Normalize by using W component
            for(var i=0; i < 3; i++){
                near_vec[i]	/= near_vec[3];
                far_vec[i] 	/= far_vec[3];
            }

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // Build all the values
            this.set_pos( near_vec, far_vec );
            this.mouse[ 0 ] = ix;
            this.mouse[ 1 ] = iy;

            if( for_aabb ) this.prepare_aabb();
            return this;
        }
*/
/*


bool PointInTriangle(Vector3 p, Vector3 tp1, Vector3 tp2, Vector3 tp3 )
{
bool a = InternalSide(p,tp1,tp2,tp3);
bool b = InternalSide(p,tp2,tp1,tp3);
bool c = InternalSide(p,tp3,tp1,tp2);
return ( a&&b&&c);
}
bool InternalSide(Vector3 p1, Vector3 p2, Vector3 a, Vector3 b)
{
Vector3 cp1 = (b-a).crossProduct(p1-a);
Vector3 cp2 = (b-a).crossProduct(p2-a);
return (cp1.dot(cp2) >= 0);
}
----------------------------------------------------

    closestPointToPoint( point, target ) {

        target.subVectors( point, this.origin );

        const directionDistance = target.dot( this.direction );

        if ( directionDistance < 0 ) {

            return target.copy( this.origin );

        }

        return target.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );

    }

    intersectSphere( sphere, target ) {

        _vector.subVectors( sphere.center, this.origin );
        const tca = _vector.dot( this.direction );
        const d2 = _vector.dot( _vector ) - tca * tca;
        const radius2 = sphere.radius * sphere.radius;

        if ( d2 > radius2 ) return null;

        const thc = Math.sqrt( radius2 - d2 );

        // t0 = first intersect point - entrance on front of sphere
        const t0 = tca - thc;

        // t1 = second intersect point - exit point on back of sphere
        const t1 = tca + thc;

        // test to see if both t0 and t1 are behind the ray - if so, return null
        if ( t0 < 0 && t1 < 0 ) return null;

        // test to see if t0 is behind the ray:
        // if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
        // in order to always return an intersect point that is in front of the ray.
        if ( t0 < 0 ) return this.at( t1, target );

        // else t0 is in front of the ray, so return the first collision point scaled by t0
        return this.at( t0, target );

    }

intersectTriangle( a, b, c, backfaceCulling, target ) {

        // Compute the offset origin, edges, and normal.

        // from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

        _edge1.subVectors( b, a );
        _edge2.subVectors( c, a );
        _normal.crossVectors( _edge1, _edge2 );

        // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
        // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
        //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
        //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
        //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
        let DdN = this.direction.dot( _normal );
        let sign;

        if ( DdN > 0 ) {

            if ( backfaceCulling ) return null;
            sign = 1;

        } else if ( DdN < 0 ) {

            sign = - 1;
            DdN = - DdN;

        } else {

            return null;

        }

        _diff.subVectors( this.origin, a );
        const DdQxE2 = sign * this.direction.dot( _edge2.crossVectors( _diff, _edge2 ) );

        // b1 < 0, no intersection
        if ( DdQxE2 < 0 ) {

            return null;

        }

        const DdE1xQ = sign * this.direction.dot( _edge1.cross( _diff ) );

        // b2 < 0, no intersection
        if ( DdE1xQ < 0 ) {

            return null;

        }

        // b1+b2 > 1, no intersection
        if ( DdQxE2 + DdE1xQ > DdN ) {

            return null;

        }

        // Line intersects triangle, check if ray does.
        const QdN = - sign * _diff.dot( _normal );

        // t < 0, no intersection
        if ( QdN < 0 ) {

            return null;

        }

        // Ray intersects triangle.
        return this.at( QdN / DdN, target );

    }

*/
export default Ray;
