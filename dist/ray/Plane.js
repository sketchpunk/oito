import Vec3 from "../Vec3.js";
class Plane {
    pos = new Vec3();
    normal = new Vec3();
    constant = 0;
    //#region SETTERS / GETTERS
    fromNormAndPos(norm, pos) {
        this.normal.copy(norm);
        this.constant = -Vec3.dot(pos, norm);
        return this;
    }
    //#endregion //////////////////////////////////////////
    //#region OPERATIONS
    negate() {
        this.constant *= -1;
        this.normal.negate();
        return this;
    }
    norm() {
        const len = this.normal.len();
        if (len != 0) {
            const invLen = 1.0 / len;
            this.normal.scale(invLen);
            this.constant *= invLen;
        }
        return this;
    }
    translate(offset) {
        this.constant -= Vec3.dot(offset, this.normal);
        return this;
    }
    //#endregion //////////////////////////////////////////
    //#region MATHs
    distanceToPoint(pos) { return Vec3.dot(this.normal, pos) + this.constant; }
    distanceToSphere(spherePos, radius) { return this.distanceToPoint(spherePos) - radius; }
    projectPoint(pos, out) { return out.fromScale(this.normal, -this.distanceToPoint(pos)).add(pos); }
}
export default Plane;
