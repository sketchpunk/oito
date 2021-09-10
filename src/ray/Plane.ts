import Vec3 from "../Vec3.js";

class Plane{
    pos         = new Vec3();
    normal      = new Vec3();
    constant    = 0;

    //#region SETTERS / GETTERS
    fromNormAndPos( norm: TVec3, pos: TVec3 ) : Plane{
		this.normal.copy( norm );
		this.constant = -Vec3.dot( pos, norm );
		return this;

	}
    //#endregion //////////////////////////////////////////

    //#region OPERATIONS
	negate() : Plane{
        this.constant *= - 1;
        this.normal.negate();
        return this;
	}

	norm() : Plane{
        const len = this.normal.len();
        if( len != 0 ){
            const invLen = 1.0 / len;
            this.normal.scale( invLen );
            this.constant *= invLen;
        }
		return this;
	}

	translate( offset: TVec3 ) : Plane {
		this.constant -= Vec3.dot( offset, this.normal );
		return this;
	}

    //#endregion //////////////////////////////////////////

    //#region MATHs
    distanceToPoint( pos: TVec3 ) : number{ return Vec3.dot( this.normal, pos ) + this.constant; }
    distanceToSphere( spherePos: TVec3, radius: number ) : number{ return this.distanceToPoint( spherePos ) - radius; }

    projectPoint( pos: TVec3, out: Vec3 ) : Vec3{ return out.fromScale( this.normal, -this.distanceToPoint( pos ) ).add( pos ); }

    //#endregion //////////////////////////////////////////
}

export default Plane;