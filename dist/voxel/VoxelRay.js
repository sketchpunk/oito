import Vec3 from '../Vec3.js';
import { BoundingBox, AABBRay, RayBBoxResult } from '../ray/BoundingBox.js';
//#endregion
class VoxelRayHit {
    coord;
    pos;
    norm;
    t;
    constructor(ix, iy, iz, pos, norm, t) {
        this.coord = [ix, iy, iz];
        this.pos = new Vec3(pos);
        this.norm = new Vec3(norm);
        this.t = t;
    }
}
class VoxelRay {
    //#region MAIN
    tries = 30; // How many steps to take in ray march
    rayBox = new AABBRay(); // AABB-Ray optimization
    rayResults = new RayBBoxResult(); // Bounding box Ray Hit Results.
    inPos = new Vec3(); // Current Hit Position in World Space
    inPosLoc = new Vec3(); // Hit Position in Local Space
    dir = new Vec3(); // Direction to move during ray marching the chunk.
    ix = 0; // Voxel Coord Integer(x,y,z), Clamp between 0 and Max
    iy = 0;
    iz = 0;
    xOut = 0; // Index value to exit loop -1 or Total Cells in Axis
    yOut = 0;
    zOut = 0;
    xBound = 0; // Position of the closest boundary line for each axis at the ray dir. Depends on direction.
    yBound = 0;
    zBound = 0;
    xt = 0; // Time for axis // (xBound - inPos.x) / ray.dir.x,
    yt = 0;
    zt = 0;
    xDelta = 0; // Delta T for each axis as we traverse one voxel at a time
    yDelta = 0;
    zDelta = 0;
    nAxis = 0; // Axis Vector Component 0:x, 1:y, 2:z
    iAxis = 0; // Preselect the initial axis voxel coord.
    norm = new Vec3(); // Normal of Face Being Hit
    boundPos = 0;
    ray_t = 0;
    //#endregion
    //#region ALGORITHM IN PIECES
    // Initialize all the data needed ray steping the voxel chunk
    _init(ray, chunk, bbox) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Test if the voxel chunk boundary has an intersection
        this.rayBox.fromRay(ray); // Setup Optimized AABB/RAY INTERSECTION Object
        if (!bbox.rayIntersects(ray, this.rayBox, this.rayResults)) {
            console.log('Does not intersect AABB');
            return false;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Entry point for chunk, Clean up vals near zero. If Min < 0, origin is in AABB
        // inPos lives in world space, Need to move it to local space to work correctly with the algorithm
        const cellSize = chunk.cellSize;
        ray.posAt(Math.max(this.rayResults.tMin, 0), this.inPos).nearZero();
        this.inPosLoc.fromSub(this.inPos, chunk.minBound); // Intersect position in relation to chunk origin.        
        //--------- Calc Voxel Coord Integer(x,y,z), Clamp between 0 and Max
        this.ix = Math.max(Math.min(Math.floor(this.inPosLoc.x / cellSize), chunk.dimension[0] - 1), 0);
        this.iy = Math.max(Math.min(Math.floor(this.inPosLoc.y / cellSize), chunk.dimension[1] - 1), 0);
        this.iz = Math.max(Math.min(Math.floor(this.inPosLoc.z / cellSize), chunk.dimension[2] - 1), 0);
        //--------- Simplify direction with -1,0,1
        this.dir.xyz(-1, -1, -1); // Start off going in the negative direction, figure out if positive later.
        //--------- Index value to exit loop -1 or Total Cells in Axis
        this.xOut = -1;
        this.yOut = -1;
        this.zOut = -1;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Original code used 9 shorthand ifs, changed it to use 3 regular ifs for optimization.
        // Code initializes going in the negative direction, but now we test if the code needs to 
        // start in the positive direction for each axis and set the variables correctly.
        if (ray.dir[0] >= 0) { // Positive Direction
            this.dir.x = (ray.dir[0] == 0) ? 0 : 1;
            this.xBound = (this.ix + 1) * cellSize;
            if (ray.dir[0] > 0)
                this.xOut = chunk.dimension[0];
        }
        else
            this.xBound = this.ix * cellSize;
        if (ray.dir[1] >= 0) {
            this.dir.y = (ray.dir[1] == 0) ? 0 : 1;
            this.yBound = (this.iy + 1) * cellSize;
            if (ray.dir[1] > 0)
                this.yOut = chunk.dimension[1];
        }
        else
            this.yBound = this.iy * cellSize;
        if (ray.dir[2] >= 0) {
            this.dir.z = (ray.dir[2] == 0) ? 0 : 1;
            this.zBound = (this.iz + 1) * cellSize;
            if (ray.dir[2] > 0)
                this.zOut = chunk.dimension[2];
        }
        else
            this.zBound = this.iz * cellSize;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Time for axis // (xBound - inPos.x) / ray.dir.x,
        this.xt = (this.xBound - this.inPosLoc.x) / ray.dir.x;
        this.yt = (this.yBound - this.inPosLoc.y) / ray.dir.y;
        this.zt = (this.zBound - this.inPosLoc.z) / ray.dir.z;
        // Delta T for each axis as we traverse one voxel at a time
        this.xDelta = cellSize * this.dir.x / ray.dir.x;
        this.yDelta = cellSize * this.dir.y / ray.dir.y;
        this.zDelta = cellSize * this.dir.z / ray.dir.z;
        this.nAxis = this.rayResults.entryAxis; // Axis Vector Component 0:x, 1:y, 2:z
        this.iAxis = [this.ix, this.iy, this.iz][this.nAxis]; // Preselect the initial axis voxel coord.
        // Set the starting voxel
        this.norm.xyz(0, 0, 0);
        this.norm[this.rayResults.entryAxis] = this.rayResults.entryNorm;
        return true;
    }
    // Next Voxel Ray Step
    _step() {
        let ii;
        // Figure out the next voxel to move to based on which t axis value is the smallest first
        // X AXIS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if (this.xt < this.yt && this.xt < this.zt) {
            ii = this.ix + this.dir.x;
            if (ii == this.xOut)
                return true; // When out of bounds of the voxel chunk, we're done.
            this.nAxis = 0; // Numeric Axis Index (x,y,z // 0,1,2)
            this.iAxis = this.ix; // Save before modifing it.
            this.ix = ii; // Move to next voxel
            this.xt += this.xDelta; // Move T so the next loop has a chance to move in a different axis
            // Y AXIS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
        else if (this.yt < this.zt) {
            ii = this.iy + this.dir.y;
            if (ii == this.yOut)
                return true;
            this.nAxis = 1;
            this.iAxis = this.iy;
            this.iy = ii;
            this.yt += this.yDelta;
            // Z AXIS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
        else {
            ii = this.iz + this.dir.z;
            if (ii == this.zOut)
                return true;
            this.nAxis = 2;
            this.iAxis = this.iz;
            this.iz = ii;
            this.zt += this.zDelta;
        }
        return false;
    }
    // Prepare hit data for next voxel step
    _step_next_hit(ray, chunk) {
        // Compute Information for the Next voxel Hit
        this.norm.xyz(0, 0, 0);
        this.norm[this.nAxis] = -this.dir[this.nAxis]; // Update the specific axis
        this.boundPos = ((this.dir[this.nAxis] > 0) ? this.iAxis + 1 : this.iAxis) * chunk.cellSize; // Position of boundary in Local Space
        this.boundPos += chunk.minBound[this.nAxis]; // Move from Local Space to WorldSpace, to figure out T of Ray which is in World Space
        this.ray_t = (this.boundPos - ray.origin[this.nAxis]) / ray.vecLen[this.nAxis]; // Time when at boundary
        ray.posAt(this.ray_t, this.inPos); // Intersection point on voxel face
    }
    //#endregion
    //#region HELPERS
    // Create Hit Result Data for current step
    _new_hit() {
        return new VoxelRayHit(this.ix, this.iy, this.iz, this.inPos, this.norm, this.ray_t);
    }
    //#endregion
    //#region VARIOUS INTERSECT METHODS
    // Run a full ray intersect threw the whole chunk and return hit data for each voxel in the path.
    fullIntersect(ray, chunk, bbox) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if (!bbox)
            bbox = new BoundingBox(chunk.minBound, chunk.maxBound);
        if (!this._init(ray, chunk, bbox))
            return null;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const rtn = [];
        for (let i = 0; i < this.tries; i++) {
            rtn.push(this._new_hit());
            /*
            //-------------------------
            // VISUAL DEBUGGING
            const hit       = this._new_hit();
            const boxMin    = new Vec3();
            const boxMax    = new Vec3();
            chunk.coordBound( hit.coord, boxMin, boxMax );
            
            ln.box( boxMin, boxMax, 0xffffff );                // Display Voxel
            pnt.add( hit.pos, 0x00ff00, 3, 1 );					// Display Intersection Point for Voxel
            ln.add( hit.pos, Vec3.scale( hit.norm, 0.3 ).add( hit.pos ), 0xffffff );    // Display Normal
            //-------------------------
            */
            if (this._step())
                break; // Exit when reaching chunk boundary
            this._step_next_hit(ray, chunk); // Prepare data for next hit.
            if (this.ray_t >= 1)
                break; // Exit if reaching the end of the ray
        }
        return rtn;
    }
}
export default VoxelRay;
/*
intersectsDEBUG( ray, chunk, bbox, tries=30 ){
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Test if the voxel chunk boundary has an intersection
    const rayBox = new AABBRay( ray );
    const result = new RayBBoxResult();
    if( !bbox.rayIntersects( ray, rayBox, result ) ){
        console.log( 'Does not intersect AABB' );
        return null;
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Entry point for chunk, Clean up vals near zero. If Min < 0, origin is in AABB
    // inPos lives in world space, Need to move it to local space to work correctly with the algorithm
    let	inPos		= ray.posAt( Math.max( result.tMin, 0 ) ).nearZero();
    let inPosLoc	= Vec3.sub( inPos, chunk.minBound );       // Intersect position in relation to chunk origin.
    let cellSize	= chunk.cellSize;

    //pnt.add( inPos, 0x00ff00, 3 );

    //--------- Calc Voxel Coord Integer(x,y,z), Clamp between 0 and Max
    let ix			= Math.max( Math.min( Math.floor( inPosLoc.x / cellSize ), chunk.dimension[0]-1 ), 0);
    let iy			= Math.max( Math.min( Math.floor( inPosLoc.y / cellSize ), chunk.dimension[1]-1 ), 0);
    let iz			= Math.max( Math.min( Math.floor( inPosLoc.z / cellSize ), chunk.dimension[2]-1 ), 0);

    //--------- Simplify direction with -1,0,1
    let dir  = new Vec3( -1, -1, -1 );  // Start off going in the negative direction, figure out if positive later.

    //--------- Index value to exit loop -1 or Total Cells in Axis
    let xOut = -1, yOut = -1, zOut = -1;

    //--------- Position of the closest boundary line for each axis at the ray dir. Depends on direction.
    let xBound, yBound, zBound;


    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Original code used 9 shorthand ifs, changed it to use 3 regular ifs for optimization.
    // Code initializes going in the negative direction, but now we test if the code needs to
    // start in the positive direction for each axis and set the variables correctly.

    if( ray.dir[0] >= 0 ){  // Positive Direction
        dir.x	= ( ray.dir[0] == 0 )? 0 : 1;
        xBound	= ( ix + 1 ) * cellSize;

        if( ray.dir[ 0 ] > 0 ) xOut = chunk.dimension[ 0 ];
    }else xBound = ix * cellSize;


    if( ray.dir[1] >= 0 ){
        dir.y	= ( ray.dir[1] == 0 )? 0 : 1;
        yBound	= ( iy + 1 ) * cellSize;

        if( ray.dir[1] > 0 ) yOut = chunk.dimension[ 1 ];
    }else yBound = iy * cellSize;


    if( ray.dir[2] >= 0 ){
        dir.z	= ( ray.dir[2] == 0 )? 0 : 1;
        zBound	= ( iz + 1 ) * cellSize;

        if( ray.dir[2] > 0 ) zOut = chunk.dimension[ 2 ];
    }else zBound = iz * cellSize;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Time for axis // (xBound - inPos.x) / ray.dir.x,
    let	xt			= ( xBound - inPosLoc.x ) / ray.dir.x;
    let	yt 			= ( yBound - inPosLoc.y ) / ray.dir.y;
    let	zt			= ( zBound - inPosLoc.z ) / ray.dir.z;

    // Delta T for each axis as we traverse one voxel at a time
    let	xDelta		= cellSize * dir.x / ray.dir.x;
    let	yDelta		= cellSize * dir.y / ray.dir.y;
    let	zDelta		= cellSize * dir.z / ray.dir.z;

    let	nAxis       = result.entryAxis;     // Axis Vector Component 0:x, 1:y, 2:z
    let	iAxis       = [ix, iy, iz][nAxis];  // Preselect the initial axis voxel coord.
    let	ii          = 0;                    // Voxel Index of a specific axis
    //let	isHit		= false;                // Using Check Data, did we hit a voxel that exists.


    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    let norm		= [ 0, 0, 0 ];
    let boundPos    = null;
    
    norm[ result.entryAxis ] = result.entryNorm;  // Set the starting voxel

    //TODO VARIABLES FOR DEBUGGING, Can remove in final version
    //let tt, offsetPos = tran.pos;	// Help Move inPos to Local Space from World Space
    let tt = 0;

    for( let i=0; i < tries; i++ ){
        //Do something with this voxel
        //if( VoxelChunk.get(chunk, ix, iy, iz) != 0){ isHit = true; break; }

        //-------------------------
        // VISUAL DEBUGGING
        

        let boxMin = new Vec3();
        let boxMax = new Vec3();
        chunk.coordBound( [ix,iy,iz], boxMin, boxMax );
        //if( cellBound != null ){
            ln.box( boxMin,  boxMax, 0xffffff );	// Display Voxel
            console.log( inPos );
            pnt.add( inPos, 0x00ff00, 3, 1 );					// Display Intersection Point for Voxel
            ln.add( inPos, Vec3.scale( norm, 0.3 ).add( inPos ), 0xffffff );	// Display Normal
        //}
        

        //-------------------------
        //Figure out the next voxel to move to based on which t axis value is the smallest first
        if( xt < yt && xt < zt ){	//--------- X AXIS
            ii = ix + dir.x;
            if( ii == xOut ) break;	// When out of bounds of the voxel chunk.
            
            nAxis	= 0;			// Numeric Axis Index (x,y,z // 0,1,2)
            iAxis	= ix;			// Save before modifing it.
            ix		= ii;			// Move to next voxel
            xt		+= xDelta;		// Move T so the next loop has a chance to move in a different axis

        }else if( yt < zt ){		//--------- Y AXIS
            ii = iy + dir.y;
            if( ii == yOut ) break;
            
            nAxis   = 1;
            iAxis   = iy;
            iy      = ii;
            yt      += yDelta;

        }else{					//--------- Z AXIS
            ii = iz + dir.z;
            if( ii == zOut ) break;

            nAxis	= 2;
            iAxis	= iz;
            iz		= ii;
            zt		+= zDelta;
        }

        //-------------------------
        //SETUP INTERSECTION POINT AND NORMAL FOR THE NEXT VOXEL.
        //ONLY USED FOR VISUAL DEBUGGING
        norm[0]		= 0;
        norm[1]		= 0;
        norm[2]		= 0;
        norm[nAxis]	= -dir[nAxis];										// Update the specific axis

        boundPos 	= (( dir[nAxis] > 0)? iAxis+1 : iAxis) * cellSize;			// Position of boundary in Local Space
        boundPos 	+= chunk.minBound[ nAxis ]; 								// Move from Local Space to WorldSpace, to figure out T of Ray which is in World Space

        tt			= ( boundPos - ray.origin[ nAxis ] ) / ray.vecLen[nAxis];	// Time when at boundary
        inPos 		= ray.posAt( tt );										    // Intersection point on voxel face
    }
}
*/ 
