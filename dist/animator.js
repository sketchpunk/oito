function mod(a, b) {
  const v = a % b;
  return v < 0 ? b + v : v;
}
var FrameInfo = class {
  constructor() {
    this.kt0 = 0;
    this.kt1 = 0;
    this.k0 = -1;
    this.k1 = -1;
    this.t = 0;
    this.ti = 0;
  }
};
var Animator = class {
  constructor() {
    this.frameInfo = [];
    this.clock = 0;
    this.inPlace = false;
  }
  setClip(c) {
    this.clip = c;
    return this;
  }
  update(deltaTime) {
    this.clock = (this.clock + deltaTime) % this.clip.duration;
    this._computeFrameInfo();
    return this;
  }
  applyPose(pose) {
    if (!this.clip)
      return this;
    let t;
    for (t of this.clip.tracks) {
      t.apply(pose, this.frameInfo[t.timeStampIndex]);
    }
    if (this.inPlace) {
      const bPos = pose.bones[0].local.pos;
      bPos.y = 0;
    }
    return this;
  }
  _computeFrameInfo() {
    if (!this.clip)
      return;
    const aryFi = this.frameInfo;
    const aryTs = this.clip.timeStamps;
    const time = this.clock;
    if (aryFi.length < aryTs.length) {
      for (let i = aryFi.length; i < aryTs.length; i++)
        aryFi.push(new FrameInfo());
    }
    let ts;
    let fi;
    let tLen;
    for (let i = 0; i < aryTs.length; i++) {
      ts = aryTs[i];
      fi = aryFi[i];
      tLen = ts.length;
      if (tLen == 0) {
        fi.t = 1;
        fi.ti = 0;
        fi.k0 = 0;
        fi.k1 = 0;
        fi.kt0 = 0;
        fi.kt1 = 0;
        continue;
      }
      if (fi.k0 != -1 && time >= ts[fi.k0] && time <= ts[fi.k1]) {
      } else {
        let imin = 0, mi = 0, imax = ts.length - 1;
        while (imin < imax) {
          mi = imin + imax >>> 1;
          if (time < ts[mi])
            imax = mi;
          else
            imin = mi + 1;
        }
        if (imax <= 0) {
          fi.k0 = 0;
          fi.k1 = 1;
        } else {
          fi.k0 = imax - 1;
          fi.k1 = imax;
        }
        fi.kt0 = mod(fi.k0 - 1, tLen);
        fi.kt1 = mod(fi.k1 + 1, tLen);
      }
      fi.t = (time - ts[fi.k0]) / (ts[fi.k1] - ts[fi.k0]);
      fi.ti = 1 - fi.t;
    }
  }
};
var Animator_default = Animator;
import { Vec3, Quat } from "./core.js";
var TypePool = class {
  static vec3() {
    let v = this._vec3Pool.pop();
    if (!v)
      v = new Vec3();
    return v;
  }
  static quat() {
    let v = this._quatPool.pop();
    if (!v)
      v = new Quat();
    return v;
  }
  static recycle_vec3(...ary) {
    let v;
    for (v of ary)
      this._vec3Pool.push(v.xyz(0, 0, 0));
    return this;
  }
  static recycle_quat(...ary) {
    let v;
    for (v of ary)
      this._quatPool.push(v.xyzw(0, 0, 0, 1));
    return this;
  }
};
TypePool._vec3Pool = [];
TypePool._quatPool = [];
var TypePool_default = TypePool;
var ELerp = {
  Step: 0,
  Linear: 1,
  Cubic: 2
};
function vec3_step(track, fi, out) {
  return out.fromBuf(track.values, fi.k0 * 3);
}
function vec3_linear(track, fi, out) {
  const v0 = TypePool_default.vec3();
  const v1 = TypePool_default.vec3();
  v0.fromBuf(track.values, fi.k0 * 3);
  v1.fromBuf(track.values, fi.k1 * 3);
  out.fromLerp(v0, v1, fi.t);
  TypePool_default.recycle_vec3(v0, v1);
  return out;
}
function quat_step(track, fi, out) {
  return out.fromBuf(track.values, fi.k0 * 4);
}
function quat_linear(track, fi, out) {
  const v0 = TypePool_default.quat();
  const v1 = TypePool_default.quat();
  v0.fromBuf(track.values, fi.k0 * 4);
  v1.fromBuf(track.values, fi.k1 * 4);
  out.fromNBlend(v0, v1, fi.t);
  TypePool_default.recycle_quat(v0, v1);
  return out;
}
var Vec3Track = class {
  constructor() {
    this.name = "Vec3Track";
    this.boneIndex = -1;
    this.timeStampIndex = -1;
    this.fnLerp = vec3_linear;
  }
  setInterpolation(i) {
    switch (i) {
      case ELerp.Step:
        this.fnLerp = vec3_step;
        break;
      case ELerp.Linear:
        this.fnLerp = vec3_linear;
        break;
      case ELerp.Cubic:
        console.warn("Vec3 Cubic Lerp Not Implemented");
        break;
    }
    return this;
  }
  apply(pose, fi) {
    const v = TypePool_default.vec3();
    pose.setLocalPos(this.boneIndex, this.fnLerp(this, fi, v));
    TypePool_default.recycle_vec3(v);
    return this;
  }
};
var QuatTrack = class {
  constructor() {
    this.name = "QuatTrack";
    this.boneIndex = -1;
    this.timeStampIndex = -1;
    this.fnLerp = quat_linear;
  }
  setInterpolation(i) {
    switch (i) {
      case ELerp.Step:
        this.fnLerp = quat_step;
        break;
      case ELerp.Linear:
        this.fnLerp = quat_linear;
        break;
      case ELerp.Cubic:
        console.warn("Quat Cubic Lerp Not Implemented");
        break;
    }
    return this;
  }
  apply(pose, fi) {
    const v = TypePool_default.quat();
    pose.setLocalRot(this.boneIndex, this.fnLerp(this, fi, v));
    TypePool_default.recycle_quat(v);
    return this;
  }
};
var Clip = class {
  constructor() {
    this.name = "";
    this.frameCount = 0;
    this.duration = 0;
    this.tracks = [];
    this.timeStamps = [];
  }
  static fromGLTF2(anim) {
    const clip = new Clip();
    clip.name = anim.name;
    let i;
    for (i of anim.timestamps) {
      if (i.data)
        clip.timeStamps.push(new Float32Array(i.data));
      if (i.elementCnt > clip.frameCount)
        clip.frameCount = i.elementCnt;
      if (i.boundMax && i.boundMax[0] > clip.duration)
        clip.duration = i.boundMax[0];
    }
    let t;
    let track;
    for (t of anim.tracks) {
      if (t.transform == 1 && t.jointIndex != 0)
        continue;
      switch (t.transform) {
        case 0:
          track = new QuatTrack();
          break;
        case 1:
          track = new Vec3Track();
          break;
        case 2:
          continue;
          break;
        default:
          console.error("unknown animation track transform", t.transform);
          continue;
          break;
      }
      switch (t.interpolation) {
        case 0:
          track.setInterpolation(ELerp.Step);
          break;
        case 1:
          track.setInterpolation(ELerp.Linear);
          break;
        case 2:
          track.setInterpolation(ELerp.Cubic);
          break;
      }
      if (t.keyframes.data)
        track.values = new Float32Array(t.keyframes.data);
      else
        console.error("Track has no keyframe data");
      track.timeStampIndex = t.timeStampIndex;
      track.boneIndex = t.jointIndex;
      clip.tracks.push(track);
    }
    return clip;
  }
};
var Clip_default = Clip;
import { Vec3 as Vec32, Quat as Quat2 } from "./core.js";
var BoneParse = class {
  constructor(name, isLR, reFind, reExclude, isChain = false) {
    this.name = name;
    this.isLR = isLR;
    this.isChain = isChain;
    this.reFind = new RegExp(reFind, "i");
    if (reExclude)
      this.reExclude = new RegExp(reExclude, "i");
  }
  test(bname) {
    if (!this.reFind.test(bname))
      return null;
    if (this.reExclude && this.reExclude.test(bname))
      return null;
    if (this.isLR && reLeft.test(bname))
      return this.name + "_l";
    if (this.isLR && reRight.test(bname))
      return this.name + "_r";
    return this.name;
  }
};
var reLeft = new RegExp("\\.l|left|_l", "i");
var reRight = new RegExp("\\.r|right|_r", "i");
var Parsers = [
  new BoneParse("thigh", true, "thigh|up.*leg", "twist"),
  new BoneParse("shin", true, "shin|leg|calf", "up|twist"),
  new BoneParse("foot", true, "foot"),
  new BoneParse("shoulder", true, "clavicle|shoulder"),
  new BoneParse("upperarm", true, "(upper.*arm|arm)", "fore|twist|lower"),
  new BoneParse("forearm", true, "forearm|arm", "up|twist"),
  new BoneParse("hand", true, "hand", "thumb|index|middle|ring|pinky"),
  new BoneParse("head", false, "head"),
  new BoneParse("neck", false, "neck"),
  new BoneParse("hip", false, "hips*|pelvis"),
  new BoneParse("spine", false, "spine.*d*|chest", void 0, true)
];
var BoneChain = class {
  constructor() {
    this.items = [];
  }
};
var BoneInfo = class {
  constructor(idx, name) {
    this.index = idx;
    this.name = name;
  }
};
var BoneMap = class {
  constructor(arm) {
    this.bones = new Map();
    let i;
    let b;
    let bp;
    let key;
    for (i = 0; i < arm.bones.length; i++) {
      b = arm.bones[i];
      for (bp of Parsers) {
        if (!(key = bp.test(b.name)))
          continue;
        if (!this.bones.has(key)) {
          if (bp.isChain) {
            const ch = new BoneChain();
            ch.items.push(new BoneInfo(i, b.name));
            this.bones.set(key, ch);
          } else {
            this.bones.set(key, new BoneInfo(i, b.name));
          }
        } else {
          if (bp.isChain) {
            const ch = this.bones.get(bp.name);
            if (ch && ch instanceof BoneChain)
              ch.items.push(new BoneInfo(i, b.name));
          }
        }
        break;
      }
    }
  }
};
var BoneMap_default = BoneMap;
var Source = class {
  constructor(arm) {
    this.posHip = new Vec32();
    this.arm = arm;
    this.pose = arm.newPose();
  }
};
var BoneLink = class {
  constructor(fIdx, fName, tIdx, tName) {
    this.quatFromParent = new Quat2();
    this.quatDotCheck = new Quat2();
    this.wquatFromTo = new Quat2();
    this.toWorldLocal = new Quat2();
    this.fromIndex = fIdx;
    this.fromName = fName;
    this.toIndex = tIdx;
    this.toName = tName;
  }
  bind(fromTPose, toTPose) {
    const fBone = fromTPose.bones[this.fromIndex];
    const tBone = toTPose.bones[this.toIndex];
    this.quatFromParent.copy(fBone.pidx != null ? fromTPose.bones[fBone.pidx].world.rot : fromTPose.offset.rot);
    if (tBone.pidx != null)
      this.toWorldLocal.fromInvert(toTPose.bones[tBone.pidx].world.rot);
    else
      this.toWorldLocal.fromInvert(toTPose.offset.rot);
    this.wquatFromTo.fromInvert(fBone.world.rot).mul(tBone.world.rot);
    this.quatDotCheck.copy(fBone.world.rot);
    return this;
  }
};
var Retarget = class {
  constructor() {
    this.hipScale = 1;
    this.anim = new Animator_default();
    this.map = new Map();
  }
  setClip(c) {
    this.anim.setClip(c);
    return this;
  }
  setClipArmature(arm) {
    this.from = new Source(arm);
    return this;
  }
  setClipPoseOffset(rot, pos, scl) {
    const p = this.from.pose;
    if (rot)
      p.offset.rot.copy(rot);
    if (pos)
      p.offset.pos.copy(pos);
    if (scl)
      p.offset.scl.copy(scl);
    return this;
  }
  setTargetArmature(arm) {
    this.to = new Source(arm);
    return this;
  }
  getClipPose(doUpdate = false, incOffset = false) {
    if (doUpdate)
      this.from.pose.updateWorld(incOffset);
    return this.from.pose;
  }
  getTargetPose(doUpdate = false, incOffset = false) {
    if (doUpdate)
      this.to.pose.updateWorld(incOffset);
    return this.to.pose;
  }
  bind() {
    const mapFrom = new BoneMap_default(this.from.arm);
    const mapTo = new BoneMap_default(this.to.arm);
    this.from.pose.updateWorld(true);
    this.to.pose.updateWorld(true);
    let i, fLen, tLen, len, lnk, k, bFrom, bTo;
    for ([k, bFrom] of mapFrom.bones) {
      bTo = mapTo.bones.get(k);
      if (!bTo) {
        console.warn("Target missing bone :", k);
        continue;
      }
      if (bFrom instanceof BoneInfo && bTo instanceof BoneInfo) {
        lnk = new BoneLink(bFrom.index, bFrom.name, bTo.index, bTo.name);
        lnk.bind(this.from.pose, this.to.pose);
        this.map.set(k, lnk);
      } else if (bFrom instanceof BoneChain && bTo instanceof BoneChain) {
        fLen = bFrom.items.length;
        tLen = bTo.items.length;
        if (fLen == 1 && tLen == 1) {
          this.map.set(k, new BoneLink(bFrom.items[0].index, bFrom.items[0].name, bTo.items[0].index, bTo.items[0].name).bind(this.from.pose, this.to.pose));
        } else if (fLen >= 2 && tLen >= 2) {
          this.map.set(k + "_0", new BoneLink(bFrom.items[0].index, bFrom.items[0].name, bTo.items[0].index, bTo.items[0].name).bind(this.from.pose, this.to.pose));
          this.map.set(k + "_x", new BoneLink(bFrom.items[fLen - 1].index, bFrom.items[fLen - 1].name, bTo.items[tLen - 1].index, bTo.items[tLen - 1].name).bind(this.from.pose, this.to.pose));
          for (i = 1; i < Math.min(fLen - 1, tLen - 1); i++) {
            lnk = new BoneLink(bFrom.items[i].index, bFrom.items[i].name, bTo.items[i].index, bTo.items[i].name);
            lnk.bind(this.from.pose, this.to.pose);
            this.map.set(k + "_" + i, lnk);
          }
        } else {
          len = Math.min(bFrom.items.length, bTo.items.length);
          for (i = 0; i < len; i++) {
            lnk = new BoneLink(bFrom.items[i].index, bFrom.items[i].name, bTo.items[i].index, bTo.items[i].name);
            lnk.bind(this.from.pose, this.to.pose);
            this.map.set(k + "_" + i, lnk);
          }
        }
      } else {
        console.warn("Bone Mapping is mix match of info and chain", k);
      }
    }
    const hip = this.map.get("hip");
    if (hip) {
      const fBone = this.from.pose.bones[hip.fromIndex];
      const tBone = this.to.pose.bones[hip.toIndex];
      this.from.posHip.copy(fBone.world.pos).nearZero();
      this.to.posHip.copy(tBone.world.pos).nearZero();
      this.hipScale = Math.abs(this.to.posHip.y / this.from.posHip.y);
    }
    return true;
  }
  animateNext(dt) {
    this.anim.update(dt).applyPose(this.from.pose);
    this.from.pose.updateWorld(true);
    this.applyRetarget();
    this.to.pose.updateWorld(true);
  }
  applyRetarget() {
    const fPose = this.from.pose.bones;
    const tPose = this.to.pose.bones;
    const diff = new Quat2();
    const tmp = new Quat2();
    let fBone;
    let tBone;
    let bl;
    for (bl of this.map.values()) {
      fBone = fPose[bl.fromIndex];
      tBone = tPose[bl.toIndex];
      diff.fromMul(bl.quatFromParent, fBone.local.rot);
      if (Quat2.dot(diff, bl.quatDotCheck) < 0)
        diff.mul(tmp.fromNegate(bl.wquatFromTo));
      else
        diff.mul(bl.wquatFromTo);
      diff.pmul(bl.toWorldLocal);
      tBone.local.rot.copy(diff);
    }
    const hip = this.map.get("hip");
    if (hip) {
      const fBone2 = this.from.pose.bones[hip.fromIndex];
      const tBone2 = this.to.pose.bones[hip.toIndex];
      const v = Vec32.sub(fBone2.world.pos, this.from.posHip).scale(this.hipScale).add(this.to.posHip);
      tBone2.local.pos.copy(v);
    }
  }
};
var Retarget_default = Retarget;
export {
  Animator_default as Animator,
  Clip_default as Clip,
  QuatTrack,
  Retarget_default as Retarget,
  Vec3Track
};
