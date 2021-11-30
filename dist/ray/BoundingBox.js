//#region IMPORT
import Vec3 from '../Vec3.js';
//#endregion
class RayBBoxResult {
    tMin = 0; // 0 > 1
    tMax = 0; // 0 > 1
    entryAxis = 0; // 0 : X, 1 : Y, 2 : Z
    entryNorm = 0; // -1 or 1 , Positive or Negative Axis
    exitAxis = 0; // 0 : X, 1 : Y, 2 : Z
    exitNorm = 0; // -1 or 1 , Positive or Negative Axis
    //constructor(){}
    getEntryNorm(out, scl = 1) { return out.fromScale(Vec3.AXIS[this.entryAxis], this.entryNorm).scale(scl); }
    getExitNorm(out, scl = 1) { return out.fromScale(Vec3.AXIS[this.exitAxis], this.exitNorm).scale(scl); }
}
// Optimization trick from ScratchAPixel
class AABBRay {
    vecLenInv = new Vec3();
    dir = [0, 0, 0];
    constructor(ray) {
        if (ray)
            this.fromRay(ray);
    }
    fromRay(ray) {
        this.vecLenInv.fromInvert(ray.vecLen);
        // Determine which bound will result in tMin so there will be no need to test if tMax < tMin to swop.
        this.dir[0] = (this.vecLenInv.x < 0) ? 1 : 0;
        this.dir[1] = (this.vecLenInv.y < 0) ? 1 : 0;
        this.dir[2] = (this.vecLenInv.z < 0) ? 1 : 0;
    }
}
class BoundingBox {
    bounds = [new Vec3(), new Vec3()];
    constructor(min, max) {
        if (min && max)
            this.setBounds(min, max);
    }
    get min() { return this.bounds[0]; }
    set min(v) { this.bounds[0].copy(v); }
    get max() { return this.bounds[1]; }
    set max(v) { this.bounds[1].copy(v); }
    setBounds(min, max) {
        this.bounds[0].copy(min);
        this.bounds[1].copy(max);
        return this;
    }
    rayIntersects(ray, raybox, results) {
        let tMin, tMax, min, max, minAxis = 0, maxAxis = 0;
        const bounds = this.bounds;
        //X Axis ---------------------------
        tMin = (bounds[raybox.dir[0]].x - ray.origin.x) * raybox.vecLenInv.x;
        tMax = (bounds[1 - raybox.dir[0]].x - ray.origin.x) * raybox.vecLenInv.x;
        //Y Axis ---------------------------
        min = (bounds[raybox.dir[1]].y - ray.origin.y) * raybox.vecLenInv.y;
        max = (bounds[1 - raybox.dir[1]].y - ray.origin.y) * raybox.vecLenInv.y;
        if (max < tMin || min > tMax)
            return false; // if it criss crosses, its a miss
        if (min > tMin) {
            tMin = min;
            minAxis = 1;
        } // Get the greatest min
        if (max < tMax) {
            tMax = max;
            maxAxis = 1;
        } // Get the smallest max
        //Z Axis ---------------------------
        min = (bounds[raybox.dir[2]].z - ray.origin.z) * raybox.vecLenInv.z;
        max = (bounds[1 - raybox.dir[2]].z - ray.origin.z) * raybox.vecLenInv.z;
        if (max < tMin || min > tMax)
            return false; // if criss crosses, its a miss
        if (min > tMin) {
            tMin = min;
            minAxis = 2;
        } // Get the greatest min
        if (max < tMax) {
            tMax = max;
            maxAxis = 2;
        } // Get the smallest max
        //Finish ------------------------------
        //var ipos = dir.clone().scale(tMin).add(ray.start); //with the shortist distance from start of ray, calc intersection
        if (results) {
            results.tMin = tMin;
            results.tMax = tMax;
            results.entryAxis = minAxis; // 0 : X, 1 : Y, 2 : Z
            results.entryNorm = (raybox.dir[minAxis] == 1) ? 1 : -1;
            results.exitAxis = maxAxis;
            results.exitNorm = (raybox.dir[maxAxis] == 1) ? -1 : 1;
        }
        return true;
    }
    rayIntersect(ray, results) {
        let tmin, tmax, tymin, tymax, tzmin, tzmax;
        const xinv = 1 / ray.dir[0], yinv = 1 / ray.dir[1], zinv = 1 / ray.dir[2];
        let minAxis = 0, maxAxis = 0;
        //X Axis ---------------------------
        if (xinv >= 0) {
            tmin = (this.min[0] - ray.origin[0]) * xinv;
            tmax = (this.max[0] - ray.origin[0]) * xinv;
        }
        else {
            tmin = (this.max[0] - ray.origin[0]) * xinv;
            tmax = (this.min[0] - ray.origin[0]) * xinv;
        }
        //Y Axis ---------------------------
        if (yinv >= 0) {
            tymin = (this.min.y - ray.origin.y) * yinv;
            tymax = (this.max.y - ray.origin.y) * yinv;
        }
        else {
            tymin = (this.max.y - ray.origin.y) * yinv;
            tymax = (this.min.y - ray.origin.y) * yinv;
        }
        if (tmin > tymax || tymin > tmax)
            return false;
        // These lines also handle the case where tmin or tmax is NaN
        // (result of 0 * Infinity). x !== x returns true if x is NaN
        if (tymin > tmin || tmin !== tmin) {
            tmin = tymin;
            minAxis = 1;
        }
        if (tymax < tmax || tmax !== tmax) {
            tmax = tymax;
            maxAxis = 1;
        }
        //Z Axis ---------------------------
        if (zinv >= 0) {
            tzmin = (this.min.z - ray.origin.z) * zinv;
            tzmax = (this.max.z - ray.origin.z) * zinv;
        }
        else {
            tzmin = (this.max.z - ray.origin.z) * zinv;
            tzmax = (this.min.z - ray.origin.z) * zinv;
        }
        if (tmin > tzmax || tzmin > tmax)
            return false;
        if (tzmin > tmin || tmin !== tmin) {
            tmin = tzmin;
            minAxis = 2;
        }
        if (tzmax < tmax || tmax !== tmax) {
            tmax = tzmax;
            maxAxis = 2;
        }
        if (tmax < 0)
            return false;
        //Finish ------------------------------
        if (results) {
            if (tmin >= 0) {
                results.tMin = tmin;
                results.tMax = tmax;
            }
            else {
                results.tMin = tmax;
                results.tMax = tmin;
            }
            const inv = [xinv, yinv, zinv];
            results.entryAxis = minAxis; // 0 : X, 1 : Y, 2 : Z
            results.entryNorm = (inv[minAxis] < 0) ? 1 : -1;
            results.exitAxis = maxAxis;
            results.exitNorm = (inv[maxAxis] < 0) ? -1 : 1;
        }
        return true;
    }
}
export { BoundingBox, AABBRay, RayBBoxResult };
