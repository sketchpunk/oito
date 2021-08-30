import Vec3 from "../Vec3.js";
import Mat4 from "../Mat4.js";
class Ray {
    constructor() {
        this.origin = new Vec3();
        this.end = new Vec3();
        this.dir = new Vec3();
        this.vecLen = new Vec3();
        /*
        inPlane( planePos, planeNorm ){
            // t = ray2PlaneLen.plane_norm / rayLen.plane_norm
            // i = rayStart + (t * rayLen)
            let denom = Vec3.dot( this.vec_len, plane_norm );					// Dot product of rayPlen Length and plane normal
            if( denom <= 0.000001 && denom >= -0.000001 ) return null;			// abs(denom) < epsilon, using && instead to not perform absolute.
    
            let ray2PlaneLen	= Vec3.sub( plane_pos, this.origin ),			// Distance between start of ray and plane position.
                t 				= Vec3.dot( ray2PlaneLen, plane_norm ) / denom;
    
            //if(t >= 0) return ray.vec_len.clone().scale(t).add(rayStart);		//include && t <= 1 to limit to range of ray, else its infinite in fwd dir.
            if(t >= 0) return t;
            return null;
        }
        */
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
export default Ray;
