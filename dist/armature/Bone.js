import Transform from '../Transform.js';
class Bone {
    name; // Name of Bone
    idx; // Bone Index
    pidx; // Index to Parent Bone if not root
    len; // Length of the Bone
    local = new Transform(); // Local Transform of Resting Pose
    world = new Transform(); // World Transform of Resting Pose
    constructor(name, idx, len = 0) {
        this.name = name;
        this.idx = idx;
        this.pidx = null;
        this.len = len;
    }
    setLocal(rot, pos, scl) {
        if (rot)
            this.local.rot.copy(rot);
        if (pos)
            this.local.pos.copy(pos);
        if (scl)
            this.local.scl.copy(scl);
        return this;
    }
    clone() {
        const b = new Bone(this.name, this.idx, this.len);
        b.pidx = this.pidx;
        b.local.copy(this.local);
        b.world.copy(this.world);
        return b;
    }
}
export default Bone;
