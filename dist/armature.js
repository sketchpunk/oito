import { Vec3, Transform as Transform3 } from "./core.js";
import { Transform } from "./core.js";
var Bone = class {
  constructor(name, idx, len = 0) {
    this.local = new Transform();
    this.world = new Transform();
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
};
var Bone_default = Bone;
import { Quat, Transform as Transform2 } from "./core.js";
var Pose = class {
  constructor(arm) {
    this.offset = new Transform2();
    if (arm) {
      const bCnt = arm.bones.length;
      this.bones = new Array(bCnt);
      this.arm = arm;
      for (let i = 0; i < bCnt; i++) {
        this.bones[i] = arm.bones[i].clone();
      }
      this.offset.copy(this.arm.offset);
    }
  }
  get(bName) {
    const bIdx = this.arm.names.get(bName);
    return bIdx !== void 0 ? this.bones[bIdx] : null;
  }
  getBoneWorldPos(bIdx) {
    return this.bones[bIdx].world.pos.toArray();
  }
  clone() {
    const bCnt = this.bones.length;
    const p = new Pose();
    p.arm = this.arm;
    p.bones = new Array(bCnt);
    p.offset.copy(this.offset);
    for (let i = 0; i < bCnt; i++) {
      p.bones[i] = this.bones[i].clone();
    }
    return p;
  }
  setLocalPos(bone, v) {
    const bIdx = typeof bone === "string" ? this.arm.names.get(bone) : bone;
    if (bIdx != void 0)
      this.bones[bIdx].local.pos.copy(v);
    return this;
  }
  setLocalRot(bone, v) {
    const bIdx = typeof bone === "string" ? this.arm.names.get(bone) : bone;
    if (bIdx != void 0)
      this.bones[bIdx].local.rot.copy(v);
    return this;
  }
  fromGLTF2(glPose) {
    let jnt;
    let b;
    for (jnt of glPose.joints) {
      b = this.bones[jnt.index];
      if (jnt.rot)
        b.local.rot.copy(jnt.rot);
      if (jnt.pos)
        b.local.pos.copy(jnt.pos);
      if (jnt.scl)
        b.local.scl.copy(jnt.scl);
    }
    this.updateWorld();
    return this;
  }
  copy(pose) {
    const bLen = this.bones.length;
    for (let i = 0; i < bLen; i++) {
      this.bones[i].local.copy(pose.bones[i].local);
      this.bones[i].world.copy(pose.bones[i].world);
    }
    return this;
  }
  rotLocal(bone, deg, axis = "x") {
    const bIdx = typeof bone === "string" ? this.arm.names.get(bone) : bone;
    if (bIdx != void 0) {
      const q = this.bones[bIdx].local.rot;
      const rad = deg * Math.PI / 180;
      switch (axis) {
        case "y":
          q.rotY(rad);
          break;
        case "z":
          q.rotZ(rad);
          break;
        default:
          q.rotX(rad);
          break;
      }
    } else
      console.warn("Bone not found, ", bone);
    return this;
  }
  moveLocal(bone, offset) {
    const bIdx = typeof bone === "string" ? this.arm.names.get(bone) : bone;
    if (bIdx != void 0)
      this.bones[bIdx].local.pos.add(offset);
    else
      console.warn("Bone not found, ", bone);
    return this;
  }
  sclLocal(bone, v) {
    const bIdx = typeof bone === "string" ? this.arm.names.get(bone) : bone;
    if (bIdx != void 0) {
      if (Array.isArray(v) || v instanceof Float32Array)
        this.bones[bIdx].local.scl.copy(v);
      else
        this.bones[bIdx].local.scl.xyz(v, v, v);
    } else
      console.warn("Bone not found, ", bone);
    return this;
  }
  updateWorld(useOffset = true) {
    let i, b;
    for (i = 0; i < this.bones.length; i++) {
      b = this.bones[i];
      if (b.pidx != null)
        b.world.fromMul(this.bones[b.pidx].world, b.local);
      else if (useOffset)
        b.world.fromMul(this.offset, b.local);
      else
        b.world.copy(b.local);
    }
    return this;
  }
  getWorldTransform(bIdx, out) {
    out ?? (out = new Transform2());
    let bone = this.bones[bIdx];
    out.copy(bone.local);
    while (bone.pidx != null) {
      bone = this.bones[bone.pidx];
      out.pmul(bone.local);
    }
    out.pmul(this.offset);
    return out;
  }
  getWorldRotation(bIdx, out) {
    out ?? (out = new Quat());
    let bone = this.bones[bIdx];
    out.copy(bone.local.rot);
    while (bone.pidx != null) {
      bone = this.bones[bone.pidx];
      out.pmul(bone.local.rot);
    }
    out.pmul(this.offset.rot);
    return out;
  }
};
var Pose_default = Pose;
var Armature = class {
  constructor() {
    this.names = new Map();
    this.bones = [];
    this.offset = new Transform3();
  }
  addBone(name, pidx, rot, pos, scl) {
    const idx = this.bones.length;
    const bone = new Bone_default(name, idx);
    this.bones.push(bone);
    this.names.set(name, idx);
    if (pos || rot || scl)
      bone.setLocal(rot, pos, scl);
    if (pidx != null && pidx != void 0)
      bone.pidx = pidx;
    return bone;
  }
  bind(skin, defaultBoneLen = 1) {
    this.updateWorld();
    this.updateBoneLengths(defaultBoneLen);
    if (skin)
      this.skin = new skin().init(this);
    return this;
  }
  newPose() {
    return new Pose_default(this);
  }
  getBone(bName) {
    const idx = this.names.get(bName);
    if (idx == void 0)
      return null;
    return this.bones[idx];
  }
  getSkinOffsets() {
    return this.skin ? this.skin.getOffsets() : null;
  }
  updateSkinFromPose(pose) {
    if (this.skin) {
      this.skin.updateFromPose(pose);
      return this.skin.getOffsets();
    }
    return null;
  }
  updateWorld() {
    const bCnt = this.bones.length;
    let b;
    for (let i = 0; i < bCnt; i++) {
      b = this.bones[i];
      if (b.pidx != null)
        b.world.fromMul(this.bones[b.pidx].world, b.local);
      else
        b.world.copy(b.local);
    }
    return this;
  }
  updateBoneLengths(defaultBoneLen = 0) {
    const bCnt = this.bones.length;
    let b, p;
    for (let i = bCnt - 1; i >= 0; i--) {
      b = this.bones[i];
      if (b.pidx == null)
        continue;
      p = this.bones[b.pidx];
      p.len = Vec3.len(p.world.pos, b.world.pos);
    }
    if (defaultBoneLen != 0) {
      for (let i = 0; i < bCnt; i++) {
        b = this.bones[i];
        if (b.len == 0)
          b.len = defaultBoneLen;
      }
    }
    return this;
  }
};
var Armature_default = Armature;
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
BoneMap.BoneInfo = BoneInfo;
BoneMap.BoneChain = BoneChain;
var BoneMap_default = BoneMap;
import { Transform as Transform4 } from "./core.js";
import { Vec3 as Vec32 } from "./core.js";
var SpringBase = class {
  constructor() {
    this.oscPerSec = Math.PI * 2;
    this.damping = 1;
    this.epsilon = 0.01;
  }
  setTarget(v) {
    console.log("SET_TARGET NOT IMPLEMENTED");
    return this;
  }
  setOscPerSec(sec) {
    this.oscPerSec = Math.PI * 2 * sec;
    return this;
  }
  setDamp(damping) {
    this.damping = damping;
    return this;
  }
  setDampRatio(damping, dampTime) {
    this.damping = Math.log(damping) / (-this.oscPerSec * dampTime);
    return this;
  }
  setDampHalfLife(dampTime) {
    this.damping = 0.6931472 / (this.oscPerSec * dampTime);
    return this;
  }
  setDampExpo(dampTime) {
    this.oscPerSec = 0.6931472 / dampTime;
    this.damping = 1;
    return this;
  }
  reset(v) {
    return this;
  }
  update(dt) {
    console.log("UPDATE NOT IMPLEMENTED");
    return false;
  }
};
var SpringBase_default = SpringBase;
var SpringVec3 = class extends SpringBase_default {
  constructor() {
    super(...arguments);
    this.vel = new Vec32();
    this.val = new Vec32();
    this.tar = new Vec32();
    this.epsilon = 1e-6;
  }
  setTarget(v) {
    this.tar.copy(v);
    return this;
  }
  reset(v) {
    this.vel.xyz(0, 0, 0);
    if (v) {
      this.val.copy(v);
      this.tar.copy(v);
    } else {
      this.val.xyz(0, 0, 0);
      this.tar.xyz(0, 0, 0);
    }
    return this;
  }
  update(dt) {
    if (this.vel.isZero() && Vec32.lenSq(this.tar, this.val) == 0)
      return false;
    if (this.vel.lenSq() < this.epsilon && Vec32.lenSq(this.tar, this.val) < this.epsilon) {
      this.vel.xyz(0, 0, 0);
      this.val.copy(this.tar);
      return true;
    }
    let friction = 1 + 2 * dt * this.damping * this.oscPerSec, dt_osc = dt * this.oscPerSec ** 2, dt2_osc = dt * dt_osc, det_inv = 1 / (friction + dt2_osc);
    this.vel[0] = (this.vel[0] + dt_osc * (this.tar[0] - this.val[0])) * det_inv;
    this.vel[1] = (this.vel[1] + dt_osc * (this.tar[1] - this.val[1])) * det_inv;
    this.vel[2] = (this.vel[2] + dt_osc * (this.tar[2] - this.val[2])) * det_inv;
    this.val[0] = (friction * this.val[0] + dt * this.vel[0] + dt2_osc * this.tar[0]) * det_inv;
    this.val[1] = (friction * this.val[1] + dt * this.vel[1] + dt2_osc * this.tar[1]) * det_inv;
    this.val[2] = (friction * this.val[2] + dt * this.vel[2] + dt2_osc * this.tar[2]) * det_inv;
    return true;
  }
};
var SpringVec3_default = SpringVec3;
var SpringItem = class {
  constructor(name, idx) {
    this.spring = new SpringVec3_default();
    this.bind = new Transform4();
    this.name = name;
    this.index = idx;
  }
};
var SpringItem_default = SpringItem;
import { Quat as Quat2, Transform as Transform5, Vec3 as Vec33 } from "./core.js";
var SpringRot = class {
  setRestPose(chain, pose) {
    let si;
    let b;
    let tail = new Vec33();
    for (si of chain.items) {
      b = pose.bones[si.index];
      tail.xyz(0, b.len, 0);
      b.world.transformVec3(tail);
      si.spring.reset(tail);
      si.bind.copy(b.local);
    }
  }
  updatePose(chain, pose, dt) {
    let si;
    let b;
    let tail = new Vec33();
    let pTran = new Transform5();
    let cTran = new Transform5();
    let va = new Vec33();
    let vb = new Vec33();
    let rot = new Quat2();
    si = chain.items[0];
    b = pose.bones[si.index];
    if (b.pidx != null)
      pTran.copy(pose.bones[b.pidx].world);
    else
      pTran.copy(pose.offset);
    for (si of chain.items) {
      b = pose.bones[si.index];
      cTran.fromMul(pTran, si.bind);
      tail.xyz(0, b.len, 0);
      cTran.transformVec3(tail);
      si.spring.setTarget(tail).update(dt);
      va.fromSub(tail, cTran.pos).norm();
      vb.fromSub(si.spring.val, cTran.pos).norm();
      rot.fromUnitVecs(va, vb).dotNegate(cTran.rot).mul(cTran.rot).pmulInvert(pTran.rot);
      b.local.rot.copy(rot);
      pTran.mul(rot, si.bind.pos, si.bind.scl);
    }
  }
};
var SpringRot_default = SpringRot;
import { Transform as Transform6 } from "./core.js";
var SpringPos = class {
  setRestPose(chain, pose) {
    let si;
    let b;
    for (si of chain.items) {
      b = pose.bones[si.index];
      si.spring.reset(b.world.pos);
      si.bind.copy(b.local);
    }
  }
  updatePose(chain, pose, dt) {
    let si;
    let b;
    let pTran = new Transform6();
    let cTran = new Transform6();
    let iTran = new Transform6();
    si = chain.items[0];
    b = pose.bones[si.index];
    if (b.pidx != null)
      pTran.copy(pose.bones[b.pidx].world);
    else
      pTran.copy(pose.offset);
    for (si of chain.items) {
      b = pose.bones[si.index];
      cTran.fromMul(pTran, si.bind);
      si.spring.setTarget(cTran.pos);
      if (!si.spring.update(dt)) {
        pTran.copy(cTran);
        continue;
      }
      iTran.fromInvert(pTran).transformVec3(si.spring.val, b.local.pos);
      pTran.mul(si.bind.rot, b.local.pos, si.bind.scl);
    }
  }
};
var SpringPos_default = SpringPos;
var SpringChain = class {
  constructor(name, type = 0) {
    this.items = [];
    this.name = name;
    this.spring = type == 1 ? new SpringPos_default() : new SpringRot_default();
  }
  setBones(aryName, arm, osc = 5, damp = 0.5) {
    let bn;
    let b;
    let spr;
    for (bn of aryName) {
      b = arm.getBone(bn);
      if (b == null) {
        console.log("Bone not found for spring: ", bn);
        continue;
      }
      spr = new SpringItem_default(b.name, b.idx);
      spr.spring.setDamp(damp);
      spr.spring.setOscPerSec(osc);
      this.items.push(spr);
    }
  }
  setRestPose(pose) {
    this.spring.setRestPose(this, pose);
  }
  updatePose(dt, pose) {
    this.spring.updatePose(this, pose, dt);
  }
};
SpringChain.ROT = 0;
SpringChain.POS = 1;
var SpringChain_default = SpringChain;
var BoneSpring = class {
  constructor(arm) {
    this.items = new Map();
    this.arm = arm;
  }
  addRotChain(chName, bNames, osc = 5, damp = 0.5) {
    const chain = new SpringChain_default(chName, 0);
    chain.setBones(bNames, this.arm, osc, damp);
    this.items.set(chName, chain);
    return this;
  }
  addPosChain(chName, bNames, osc = 5, damp = 0.5) {
    const chain = new SpringChain_default(chName, 1);
    chain.setBones(bNames, this.arm, osc, damp);
    this.items.set(chName, chain);
    return this;
  }
  setRestPose(pose) {
    let ch;
    for (ch of this.items.values()) {
      ch.setRestPose(pose);
    }
    return this;
  }
  updatePose(dt, pose, doWorldUpdate) {
    let ch;
    for (ch of this.items.values()) {
      ch.updatePose(dt, pose);
    }
    if (doWorldUpdate)
      pose.updateWorld(true);
    return this;
  }
  setOsc(chName, osc) {
    const ch = this.items.get(chName);
    if (!ch) {
      console.error("Spring Chain name not found", chName);
      return this;
    }
    let si;
    for (si of ch.items)
      si.spring.setOscPerSec(osc);
    return this;
  }
  setOscRange(chName, a, b) {
    const ch = this.items.get(chName);
    if (!ch) {
      console.error("Spring Chain name not found", chName);
      return this;
    }
    const len = ch.items.length - 1;
    let t;
    for (let i = 0; i <= len; i++) {
      t = i / len;
      ch.items[i].spring.setOscPerSec(a * (1 - t) + b * t);
    }
    return this;
  }
  setDamp(chName, damp) {
    const ch = this.items.get(chName);
    if (!ch) {
      console.error("Spring Chain name not found", chName);
      return this;
    }
    let si;
    for (si of ch.items)
      si.spring.setDamp(damp);
    return this;
  }
  setDampRange(chName, a, b) {
    const ch = this.items.get(chName);
    if (!ch) {
      console.error("Spring Chain name not found", chName);
      return this;
    }
    const len = ch.items.length - 1;
    let t;
    for (let i = 0; i <= len; i++) {
      t = i / len;
      ch.items[i].spring.setDamp(a * (1 - t) + b * t);
    }
    return this;
  }
};
var bonespring_default = BoneSpring;
import { Mat4 } from "./core.js";
var COMP_LEN = 16;
var BYTE_LEN = COMP_LEN * 4;
var SkinMTX = class {
  init(arm) {
    const mat4Identity = new Mat4();
    const bCnt = arm.bones.length;
    const world = new Array(bCnt);
    const bind = new Array(bCnt);
    this.offsetBuffer = new Float32Array(16 * bCnt);
    for (let i = 0; i < bCnt; i++) {
      world[i] = new Mat4();
      bind[i] = new Mat4();
    }
    let b;
    for (let i = 0; i < bCnt; i++) {
      b = arm.bones[i];
      world[i].fromQuatTranScale(b.local.rot, b.local.pos, b.local.scl);
      if (b.pidx != null)
        world[i].pmul(world[b.pidx]);
      bind[i].fromInvert(world[i]);
      mat4Identity.toBuf(this.offsetBuffer, i * 16);
    }
    this.bind = bind;
    this.world = world;
    return this;
  }
  updateFromPose(pose) {
    const offset = new Mat4();
    offset.fromQuatTranScale(pose.offset.rot, pose.offset.pos, pose.offset.scl);
    const bOffset = new Mat4();
    let i, b;
    for (i = 0; i < pose.bones.length; i++) {
      b = pose.bones[i];
      this.world[i].fromQuatTranScale(b.local.rot, b.local.pos, b.local.scl);
      if (b.pidx != null)
        this.world[i].pmul(this.world[b.pidx]);
      else
        this.world[i].pmul(offset);
      bOffset.fromMul(this.world[i], this.bind[i]).toBuf(this.offsetBuffer, i * 16);
    }
    return this;
  }
  getOffsets() {
    return [this.offsetBuffer];
  }
  getTextureInfo(frameCount) {
    const boneCount = this.bind.length;
    const strideFloatLength = COMP_LEN;
    const strideByteLength = BYTE_LEN;
    const pixelsPerStride = COMP_LEN / 4;
    const floatRowSize = COMP_LEN * frameCount;
    const bufferFloatSize = floatRowSize * boneCount;
    const bufferByteSize = bufferFloatSize * 4;
    const pixelWidth = pixelsPerStride * frameCount;
    const pixelHeight = boneCount;
    const o = {
      boneCount,
      strideFloatLength,
      strideByteLength,
      pixelsPerStride,
      floatRowSize,
      bufferFloatSize,
      bufferByteSize,
      pixelWidth,
      pixelHeight
    };
    return o;
  }
};
var SkinMTX_default = SkinMTX;
import DualQuat from "./core.extend/DualQuat.js";
import { Vec4 } from "./core.js";
var COMP_LEN2 = 8;
var BYTE_LEN2 = COMP_LEN2 * 4;
var SkinDQ = class {
  init(arm) {
    const bCnt = arm.bones.length;
    const world = new Array(bCnt);
    const bind = new Array(bCnt);
    const qIdent = new Vec4(0, 0, 0, 1);
    const pIdent = new Vec4(0, 0, 0, 0);
    this.offsetQBuffer = new Float32Array(4 * bCnt);
    this.offsetPBuffer = new Float32Array(4 * bCnt);
    for (let i = 0; i < bCnt; i++) {
      world[i] = new DualQuat();
      bind[i] = new DualQuat();
      qIdent.toBuf(this.offsetQBuffer, i * 4);
      pIdent.toBuf(this.offsetPBuffer, i * 4);
    }
    let b;
    for (let i = 0; i < bCnt; i++) {
      b = arm.bones[i];
      world[i].fromQuatTran(b.local.rot, b.local.pos);
      if (b.pidx != null)
        world[i].pmul(world[b.pidx]);
      bind[i].fromInvert(world[i]);
    }
    this.bind = bind;
    this.world = world;
    return this;
  }
  updateFromPose(pose) {
    const offset = new DualQuat();
    offset.fromQuatTran(pose.offset.rot, pose.offset.pos);
    const bOffset = new DualQuat();
    let i, b, ii;
    for (i = 0; i < pose.bones.length; i++) {
      b = pose.bones[i];
      this.world[i].fromQuatTran(b.local.rot, b.local.pos);
      if (b.pidx != null)
        this.world[i].pmul(this.world[b.pidx]);
      else
        this.world[i].pmul(offset);
      bOffset.fromMul(this.world[i], this.bind[i]);
      ii = i * 4;
      this.offsetQBuffer[ii + 0] = bOffset[0];
      this.offsetQBuffer[ii + 1] = bOffset[1];
      this.offsetQBuffer[ii + 2] = bOffset[2];
      this.offsetQBuffer[ii + 3] = bOffset[3];
      this.offsetPBuffer[ii + 0] = bOffset[4];
      this.offsetPBuffer[ii + 1] = bOffset[5];
      this.offsetPBuffer[ii + 2] = bOffset[6];
      this.offsetPBuffer[ii + 3] = bOffset[7];
    }
    return this;
  }
  getOffsets() {
    return [this.offsetQBuffer, this.offsetPBuffer];
  }
  getTextureInfo(frameCount) {
    const boneCount = this.bind.length;
    const strideByteLength = BYTE_LEN2;
    const strideFloatLength = COMP_LEN2;
    const pixelsPerStride = COMP_LEN2 / 4;
    const floatRowSize = COMP_LEN2 * frameCount;
    const bufferFloatSize = floatRowSize * boneCount;
    const bufferByteSize = bufferFloatSize * 4;
    const pixelWidth = pixelsPerStride * frameCount;
    const pixelHeight = boneCount;
    const o = {
      boneCount,
      strideByteLength,
      strideFloatLength,
      pixelsPerStride,
      floatRowSize,
      bufferFloatSize,
      bufferByteSize,
      pixelWidth,
      pixelHeight
    };
    return o;
  }
};
var SkinDQ_default = SkinDQ;
var src_default = Armature_default;
export {
  Armature_default as Armature,
  Bone_default as Bone,
  BoneMap_default as BoneMap,
  bonespring_default as BoneSpring,
  Pose_default as Pose,
  SkinDQ_default as SkinDQ,
  SkinMTX_default as SkinMTX,
  src_default as default
};
