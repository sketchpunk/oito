var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
import { Quat, Vec3, Transform } from "./core.js";
var Link = class {
  constructor(idx, len) {
    this.bind = new Transform();
    this.effectorDir = [0, 1, 0];
    this.poleDir = [0, 0, 1];
    this.idx = idx;
    this.pidx = -1;
    this.len = len;
  }
  static fromBone(b) {
    const l = new Link(b.idx, b.len);
    l.bind.copy(b.local);
    l.pidx = b.pidx != null ? b.pidx : -1;
    return l;
  }
};
var IKChain = class {
  constructor(bName, arm) {
    this.links = [];
    this.solver = null;
    this.count = 0;
    this.length = 0;
    if (bName && arm)
      this.setBones(bName, arm);
  }
  setBones(bNames, arm) {
    let b;
    let n;
    this.length = 0;
    for (n of bNames) {
      b = arm.getBone(n);
      if (b) {
        this.length += b.len;
        this.links.push(Link.fromBone(b));
      } else
        console.log("Chain.setBones - Bone Not Found:", n);
    }
    this.count = this.links.length;
    return this;
  }
  setSolver(s) {
    this.solver = s;
    return this;
  }
  bindToPose(pose) {
    let lnk;
    for (lnk of this.links)
      lnk.bind.copy(pose.bones[lnk.idx].local);
    return this;
  }
  resetLengths(pose) {
    let lnk;
    let len;
    this.length = 0;
    for (lnk of this.links) {
      len = pose.bones[lnk.idx].len;
      lnk.len = len;
      this.length += len;
    }
  }
  first() {
    return this.links[0];
  }
  last() {
    return this.links[this.count - 1];
  }
  resolveToPose(pose, debug) {
    if (!this.solver) {
      console.warn("Chain.resolveToPose - Missing Solver");
      return this;
    }
    this.solver.resolve(this, pose, debug);
    return this;
  }
  getEndPositions(pose) {
    let rtn = [];
    if (this.count != 0)
      rtn.push(pose.bones[this.links[0].idx].world.pos.toArray());
    if (this.count > 1) {
      let lnk = this.last();
      let v = new Vec3(0, lnk.len, 0);
      pose.bones[lnk.idx].world.transformVec3(v);
      rtn.push(v.toArray());
    }
    return rtn;
  }
  getPositionAt(pose, idx) {
    const b = pose.bones[this.links[idx].idx];
    return b.world.pos.toArray();
  }
  getAllPositions(pose) {
    const rtn = [];
    let lnk;
    for (lnk of this.links) {
      rtn.push(pose.bones[lnk.idx].world.pos.toArray());
    }
    lnk = this.links[this.count - 1];
    const v = new Vec3(0, lnk.len, 0);
    pose.bones[lnk.idx].world.transformVec3(v);
    rtn.push(v.toArray());
    return rtn;
  }
  getStartPosition(pose) {
    const b = pose.bones[this.links[0].idx];
    return b.world.pos.toArray();
  }
  getMiddlePosition(pose) {
    if (this.count == 2) {
      const b = pose.bones[this.links[1].idx];
      return b.world.pos.toArray();
    }
    console.warn("TODO: Implemenet IKChain.getMiddlePosition");
    return [0, 0, 0];
  }
  getLastPosition(pose) {
    const b = pose.bones[this.links[this.count - 1].idx];
    return b.world.pos.toArray();
  }
  getTailPosition(pose, ignoreScale = false) {
    const b = pose.bones[this.links[this.count - 1].idx];
    const v = new Vec3(0, b.len, 0);
    if (!ignoreScale)
      return b.world.transformVec3(v).toArray();
    return v.transformQuat(b.world.rot).add(b.world.pos).toArray();
  }
  getAltDirections(pose, idx = 0) {
    const lnk = this.links[idx];
    const b = pose.bones[lnk.idx];
    const eff = lnk.effectorDir.slice(0);
    const pol = lnk.poleDir.slice(0);
    b.world.rot.transformVec3(eff);
    b.world.rot.transformVec3(pol);
    return [eff, pol];
  }
  bindAltDirections(pose, effectorDir, poleDir) {
    let l;
    let v = new Vec3();
    let inv = new Quat();
    for (l of this.links) {
      inv.fromInvert(pose.bones[l.idx].world.rot);
      v.fromQuat(inv, effectorDir).copyTo(l.effectorDir);
      v.fromQuat(inv, poleDir).copyTo(l.poleDir);
    }
    return this;
  }
};
var IKRig = class {
  constructor() {
    this.items = new Map();
  }
  bindPose(pose) {
    let ch;
    for (ch of this.items.values())
      ch.bindToPose(pose);
    return this;
  }
  updateBoneLengths(pose) {
    let ch;
    for (ch of this.items.values()) {
      ch.resetLengths(pose);
    }
    return this;
  }
  get(name) {
    return this.items.get(name);
  }
  add(arm, name, bNames) {
    const chain = new IKChain(bNames, arm);
    this.items.set(name, chain);
    return chain;
  }
};
var IKRig_default = IKRig;
import { BoneMap } from "./armature.js";
import { Vec3 as Vec33, Transform as Transform3 } from "./core.js";
import { Vec3 as Vec32, Transform as Transform2, Quat as Quat2 } from "./core.js";
var SwingTwistSolver = class {
  constructor() {
    this._isTarPosition = false;
    this._originPoleDir = [0, 0, 0];
    this.effectorScale = 1;
    this.effectorPos = [0, 0, 0];
    this.effectorDir = [0, 0, 1];
    this.poleDir = [0, 1, 0];
    this.orthoDir = [1, 0, 0];
    this.originPos = [0, 0, 0];
  }
  initData(pose, chain) {
    if (pose && chain) {
      const lnk = chain.links[0];
      const pole = new Vec32(lnk.poleDir);
      const eff = new Vec32(lnk.effectorDir);
      const rot = pose.bones[lnk.idx].world.rot;
      rot.transformVec3(eff);
      rot.transformVec3(pole);
      this.setTargetDir(eff, pole);
    }
    return this;
  }
  setTargetDir(e, pole, effectorScale) {
    this._isTarPosition = false;
    this.effectorDir[0] = e[0];
    this.effectorDir[1] = e[1];
    this.effectorDir[2] = e[2];
    if (pole)
      this.setTargetPole(pole);
    if (effectorScale)
      this.effectorScale = effectorScale;
    return this;
  }
  setTargetPos(v, pole) {
    this._isTarPosition = true;
    this.effectorPos[0] = v[0];
    this.effectorPos[1] = v[1];
    this.effectorPos[2] = v[2];
    if (pole)
      this.setTargetPole(pole);
    return this;
  }
  setTargetPole(v) {
    this._originPoleDir[0] = v[0];
    this._originPoleDir[1] = v[1];
    this._originPoleDir[2] = v[2];
    return this;
  }
  resolve(chain, pose, debug) {
    const [rot, pt] = this.getWorldRot(chain, pose, debug);
    rot.pmulInvert(pt.rot);
    pose.setLocalRot(chain.links[0].idx, rot);
  }
  ikDataFromPose(chain, pose, out) {
    const dir = new Vec32();
    const lnk = chain.first();
    const b = pose.bones[lnk.idx];
    dir.fromQuat(b.world.rot, lnk.effectorDir).norm().copyTo(out.effectorDir);
    dir.fromQuat(b.world.rot, lnk.poleDir).norm().copyTo(out.poleDir);
  }
  _update(origin) {
    const v = new Vec32();
    const o = [0, 0, 0];
    if (this._isTarPosition)
      v.fromSub(this.effectorPos, origin).norm().copyTo(this.effectorDir);
    v.fromCross(this._originPoleDir, this.effectorDir).norm().copyTo(this.orthoDir);
    v.fromCross(this.effectorDir, this.orthoDir).norm().copyTo(this.poleDir);
    this.originPos[0] = origin[0];
    this.originPos[1] = origin[1];
    this.originPos[2] = origin[2];
  }
  getWorldRot(chain, pose, debug) {
    const pt = new Transform2();
    const ct = new Transform2();
    let lnk = chain.first();
    if (lnk.pidx == -1)
      pt.copy(pose.offset);
    else
      pose.getWorldTransform(lnk.pidx, pt);
    ct.fromMul(pt, lnk.bind);
    this._update(ct.pos);
    const rot = new Quat2(ct.rot);
    const dir = new Vec32();
    const q = new Quat2();
    dir.fromQuat(ct.rot, lnk.effectorDir);
    q.fromUnitVecs(dir, this.effectorDir);
    rot.pmul(q);
    dir.fromQuat(rot, lnk.poleDir);
    q.fromUnitVecs(dir, this.poleDir);
    rot.pmul(q);
    if (!this._isTarPosition) {
      this.effectorPos[0] = this.originPos[0] + this.effectorDir[0] * chain.length * this.effectorScale;
      this.effectorPos[1] = this.originPos[1] + this.effectorDir[1] * chain.length * this.effectorScale;
      this.effectorPos[2] = this.originPos[2] + this.effectorDir[2] * chain.length * this.effectorScale;
    }
    return [rot, pt];
  }
};
var SwingTwistSolver_default = SwingTwistSolver;
var HipSolver = class {
  constructor() {
    this.isAbs = true;
    this.position = [0, 0, 0];
    this.bindHeight = 0;
    this._swingTwist = new SwingTwistSolver_default();
  }
  initData(pose, chain) {
    if (pose && chain) {
      const b = pose.bones[chain.links[0].idx];
      this.setMovePos(b.world.pos, true);
      this._swingTwist.initData(pose, chain);
    }
    return this;
  }
  setTargetDir(e, pole) {
    this._swingTwist.setTargetDir(e, pole);
    return this;
  }
  setTargetPos(v, pole) {
    this._swingTwist.setTargetPos(v, pole);
    return this;
  }
  setTargetPole(v) {
    this._swingTwist.setTargetPole(v);
    return this;
  }
  setMovePos(pos, isAbs = true, bindHeight = 0) {
    this.position[0] = pos[0];
    this.position[1] = pos[1];
    this.position[2] = pos[2];
    this.isAbs = isAbs;
    this.bindHeight = bindHeight;
    return this;
  }
  resolve(chain, pose, debug) {
    const pt = new Transform3();
    const ptInv = new Transform3();
    const hipPos = new Vec33();
    const lnk = chain.first();
    if (lnk.pidx == -1)
      pt.copy(pose.offset);
    else
      pose.getWorldTransform(lnk.pidx, pt);
    ptInv.fromInvert(pt);
    if (this.isAbs) {
      hipPos.copy(this.position);
    } else {
      const ct = new Transform3();
      ct.fromMul(pt, lnk.bind);
      if (this.bindHeight == 0) {
        hipPos.fromAdd(ct.pos, this.position);
      } else {
        hipPos.fromScale(this.position, Math.abs(ct.pos[1] / this.bindHeight)).add(ct.pos);
      }
    }
    ptInv.transformVec3(hipPos);
    pose.setLocalPos(lnk.idx, hipPos);
    this._swingTwist.resolve(chain, pose, debug);
  }
  ikDataFromPose(chain, pose, out) {
    const v = new Vec33();
    const lnk = chain.first();
    const b = pose.bones[lnk.idx];
    const tran = new Transform3();
    if (b.pidx == null)
      tran.fromMul(pose.offset, lnk.bind);
    else
      pose.getWorldTransform(lnk.pidx, tran).mul(lnk.bind);
    v.fromSub(b.world.pos, tran.pos);
    out.isAbsolute = false;
    out.bindHeight = tran.pos[1];
    out.pos[0] = v[0];
    out.pos[1] = v[1];
    out.pos[2] = v[2];
    v.fromQuat(b.world.rot, lnk.effectorDir).norm().copyTo(out.effectorDir);
    v.fromQuat(b.world.rot, lnk.poleDir).norm().copyTo(out.poleDir);
  }
};
var HipSolver_default = HipSolver;
import { Vec3 as Vec34 } from "./core.js";
function lawcos_sss(aLen, bLen, cLen) {
  let v = (aLen * aLen + bLen * bLen - cLen * cLen) / (2 * aLen * bLen);
  if (v < -1)
    v = -1;
  else if (v > 1)
    v = 1;
  return Math.acos(v);
}
var LimbSolver = class {
  constructor() {
    this._swingTwist = new SwingTwistSolver_default();
  }
  initData(pose, chain) {
    if (pose && chain) {
      this._swingTwist.initData(pose, chain);
    }
    return this;
  }
  setTargetDir(e, pole, effectorScale) {
    this._swingTwist.setTargetDir(e, pole, effectorScale);
    return this;
  }
  setTargetPos(v, pole) {
    this._swingTwist.setTargetPos(v, pole);
    return this;
  }
  setTargetPole(v) {
    this._swingTwist.setTargetPole(v);
    return this;
  }
  resolve(chain, pose, debug) {
    const ST = this._swingTwist;
    const [rot, pt] = ST.getWorldRot(chain, pose, debug);
    let b0 = chain.links[0], b1 = chain.links[1], alen = b0.len, blen = b1.len, clen = Vec34.len(ST.effectorPos, ST.originPos), prot = [0, 0, 0, 0], rad;
    rad = lawcos_sss(alen, clen, blen);
    rot.pmulAxisAngle(ST.orthoDir, -rad).copyTo(prot).pmulInvert(pt.rot);
    pose.setLocalRot(b0.idx, rot);
    rad = Math.PI - lawcos_sss(alen, blen, clen);
    rot.fromMul(prot, b1.bind.rot).pmulAxisAngle(ST.orthoDir, rad).pmulInvert(prot);
    pose.setLocalRot(b1.idx, rot);
  }
  ikDataFromPose(chain, pose, out) {
    const p0 = chain.getStartPosition(pose);
    const p1 = chain.getTailPosition(pose, true);
    const dir = Vec34.sub(p1, p0);
    out.lenScale = dir.len() / chain.length;
    dir.norm().copyTo(out.effectorDir);
    const lnk = chain.first();
    const bp = pose.bones[lnk.idx];
    dir.fromQuat(bp.world.rot, lnk.poleDir).fromCross(dir, out.effectorDir).fromCross(out.effectorDir, dir).norm().copyTo(out.poleDir);
  }
};
var LimbSolver_default = LimbSolver;
import { Vec3 as Vec35, Quat as Quat5 } from "./core.js";
var STDirectionSet = class {
  constructor() {
    this.effectorDir = [0, 0, 0];
    this.poleDir = [0, 0, 0];
  }
};
var SwingTwistChainSolver = class {
  initData(pose, chain) {
    if (pose && chain) {
      const v = new Vec35();
      let rot;
      let lnk;
      let ds;
      this.directionSet = new Array(chain.count);
      for (let i = 0; i < chain.count; i++) {
        lnk = chain.links[i];
        rot = pose.bones[lnk.idx].world.rot;
        ds = new STDirectionSet();
        v.fromQuat(rot, lnk.effectorDir).copyTo(ds.effectorDir);
        v.fromQuat(rot, lnk.poleDir).copyTo(ds.effectorDir);
        this.directionSet[i] = ds;
      }
    }
    return this;
  }
  setChainDir(eff, pole) {
    const cnt = eff.length;
    let ds;
    for (let i = 0; i < cnt; i++) {
      ds = this.directionSet[i];
      ds.effectorDir[0] = eff[i][0];
      ds.effectorDir[1] = eff[i][1];
      ds.effectorDir[2] = eff[i][2];
      ds.poleDir[0] = pole[i][0];
      ds.poleDir[1] = pole[i][1];
      ds.poleDir[2] = pole[i][2];
    }
    return this;
  }
  resolve(chain, pose, debug) {
    const iEnd = chain.count - 1;
    const pRot = new Quat5();
    const cRot = new Quat5();
    const dir = new Vec35();
    const rot = new Quat5();
    const tmp = [0, 0, 0, 1];
    let lnk = chain.first();
    let ds;
    if (lnk.pidx != -1)
      pose.getWorldRotation(lnk.pidx, pRot);
    else
      pRot.copy(pose.offset.rot);
    for (let i = 0; i <= iEnd; i++) {
      lnk = chain.links[i];
      ds = this.directionSet[i];
      cRot.fromMul(pRot, lnk.bind.rot);
      dir.fromQuat(cRot, lnk.effectorDir);
      rot.fromUnitVecs(dir, ds.effectorDir);
      cRot.pmul(rot);
      dir.fromQuat(cRot, lnk.poleDir);
      rot.fromUnitVecs(dir, ds.poleDir);
      cRot.pmul(rot);
      cRot.copyTo(tmp);
      cRot.pmulInvert(pRot);
      pose.setLocalRot(lnk.idx, cRot);
      if (i != iEnd)
        pRot.copy(tmp);
    }
  }
};
var SwingTwistChainSolver_default = SwingTwistChainSolver;
import { Vec3 as Vec36, Quat as Quat6 } from "./core.js";
var SwingTwistEndsSolver = class {
  constructor() {
    this.startEffectorDir = [0, 0, 0];
    this.startPoleDir = [0, 0, 0];
    this.endEffectorDir = [0, 0, 0];
    this.endPoleDir = [0, 0, 0];
  }
  initData(pose, chain) {
    if (pose && chain) {
      const pole = new Vec36();
      const eff = new Vec36();
      let rot;
      let lnk;
      lnk = chain.first();
      rot = pose.bones[lnk.idx].world.rot;
      pole.fromQuat(rot, lnk.poleDir);
      eff.fromQuat(rot, lnk.effectorDir);
      this.setStartDir(eff, pole);
      lnk = chain.last();
      rot = pose.bones[lnk.idx].world.rot;
      pole.fromQuat(rot, lnk.poleDir);
      eff.fromQuat(rot, lnk.effectorDir);
      this.setEndDir(eff, pole);
    }
    return this;
  }
  setStartDir(eff, pole) {
    this.startEffectorDir[0] = eff[0];
    this.startEffectorDir[1] = eff[1];
    this.startEffectorDir[2] = eff[2];
    this.startPoleDir[0] = pole[0];
    this.startPoleDir[1] = pole[1];
    this.startPoleDir[2] = pole[2];
    return this;
  }
  setEndDir(eff, pole) {
    this.endEffectorDir[0] = eff[0];
    this.endEffectorDir[1] = eff[1];
    this.endEffectorDir[2] = eff[2];
    this.endPoleDir[0] = pole[0];
    this.endPoleDir[1] = pole[1];
    this.endPoleDir[2] = pole[2];
    return this;
  }
  resolve(chain, pose, debug) {
    const iEnd = chain.count - 1;
    const pRot = new Quat6();
    const cRot = new Quat6();
    const ikEffe = new Vec36();
    const ikPole = new Vec36();
    const dir = new Vec36();
    const rot = new Quat6();
    const tmp = [0, 0, 0, 1];
    let lnk = chain.first();
    let t;
    if (lnk.pidx != -1)
      pose.getWorldRotation(lnk.pidx, pRot);
    else
      pRot.copy(pose.offset.rot);
    for (let i = 0; i <= iEnd; i++) {
      t = i / iEnd;
      lnk = chain.links[i];
      ikEffe.fromLerp(this.startEffectorDir, this.endEffectorDir, t);
      ikPole.fromLerp(this.startPoleDir, this.endPoleDir, t);
      cRot.fromMul(pRot, lnk.bind.rot);
      dir.fromQuat(cRot, lnk.effectorDir);
      rot.fromUnitVecs(dir, ikEffe);
      cRot.pmul(rot);
      dir.fromQuat(cRot, lnk.poleDir);
      rot.fromUnitVecs(dir, ikPole);
      cRot.pmul(rot);
      cRot.copyTo(tmp);
      cRot.pmulInvert(pRot);
      pose.setLocalRot(lnk.idx, cRot);
      if (i != iEnd)
        pRot.copy(tmp);
    }
  }
  ikDataFromPose(chain, pose, out) {
    const dir = new Vec36();
    let lnk;
    let b;
    lnk = chain.first();
    b = pose.bones[lnk.idx];
    dir.fromQuat(b.world.rot, lnk.effectorDir).norm().copyTo(out.startEffectorDir);
    dir.fromQuat(b.world.rot, lnk.poleDir).norm().copyTo(out.startPoleDir);
    lnk = chain.last();
    b = pose.bones[lnk.idx];
    dir.fromQuat(b.world.rot, lnk.effectorDir).norm().copyTo(out.endEffectorDir);
    dir.fromQuat(b.world.rot, lnk.poleDir).norm().copyTo(out.endPoleDir);
  }
};
var SwingTwistEndsSolver_default = SwingTwistEndsSolver;
var BipedRig = class extends IKRig_default {
  constructor() {
    super();
    this.hip = void 0;
    this.spine = void 0;
    this.neck = void 0;
    this.head = void 0;
    this.armL = void 0;
    this.armR = void 0;
    this.legL = void 0;
    this.legR = void 0;
    this.handL = void 0;
    this.handR = void 0;
    this.footL = void 0;
    this.footR = void 0;
  }
  autoRig(arm) {
    const map = new BoneMap(arm);
    let isComplete = true;
    let b;
    let bi;
    let n;
    let names = [];
    const chains = [
      { n: "hip", ch: ["hip"] },
      { n: "spine", ch: ["spine"] },
      { n: "legL", ch: ["thigh_l", "shin_l"] },
      { n: "legR", ch: ["thigh_r", "shin_r"] },
      { n: "armL", ch: ["upperarm_l", "forearm_l"] },
      { n: "armR", ch: ["upperarm_r", "forearm_r"] },
      { n: "neck", ch: ["neck"] },
      { n: "head", ch: ["head"] },
      { n: "handL", ch: ["hand_l"] },
      { n: "handR", ch: ["hand_r"] },
      { n: "footL", ch: ["foot_l"] },
      { n: "footR", ch: ["foot_r"] }
    ];
    for (let itm of chains) {
      n = itm.n;
      names.length = 0;
      for (let i = 0; i < itm.ch.length; i++) {
        b = map.bones.get(itm.ch[i]);
        if (!b) {
          console.log("AutoRig - Missing ", itm.ch[i]);
          isComplete = false;
          break;
        }
        if (b instanceof BoneMap.BoneInfo)
          names.push(b.name);
        else if (b instanceof BoneMap.BoneChain)
          for (bi of b.items)
            names.push(bi.name);
      }
      this[n] = this.add(arm, n, names);
    }
    this._setAltDirection(arm);
    return isComplete;
  }
  useSolversForRetarget(pose) {
    this.hip?.setSolver(new HipSolver_default().initData(pose, this.hip));
    this.head?.setSolver(new SwingTwistSolver_default().initData(pose, this.head));
    this.armL?.setSolver(new LimbSolver_default().initData(pose, this.armL));
    this.armR?.setSolver(new LimbSolver_default().initData(pose, this.armR));
    this.legL?.setSolver(new LimbSolver_default().initData(pose, this.legL));
    this.legR?.setSolver(new LimbSolver_default().initData(pose, this.legR));
    this.footL?.setSolver(new SwingTwistSolver_default().initData(pose, this.footL));
    this.footR?.setSolver(new SwingTwistSolver_default().initData(pose, this.footR));
    this.handL?.setSolver(new SwingTwistSolver_default().initData(pose, this.handL));
    this.handR?.setSolver(new SwingTwistSolver_default().initData(pose, this.handR));
    this.spine?.setSolver(new SwingTwistEndsSolver_default().initData(pose, this.spine));
    return this;
  }
  useSolversForFBIK(pose) {
    this.hip?.setSolver(new HipSolver_default().initData(pose, this.hip));
    this.head?.setSolver(new SwingTwistSolver_default().initData(pose, this.head));
    this.armL?.setSolver(new LimbSolver_default().initData(pose, this.armL));
    this.armR?.setSolver(new LimbSolver_default().initData(pose, this.armR));
    this.legL?.setSolver(new LimbSolver_default().initData(pose, this.legL));
    this.legR?.setSolver(new LimbSolver_default().initData(pose, this.legR));
    this.footL?.setSolver(new SwingTwistSolver_default().initData(pose, this.footL));
    this.footR?.setSolver(new SwingTwistSolver_default().initData(pose, this.footR));
    this.handL?.setSolver(new SwingTwistSolver_default().initData(pose, this.handL));
    this.handR?.setSolver(new SwingTwistSolver_default().initData(pose, this.handR));
    this.spine?.setSolver(new SwingTwistChainSolver_default().initData(pose, this.spine));
    return this;
  }
  bindPose(pose) {
    super.bindPose(pose);
    this._setAltDirection(pose);
    return this;
  }
  _setAltDirection(pose) {
    const FWD = [0, 0, 1];
    const UP = [0, 1, 0];
    const DN = [0, -1, 0];
    const R = [-1, 0, 0];
    const L = [1, 0, 0];
    const BAK = [0, 0, -1];
    if (this.hip)
      this.hip.bindAltDirections(pose, FWD, UP);
    if (this.spine)
      this.spine.bindAltDirections(pose, UP, FWD);
    if (this.neck)
      this.neck.bindAltDirections(pose, FWD, UP);
    if (this.head)
      this.head.bindAltDirections(pose, FWD, UP);
    if (this.legL)
      this.legL.bindAltDirections(pose, DN, FWD);
    if (this.legR)
      this.legR.bindAltDirections(pose, DN, FWD);
    if (this.footL)
      this.footL.bindAltDirections(pose, FWD, UP);
    if (this.footR)
      this.footR.bindAltDirections(pose, FWD, UP);
    if (this.armL)
      this.armL.bindAltDirections(pose, L, BAK);
    if (this.armR)
      this.armR.bindAltDirections(pose, R, BAK);
    if (this.handL)
      this.handL.bindAltDirections(pose, L, BAK);
    if (this.handR)
      this.handR.bindAltDirections(pose, R, BAK);
  }
  resolveToPose(pose, debug) {
    let ch;
    for (ch of this.items.values()) {
      if (ch.solver)
        ch.resolveToPose(pose, debug);
    }
  }
};
var BipedRig_default = BipedRig;
var VerletPoint = class {
  constructor(config) {
    this.idx = -1;
    this.pos = [0, 0, 0];
    this.mass = 1;
    this.isPinned = false;
    this.isPole = false;
    this.draggable = true;
    this.visible = true;
    if (config) {
      if (config.draggable !== void 0)
        this.draggable = config.draggable;
      if (config.visible !== void 0)
        this.visible = config.visible;
      if (config.mass !== void 0)
        this.mass = config.mass;
      if (config.pole !== void 0)
        this.isPole = config.pole;
      if (config.pos) {
        this.pos[0] = config.pos[0];
        this.pos[1] = config.pos[1];
        this.pos[2] = config.pos[2];
      }
    }
  }
  setPos(p) {
    this.pos[0] = p[0];
    this.pos[1] = p[1];
    this.pos[2] = p[2];
    return this;
  }
};
var VerletPoint_default = VerletPoint;
import { Vec3 as Vec37 } from "./core.js";
var DistanceConstraint = class {
  constructor(p0, p1) {
    this.lenSq = 0;
    this.len = 0;
    this.aAnchor = false;
    this.bAnchor = false;
    this.isRanged = false;
    this.dir = new Vec37();
    this.v = new Vec37();
    this.pa = p0;
    this.pb = p1;
    this.rebind();
  }
  rebind() {
    this.lenSq = Vec37.lenSq(this.pa.pos, this.pb.pos);
    this.len = Math.sqrt(this.lenSq);
  }
  ranged() {
    this.isRanged = true;
    return this;
  }
  resolve() {
    if (this.pa.isPinned && this.pb.isPinned)
      return false;
    this.dir.fromSub(this.pa.pos, this.pb.pos);
    const curLenSqr = this.dir.lenSq();
    if (Math.abs(curLenSqr - this.lenSq) < 1e-4 || this.isRanged && curLenSqr <= this.lenSq)
      return false;
    const stiffness = 1;
    const curLen = Math.sqrt(curLenSqr);
    const delta = curLen == 0 ? this.len : (this.len - curLen) / curLen;
    let aScl;
    let bScl;
    const aPin = this.aAnchor || this.pa.isPinned;
    const bPin = this.bAnchor || this.pb.isPinned;
    if (aPin && !bPin) {
      aScl = 0;
      bScl = stiffness;
    } else if (!aPin && bPin) {
      aScl = stiffness;
      bScl = 0;
    } else {
      aScl = (1 - this.pa.mass / (this.pa.mass + this.pb.mass)) * stiffness;
      bScl = stiffness - aScl;
    }
    if (!aPin) {
      this.v.fromScale(this.dir, aScl * delta);
      this.pa.pos[0] += this.v[0];
      this.pa.pos[1] += this.v[1];
      this.pa.pos[2] += this.v[2];
    }
    if (!bPin) {
      this.v.fromScale(this.dir, bScl * delta);
      this.pb.pos[0] -= this.v[0];
      this.pb.pos[1] -= this.v[1];
      this.pb.pos[2] -= this.v[2];
    }
    return true;
  }
};
var DistanceConstraint_default = DistanceConstraint;
import { Vec3 as Vec38 } from "./core.js";
var P4Cage = class {
  constructor(skel, pHead, pTail, pRight, pLeft) {
    this.constraints = [];
    this.pHead = pHead;
    this.pTail = pTail;
    this.pRight = pRight;
    this.pLeft = pLeft;
    this.pPole = skel.newPoint({ mass: 1, pole: true });
    this.constraints.push(new DistanceConstraint_default(pRight, pLeft), new DistanceConstraint_default(pRight, pTail), new DistanceConstraint_default(pLeft, pTail), new DistanceConstraint_default(pHead, this.pPole), new DistanceConstraint_default(pHead, pTail), new DistanceConstraint_default(pHead, pRight), new DistanceConstraint_default(pHead, pLeft), new DistanceConstraint_default(this.pPole, pTail), new DistanceConstraint_default(this.pPole, pRight), new DistanceConstraint_default(this.pPole, pLeft));
  }
  updatePole() {
    this.pPole.pos[0] = this.pHead.pos[0];
    this.pPole.pos[1] = this.pHead.pos[1];
    this.pPole.pos[2] = this.pHead.pos[2] + 0.1;
  }
  rebind() {
    let c;
    for (c of this.constraints)
      c.rebind();
  }
  resolve() {
    let chg = false;
    let c;
    for (c of this.constraints) {
      if (c.resolve())
        chg = true;
    }
    return chg;
  }
  poleMode(isOn) {
    this.pHead.isPinned = isOn;
    return this;
  }
  getHeadPos() {
    return this.pHead.pos;
  }
  getAxis(effDir, poleDir) {
    const v0 = Vec38.sub(this.pPole.pos, this.pHead.pos);
    const v1 = Vec38.sub(this.pLeft.pos, this.pRight.pos);
    const v2 = Vec38.cross(v0, v1);
    v0.norm().copyTo(effDir);
    v2.norm().copyTo(poleDir);
  }
};
var P4Cage_default = P4Cage;
import { Vec3 as Vec39 } from "./core.js";
var AxisCage = class {
  constructor(skel, pHead, pTail) {
    this.constraints = [];
    this.pHead = pHead;
    this.pTail = pTail;
    this.pPole = skel.newPoint({ mass: 1, pole: true });
    this.pLeft = skel.newPoint({ mass: 1, pole: true, visible: false });
    this.constraints.push(new DistanceConstraint_default(pHead, pTail), new DistanceConstraint_default(pHead, this.pPole), new DistanceConstraint_default(pHead, this.pLeft), new DistanceConstraint_default(pTail, this.pLeft), new DistanceConstraint_default(pTail, this.pPole), new DistanceConstraint_default(this.pPole, this.pLeft));
  }
  setHeadPos(p) {
    this.pHead.pos[0] = p[0];
    this.pHead.pos[1] = p[1];
    this.pHead.pos[2] = p[2];
    return this;
  }
  updatePole() {
    this.pPole.pos[0] = this.pHead.pos[0];
    this.pPole.pos[1] = this.pHead.pos[1];
    this.pPole.pos[2] = this.pHead.pos[2] + 0.1;
    this.pLeft.pos[0] = this.pHead.pos[0] + 0.1;
    this.pLeft.pos[1] = this.pHead.pos[1];
    this.pLeft.pos[2] = this.pHead.pos[2];
  }
  rebind() {
    let c;
    for (c of this.constraints)
      c.rebind();
  }
  resolve() {
    let chg = false;
    let c;
    for (c of this.constraints) {
      if (c.resolve())
        chg = true;
    }
    return chg;
  }
  poleMode(isOn) {
    this.pHead.isPinned = isOn;
    return this;
  }
  getAxis(effDir, poleDir) {
    const v0 = Vec39.sub(this.pPole.pos, this.pHead.pos);
    const v1 = Vec39.sub(this.pLeft.pos, this.pHead.pos);
    const v2 = Vec39.cross(v0, v1);
    v0.norm().copyTo(effDir);
    v2.norm().copyTo(poleDir);
  }
};
var AxisCage_default = AxisCage;
import { Vec3 as Vec310 } from "./core.js";
var LimbCage = class {
  constructor(skel, pHead, pPole, pTail) {
    this.prevPole = [0, 0, 0];
    this.constraints = [];
    this.pHead = pHead;
    this.pPole = pPole;
    this.pTail = pTail;
    this.constraints.push(new DistanceConstraint_default(pHead, pPole), new DistanceConstraint_default(pPole, pTail));
  }
  rebind() {
    let c;
    for (c of this.constraints)
      c.rebind();
  }
  resolve() {
    let chg = false;
    let c;
    for (c of this.constraints) {
      if (c.resolve())
        chg = true;
    }
    return chg;
  }
  poleMode(isOn) {
    this.pHead.isPinned = isOn;
    return this;
  }
  getTailPos() {
    return this.pTail.pos;
  }
  getPoleDir(poleDir) {
    const v0 = Vec310.sub(this.pTail.pos, this.pHead.pos).norm();
    const v1 = Vec310.sub(this.pPole.pos, this.pHead.pos).norm();
    if (Vec310.dot(v0, v1) < 0.999) {
      const v2 = Vec310.cross(v1, v0);
      v1.fromCross(v0, v2).norm().copyTo(poleDir).copyTo(this.prevPole);
    } else {
      poleDir[0] = this.prevPole[0];
      poleDir[1] = this.prevPole[1];
      poleDir[2] = this.prevPole[2];
    }
    return poleDir;
  }
  setPrevPole(poleDir) {
    this.prevPole[0] = poleDir[0];
    this.prevPole[1] = poleDir[1];
    this.prevPole[2] = poleDir[2];
    return this;
  }
};
var LimbCage_default = LimbCage;
import { Vec3 as Vec311 } from "./core.js";
var TriExtCage = class {
  constructor(skel, pHead, useEffFromPole = false) {
    this.useEffFromPole = false;
    this.constraints = [];
    this.pHead = pHead;
    this.pEff = skel.newPoint({ mass: 1, pole: true });
    this.pPole = skel.newPoint({ mass: 1, pole: true });
    this.useEffFromPole = useEffFromPole;
    this.constraints.push(new DistanceConstraint_default(pHead, this.pEff), new DistanceConstraint_default(this.pEff, this.pPole), new DistanceConstraint_default(this.pPole, pHead));
  }
  setPoleOffset(p, effOff, poleOff) {
    const v = new Vec311();
    if (this.useEffFromPole) {
      v.fromAdd(p, poleOff).copyTo(this.pPole.pos).add(effOff).copyTo(this.pEff.pos);
    } else {
      v.fromAdd(p, poleOff).copyTo(this.pPole.pos).fromAdd(p, effOff).copyTo(this.pEff.pos);
    }
    return this;
  }
  rebind() {
    let c;
    for (c of this.constraints)
      c.rebind();
  }
  resolve() {
    let chg = false;
    let c;
    for (c of this.constraints) {
      if (c.resolve())
        chg = true;
    }
    return chg;
  }
  poleMode(isOn) {
    this.pHead.isPinned = isOn;
    return this;
  }
  getAxis(effDir, poleDir) {
    const v = new Vec311();
    if (this.useEffFromPole) {
      v.fromSub(this.pHead.pos, this.pPole.pos).norm().copyTo(poleDir);
      v.fromSub(this.pEff.pos, this.pPole.pos).norm().copyTo(effDir);
    } else {
      v.fromSub(this.pPole.pos, this.pHead.pos).norm().copyTo(poleDir);
      v.fromSub(this.pEff.pos, this.pHead.pos).norm().copyTo(effDir);
    }
  }
};
var TriExtCage_default = TriExtCage;
var VerletSkeleton = class {
  constructor() {
    this.points = [];
    this.constraints = [];
    this.iterations = 5;
  }
  newPoint(config) {
    const pnt = new VerletPoint_default(config);
    pnt.idx = this.points.length;
    this.points.push(pnt);
    return pnt;
  }
  setPos(idx, pos) {
    const p = this.points[idx];
    if (p) {
      p.pos[0] = pos[0];
      p.pos[1] = pos[1];
      p.pos[2] = pos[2];
    }
    return this;
  }
  newP4Cage(pHead, pTail, pRight, pLeft) {
    const cage = new P4Cage_default(this, pHead, pTail, pRight, pLeft);
    this.constraints.push(cage);
    return cage;
  }
  newAxisCage(pHead, pTail) {
    const cage = new AxisCage_default(this, pHead, pTail);
    this.constraints.push(cage);
    return cage;
  }
  newLimbCage(pHead, pPole, pTail) {
    const cage = new LimbCage_default(this, pHead, pPole, pTail);
    this.constraints.push(cage);
    return cage;
  }
  newTriExtCage(pHead, useEffFromPole = false) {
    const cage = new TriExtCage_default(this, pHead, useEffFromPole);
    this.constraints.push(cage);
    return cage;
  }
  newLink(pHead, pTail) {
    const con = new DistanceConstraint_default(pHead, pTail);
    this.constraints.push(con);
    return con;
  }
  rebindConstraints() {
    let c;
    for (c of this.constraints)
      c.rebind();
  }
  resolve() {
    let i;
    let c;
    let chg;
    for (i = 0; i < this.iterations; i++) {
      chg = false;
      for (c of this.constraints) {
        if (c.resolve())
          chg = true;
      }
      if (!chg)
        break;
    }
  }
};
var VerletSkeleton_default = VerletSkeleton;
var RenderLine = class {
  constructor(head, tail) {
    this.head = head;
    this.tail = tail;
  }
};
var RenderLine_default = RenderLine;
var Spine_Mass = 8;
var Biped_Config = {
  hip: { mass: 16 },
  head: { mass: 1 },
  armL_head: { mass: 4 },
  armL_pole: { mass: 2, pole: true },
  armL_tail: { mass: 1 },
  armR_head: { mass: 4 },
  armR_pole: { mass: 2, pole: true },
  armR_tail: { mass: 1 },
  legL_head: { mass: 4 },
  legL_pole: { mass: 2, pole: true },
  legL_tail: { mass: 1 },
  legR_head: { mass: 4 },
  legR_pole: { mass: 2, pole: true },
  legR_tail: { mass: 1 }
};
var BipedFBIK = class {
  constructor(rig) {
    this.skeleton = new VerletSkeleton_default();
    this.lines = [];
    this.spineCage = [];
    this.spinePnts = [];
    this.rig = rig;
    this._build();
    this._defineRenderLines();
    this.skeleton.iterations = 10;
  }
  _build() {
    const s = this.skeleton;
    const r = this.rig;
    const t = {};
    let k, i;
    for (k in Biped_Config) {
      t[k] = s.newPoint(Biped_Config[k]);
    }
    this.hip = t.hip;
    this.armL = s.newLimbCage(t.armL_head, t.armL_pole, t.armL_tail).setPrevPole([0, 0, -1]);
    this.armR = s.newLimbCage(t.armR_head, t.armR_pole, t.armR_tail).setPrevPole([0, 0, -1]);
    this.legR = s.newLimbCage(t.legR_head, t.legR_pole, t.legR_tail).setPrevPole([0, 0, 1]);
    this.legL = s.newLimbCage(t.legL_head, t.legL_pole, t.legL_tail).setPrevPole([0, 0, 1]);
    this.footL = s.newTriExtCage(t.legL_tail, true);
    this.footR = s.newTriExtCage(t.legR_tail, true);
    this.handL = s.newTriExtCage(t.armL_tail, false);
    this.handR = s.newTriExtCage(t.armR_tail, false);
    this.head = s.newTriExtCage(t.head, false);
    if (r.spine) {
      for (let lnk of r.spine.links) {
        this.spinePnts.push(s.newPoint({ mass: Spine_Mass }));
      }
      this.spinePnts.push(s.newPoint({ mass: Spine_Mass }));
      this.hipCage = s.newP4Cage(this.hip, this.spinePnts[0], t.legR_head, t.legL_head);
      this.chestCage = s.newP4Cage(this.spinePnts[r.spine.count - 1], this.spinePnts[r.spine.count], t.armR_head, t.armL_head);
      for (let i2 = 0; i2 < r.spine.count - 1; i2++) {
        this.spineCage.push(s.newAxisCage(this.spinePnts[i2], this.spinePnts[i2 + 1]));
      }
      s.newLink(this.chestCage.pTail, this.head.pHead);
    }
  }
  _defineRenderLines() {
    this.lines.push(new RenderLine_default(this.head.pHead.pos, this.head.pPole.pos), new RenderLine_default(this.head.pHead.pos, this.head.pEff.pos), new RenderLine_default(this.head.pPole.pos, this.head.pEff.pos), new RenderLine_default(this.head.pHead.pos, this.head.pPole.pos), new RenderLine_default(this.head.pHead.pos, this.chestCage.pTail.pos), new RenderLine_default(this.chestCage.pTail.pos, this.chestCage.pHead.pos), new RenderLine_default(this.chestCage.pHead.pos, this.chestCage.pPole.pos), new RenderLine_default(this.chestCage.pTail.pos, this.armL.pHead.pos), new RenderLine_default(this.armL.pHead.pos, this.armL.pPole.pos), new RenderLine_default(this.armL.pPole.pos, this.armL.pTail.pos), new RenderLine_default(this.armL.pTail.pos, this.handL.pEff.pos), new RenderLine_default(this.armL.pTail.pos, this.handL.pPole.pos), new RenderLine_default(this.handL.pEff.pos, this.handL.pPole.pos), new RenderLine_default(this.chestCage.pTail.pos, this.armR.pHead.pos), new RenderLine_default(this.armR.pHead.pos, this.armR.pPole.pos), new RenderLine_default(this.armR.pPole.pos, this.armR.pTail.pos), new RenderLine_default(this.armR.pTail.pos, this.handR.pEff.pos), new RenderLine_default(this.armR.pTail.pos, this.handR.pPole.pos), new RenderLine_default(this.handR.pEff.pos, this.handR.pPole.pos), new RenderLine_default(this.legL.pHead.pos, this.legL.pPole.pos), new RenderLine_default(this.legL.pPole.pos, this.legL.pTail.pos), new RenderLine_default(this.legL.pTail.pos, this.footL.pEff.pos), new RenderLine_default(this.legL.pTail.pos, this.footL.pPole.pos), new RenderLine_default(this.footL.pEff.pos, this.footL.pPole.pos), new RenderLine_default(this.legR.pHead.pos, this.legR.pPole.pos), new RenderLine_default(this.legR.pPole.pos, this.legR.pTail.pos), new RenderLine_default(this.legR.pTail.pos, this.footR.pEff.pos), new RenderLine_default(this.legR.pTail.pos, this.footR.pPole.pos), new RenderLine_default(this.footR.pEff.pos, this.footR.pPole.pos), new RenderLine_default(this.hipCage.pHead.pos, this.hipCage.pLeft.pos), new RenderLine_default(this.hipCage.pHead.pos, this.hipCage.pRight.pos), new RenderLine_default(this.hipCage.pHead.pos, this.hipCage.pPole.pos), new RenderLine_default(this.hipCage.pHead.pos, this.hipCage.pTail.pos));
    for (let c of this.spineCage) {
      this.lines.push(new RenderLine_default(c.pHead.pos, c.pTail.pos));
      this.lines.push(new RenderLine_default(c.pHead.pos, c.pPole.pos));
    }
  }
  bindPose(pose, resetConstraints, debug) {
    const r = this.rig;
    let p1;
    let p2;
    if (r.hip) {
      this.hip.setPos(r.hip.getStartPosition(pose));
      this.hipCage.updatePole();
    }
    if (r.head) {
      p1 = r.head.getStartPosition(pose);
      p2 = r.head.getTailPosition(pose);
      this.head.pHead.setPos(p1);
      this.head.setPoleOffset(p1, [0, 0, 0.2], [0, p2[1] - p1[1], 0]);
    }
    if (r.spine) {
      let lnk;
      for (let i = 0; i < r.spine.count; i++) {
        this.spinePnts[i].setPos(r.spine.getPositionAt(pose, i));
      }
      this.spinePnts[r.spine.count].setPos(r.spine.getTailPosition(pose));
      this.chestCage.updatePole();
      for (let i of this.spineCage)
        i.updatePole();
    }
    if (r.legR)
      this._bindLimb(r.legR, pose, this.legR);
    if (r.legL)
      this._bindLimb(r.legL, pose, this.legL);
    if (r.armR)
      this._bindLimb(r.armR, pose, this.armR);
    if (r.armL)
      this._bindLimb(r.armL, pose, this.armL);
    if (r.footL) {
      p1 = this.legL.pTail.pos;
      p2 = r.footL.getTailPosition(pose);
      this.footL.setPoleOffset(p1, [0, 0, p2[2] - p1[2]], [0, p2[1] - p1[1], 0]);
    }
    if (r.footR) {
      p1 = this.legR.pTail.pos;
      p2 = r.footR.getTailPosition(pose);
      this.footR.setPoleOffset(p1, [0, 0, p2[2] - p1[2]], [0, p2[1] - p1[1], 0]);
    }
    if (r.handL) {
      p1 = this.armL.pTail.pos;
      p2 = r.handL.getTailPosition(pose);
      this.handL.setPoleOffset(p1, [p2[0] - p1[0], 0, 0], [0, 0, -0.1]);
    }
    if (r.handR) {
      p1 = this.armR.pTail.pos;
      p2 = r.handR.getTailPosition(pose);
      this.handR.setPoleOffset(p1, [p2[0] - p1[0], 0, 0], [0, 0, -0.1]);
    }
    if (resetConstraints)
      this.skeleton.rebindConstraints();
    return this;
  }
  _bindLimb(chain, pose, limb) {
    limb.pHead.setPos(chain.getStartPosition(pose));
    limb.pPole.setPos(chain.getMiddlePosition(pose));
    limb.pTail.setPos(chain.getTailPosition(pose));
  }
  setPointPos(idx, pos) {
    this.skeleton.setPos(idx, pos);
    return this;
  }
  resolve() {
    this.skeleton.resolve();
    return this;
  }
  resolveForPole(pIdx) {
    let cage;
    let cage2;
    if (this.armL.pPole.idx == pIdx) {
      cage = this.armL;
      cage2 = this.handL;
    } else if (this.armR.pPole.idx == pIdx) {
      cage = this.armR;
      cage2 = this.handR;
    } else if (this.chestCage.pPole.idx == pIdx)
      cage = this.chestCage;
    else if (this.hipCage.pPole.idx == pIdx)
      cage = this.hipCage;
    else if (this.legR.pPole.idx == pIdx) {
      cage = this.legR;
      cage2 = this.footR;
    } else if (this.legL.pPole.idx == pIdx) {
      cage = this.legL;
      cage2 = this.footL;
    } else if (this.head.pPole.idx == pIdx || this.head.pEff.idx == pIdx)
      cage = this.head;
    else if (this.footL.pPole.idx == pIdx || this.footL.pEff.idx == pIdx)
      cage = this.footL;
    else if (this.footR.pPole.idx == pIdx || this.footR.pEff.idx == pIdx)
      cage = this.footR;
    else if (this.handL.pPole.idx == pIdx || this.handL.pEff.idx == pIdx)
      cage = this.handL;
    else if (this.handR.pPole.idx == pIdx || this.handR.pEff.idx == pIdx)
      cage = this.handR;
    else {
      for (let c of this.spineCage) {
        if (c.pPole.idx == pIdx) {
          cage = c;
          break;
        }
      }
    }
    if (!cage) {
      console.warn("Can not found Verlet Cage that pole belongs to:", pIdx);
      return this;
    }
    let isDone = false;
    let i = 0;
    cage.poleMode(true);
    do {
      isDone = true;
      if (!cage.resolve())
        isDone = false;
      if (cage2 && !cage2.resolve())
        isDone = false;
      i++;
    } while (!isDone && i < this.skeleton.iterations);
    cage.poleMode(false);
    return this;
  }
  updateRigTargets() {
    const r = this.rig;
    const effDir = [0, 0, 0];
    const poleDir = [0, 0, 0];
    this.hipCage.getAxis(effDir, poleDir);
    r.hip?.solver.setTargetDir(effDir, poleDir).setMovePos(this.hipCage.getHeadPos(), true);
    this.head.getAxis(effDir, poleDir);
    r.head?.solver.setTargetDir(effDir, poleDir);
    r.armL?.solver.setTargetPos(this.armL.getTailPos()).setTargetPole(this.armL.getPoleDir(poleDir));
    r.armR?.solver.setTargetPos(this.armR.getTailPos()).setTargetPole(this.armR.getPoleDir(poleDir));
    this.handL.getAxis(effDir, poleDir);
    r.handL?.solver.setTargetDir(effDir, poleDir);
    this.handR.getAxis(effDir, poleDir);
    r.handR?.solver.setTargetDir(effDir, poleDir);
    r.legL?.solver.setTargetPos(this.legL.getTailPos()).setTargetPole(this.legL.getPoleDir(poleDir));
    r.legR?.solver.setTargetPos(this.legR.getTailPos()).setTargetPole(this.legR.getPoleDir(poleDir));
    this.footL.getAxis(effDir, poleDir);
    r.footL?.solver.setTargetDir(effDir, poleDir);
    this.footR.getAxis(effDir, poleDir);
    r.footR?.solver.setTargetDir(effDir, poleDir);
    if (r.spine) {
      const aEff = [];
      const aPol = [];
      for (let i = 0; i < this.spineCage.length; i++) {
        this.spineCage[i].getAxis(poleDir, effDir);
        aEff.push(effDir.slice(0));
        aPol.push(poleDir.slice(0));
      }
      this.chestCage.getAxis(poleDir, effDir);
      aEff.push(effDir.slice(0));
      aPol.push(poleDir.slice(0));
      r.spine.solver.setChainDir(aEff, aPol);
    }
  }
};
var BipedFBIK_default = BipedFBIK;
var IKData_exports = {};
__export(IKData_exports, {
  Dir: () => Dir,
  DirEnds: () => DirEnds,
  DirScale: () => DirScale,
  Hip: () => Hip
});
var DirScale = class {
  constructor() {
    this.lenScale = 1;
    this.effectorDir = [0, 0, 0];
    this.poleDir = [0, 0, 0];
  }
};
var Dir = class {
  constructor() {
    this.effectorDir = [0, 0, 0];
    this.poleDir = [0, 0, 0];
  }
};
var DirEnds = class {
  constructor() {
    this.startEffectorDir = [0, 0, 0];
    this.startPoleDir = [0, 0, 0];
    this.endEffectorDir = [0, 0, 0];
    this.endPoleDir = [0, 0, 0];
  }
};
var Hip = class {
  constructor() {
    this.effectorDir = [0, 0, 0];
    this.poleDir = [0, 0, 0];
    this.pos = [0, 0, 0];
    this.bindHeight = 1;
    this.isAbsolute = false;
  }
};
var BipedIKPose = class {
  constructor() {
    this.hip = new Hip();
    this.spine = new DirEnds();
    this.head = new Dir();
    this.armL = new DirScale();
    this.armR = new DirScale();
    this.legL = new DirScale();
    this.legR = new DirScale();
    this.handL = new Dir();
    this.handR = new Dir();
    this.footL = new Dir();
    this.footR = new Dir();
  }
  computeFromRigPose(r, pose) {
    r.legL?.solver.ikDataFromPose(r.legL, pose, this.legL);
    r.legR?.solver.ikDataFromPose(r.legR, pose, this.legR);
    r.armR?.solver.ikDataFromPose(r.armR, pose, this.armR);
    r.armL?.solver.ikDataFromPose(r.armL, pose, this.armL);
    r.footL?.solver.ikDataFromPose(r.footL, pose, this.footL);
    r.footR?.solver.ikDataFromPose(r.footR, pose, this.footR);
    r.handR?.solver.ikDataFromPose(r.handR, pose, this.handR);
    r.handR?.solver.ikDataFromPose(r.handL, pose, this.handL);
    r.head?.solver.ikDataFromPose(r.head, pose, this.head);
    r.spine?.solver.ikDataFromPose(r.spine, pose, this.spine);
    r.hip?.solver.ikDataFromPose(r.hip, pose, this.hip);
  }
  applyToRig(r) {
    r.legL?.solver.setTargetDir(this.legL.effectorDir, this.legL.poleDir, this.legL.lenScale);
    r.legR?.solver.setTargetDir(this.legR.effectorDir, this.legR.poleDir, this.legR.lenScale);
    r.armL?.solver.setTargetDir(this.armL.effectorDir, this.armL.poleDir, this.armL.lenScale);
    r.armR?.solver.setTargetDir(this.armR.effectorDir, this.armR.poleDir, this.armR.lenScale);
    r.footL?.solver.setTargetDir(this.footL.effectorDir, this.footL.poleDir);
    r.footR?.solver.setTargetDir(this.footR.effectorDir, this.footR.poleDir);
    r.handL?.solver.setTargetDir(this.handL.effectorDir, this.handL.poleDir);
    r.handR?.solver.setTargetDir(this.handR.effectorDir, this.handR.poleDir);
    r.head?.solver.setTargetDir(this.head.effectorDir, this.head.poleDir);
    r.hip?.solver.setTargetDir(this.hip.effectorDir, this.hip.poleDir).setMovePos(this.hip.pos, this.hip.isAbsolute, this.hip.bindHeight);
    r.spine?.solver.setStartDir(this.spine.startEffectorDir, this.spine.startPoleDir).setEndDir(this.spine.endEffectorDir, this.spine.endPoleDir);
  }
};
var BipedIKPose_default = BipedIKPose;
import { Vec3 as Vec312, Transform as Transform7, Quat as Quat7 } from "./core.js";
var NaturalCCDSolver = class {
  constructor() {
    this.effectorPos = [0, 0, 0];
    this._minEffRng = 1e-3 ** 2;
    this._chainCnt = 0;
    this._tries = 30;
  }
  initData(pose, chain) {
    if (pose && chain) {
      const lnk = chain.last();
      const eff = new Vec312(0, lnk.len, 0);
      pose.bones[lnk.idx].world.transformVec3(eff);
      eff.copyTo(this.effectorPos);
    }
    if (chain) {
      const cnt = chain.count;
      this._chainCnt = cnt;
      this._world = new Array(cnt + 1);
      this._local = new Array(cnt + 1);
      for (let i = 0; i < cnt; i++) {
        this._world[i] = new Transform7();
        this._local[i] = new Transform7();
      }
      this._world[cnt] = new Transform7();
      this._local[cnt] = new Transform7([0, 0, 0, 1], [0, chain.last().len, 0], [1, 1, 1]);
    }
    return this;
  }
  setTargetPos(v) {
    this.effectorPos[0] = v[0];
    this.effectorPos[1] = v[1];
    this.effectorPos[2] = v[2];
    return this;
  }
  useArcSqrFactor(c, offset, useInv = false) {
    this._kFactor = new KFactorArcSqr(c, offset, useInv);
    return this;
  }
  setTries(v) {
    this._tries = v;
    return this;
  }
  resolve(chain, pose, debug) {
    const root = new Transform7();
    let lnk = chain.first();
    if (lnk.pidx == -1)
      root.copy(pose.offset);
    else
      pose.getWorldTransform(lnk.pidx, root);
    let i;
    for (i = 0; i < chain.count; i++) {
      this._local[i].copy(chain.links[i].bind);
    }
    this._updateWorld(0, root);
    if (Vec312.lenSq(this.effectorPos, this._getTailPos()) < this._minEffRng) {
      return;
    }
    for (i = 0; i < this._tries; i++) {
      if (this._iteration(chain, pose, root, debug))
        break;
    }
    for (i = 0; i < chain.count; i++) {
      pose.setLocalRot(chain.links[i].idx, this._local[i].rot);
    }
  }
  _updateWorld(startIdx, root) {
    const w = this._world;
    const l = this._local;
    let i;
    if (startIdx == 0) {
      w[0].fromMul(root, l[0]);
      startIdx++;
    }
    for (i = startIdx; i < w.length; i++) {
      w[i].fromMul(w[i - 1], l[i]);
    }
  }
  _getTailPos() {
    return this._world[this._world.length - 1].pos;
  }
  _iteration(chain, pose, root, debug) {
    const w = this._world;
    const l = this._local;
    const cnt = w.length - 1;
    const tail = w[cnt];
    const tailDir = new Vec312();
    const effDir = new Vec312();
    const lerpDir = new Vec312();
    const q = new Quat7();
    const k = this._kFactor;
    let i;
    let diff;
    let b;
    if (k)
      k.reset();
    for (i = cnt - 1; i >= 0; i--) {
      diff = Vec312.lenSq(tail.pos, this.effectorPos);
      if (diff <= this._minEffRng)
        return true;
      b = w[i];
      tailDir.fromSub(tail.pos, b.pos).norm();
      effDir.fromSub(this.effectorPos, b.pos).norm();
      if (k)
        k.apply(chain, chain.links[i], tailDir, effDir, lerpDir);
      else
        lerpDir.copy(effDir);
      q.fromUnitVecs(tailDir, lerpDir).mul(b.rot);
      if (i != 0)
        q.pmulInvert(w[i - 1].rot);
      else
        q.pmulInvert(root.rot);
      l[i].rot.copy(q);
      this._updateWorld(i, root);
    }
    return false;
  }
};
var KFactorArcSqr = class {
  constructor(c, offset, useInv = false) {
    this.arcLen = 0;
    this.useInv = false;
    this.c = c;
    this.offset = offset;
    this.useInv = useInv;
  }
  reset() {
    this.arcLen = 0;
  }
  apply(chain, lnk, tailDir, effDir, out) {
    this.arcLen += lnk.len;
    const k = !this.useInv ? this.c / Math.sqrt(this.arcLen + this.offset) : this.c / Math.sqrt(chain.length - this.arcLen + this.offset);
    out.fromLerp(tailDir, effDir, k).norm();
  }
};
var NaturalCCDSolver_default = NaturalCCDSolver;
export {
  BipedFBIK_default as BipedFBIK,
  BipedIKPose_default as BipedIKPose,
  BipedRig_default as BipedRig,
  HipSolver_default as HipSolver,
  IKChain,
  IKData_exports as IKData,
  IKRig_default as IKRig,
  LimbSolver_default as LimbSolver,
  Link,
  NaturalCCDSolver_default as NaturalCCDSolver,
  SwingTwistChainSolver_default as SwingTwistChainSolver,
  SwingTwistEndsSolver_default as SwingTwistEndsSolver,
  SwingTwistSolver_default as SwingTwistSolver
};
