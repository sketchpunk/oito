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
  getTailPosition(pose) {
    const b = pose.bones[this.links[this.count - 1].idx];
    const v = new Vec3(0, b.len, 0);
    return b.world.transformVec3(v).toArray();
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
  setTargetDir(e, pole) {
    this._isTarPosition = false;
    this.effectorDir[0] = e[0];
    this.effectorDir[1] = e[1];
    this.effectorDir[2] = e[2];
    if (pole)
      this.setTargetPole(pole);
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
    return [rot, pt];
  }
};
var SwingTwistSolver_default = SwingTwistSolver;
var HipSolver = class {
  constructor() {
    this.isAbs = true;
    this.position = [0, 0, 0];
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
  setMovePos(pos, isAbs = true) {
    this.position[0] = pos[0];
    this.position[1] = pos[1];
    this.position[2] = pos[2];
    this.isAbs = isAbs;
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
      hipPos.fromAdd(ct.pos, this.position);
    }
    ptInv.transformVec3(hipPos);
    pose.setLocalPos(lnk.idx, hipPos);
    this._swingTwist.resolve(chain, pose, debug);
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
  useDefaultSolvers(pose) {
    this.hip?.setSolver(new HipSolver_default().initData(pose, this.hip));
    this.armL?.setSolver(new LimbSolver_default().initData(pose, this.armL));
    this.armR?.setSolver(new LimbSolver_default().initData(pose, this.armR));
    this.legL?.setSolver(new LimbSolver_default().initData(pose, this.legL));
    this.legR?.setSolver(new LimbSolver_default().initData(pose, this.legR));
    this.footL?.setSolver(new SwingTwistSolver_default().initData(pose, this.footL));
    this.footR?.setSolver(new SwingTwistSolver_default().initData(pose, this.footR));
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
    if (this.footL)
      this.footL.bindAltDirections(pose, FWD, UP);
    if (this.footR)
      this.footR.bindAltDirections(pose, FWD, UP);
    if (this.legL)
      this.legL.bindAltDirections(pose, DN, FWD);
    if (this.legR)
      this.legR.bindAltDirections(pose, DN, FWD);
    if (this.armL)
      this.armL.bindAltDirections(pose, L, BAK);
    if (this.armR)
      this.armR.bindAltDirections(pose, R, BAK);
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
import { Vec3 as Vec37 } from "./core.js";
var VerletPoint = class {
  constructor(name, config) {
    this.pos = [0, 0, 0];
    this.mass = 1;
    this.isPinned = false;
    this.draggable = true;
    this.visible = true;
    this.name = name;
    if (config) {
      if (config.draggable !== void 0)
        this.draggable = config.draggable;
      if (config.visible !== void 0)
        this.visible = config.visible;
      if (config.mass !== void 0)
        this.mass = config.mass;
      if (config.pos) {
        this.pos[0] = config.pos[0];
        this.pos[1] = config.pos[1];
        this.pos[2] = config.pos[2];
      }
    }
  }
};
var VerletPoint_default = VerletPoint;
var VerletGroup = class {
  constructor(name, type, points) {
    this.count = 0;
    this.name = name;
    this.type = type;
    this.points = points;
    this.count = points.length;
  }
};
var VerletGroup_default = VerletGroup;
import { Vec3 as Vec36 } from "./core.js";
var DistanceConstraint = class {
  constructor(p0, p1) {
    this.lenSq = 0;
    this.len = 0;
    this.aAnchor = false;
    this.bAnchor = false;
    this.isRanged = false;
    this.dir = new Vec36();
    this.v = new Vec36();
    this.pa = p0;
    this.pb = p1;
    this.rebind();
  }
  rebind() {
    this.lenSq = Vec36.lenSq(this.pa.pos, this.pb.pos);
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
      aScl = this.pa.mass / (this.pa.mass + this.pb.mass) * stiffness;
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
var DistanceConstrant_default = DistanceConstraint;
var VerletSkeleton = class {
  constructor() {
    this._nameMap = new Map();
    this.points = [];
    this.constraints = [];
    this.groups = new Map();
    this.iterations = 5;
  }
  _getIndex(pnt) {
    if (typeof pnt == "number")
      return pnt;
    else if (typeof pnt == "string") {
      const i = this._nameMap.get(pnt);
      if (i != void 0)
        return i;
    }
    return -1;
  }
  addPoint(name, config) {
    const idx = this.points.length;
    this.points.push(new VerletPoint_default(name, config));
    this._nameMap.set(name, idx);
    return this;
  }
  getPoint(pnt) {
    let idx = this._getIndex(pnt);
    if (idx == -1)
      return void 0;
    return idx !== -1 ? this.points[idx] : void 0;
  }
  setPos(pnt, pos) {
    let idx = this._getIndex(pnt);
    if (idx == -1)
      return this;
    const p = this.points[idx];
    if (p) {
      p.pos[0] = pos[0];
      p.pos[1] = pos[1];
      p.pos[2] = pos[2];
    }
    return this;
  }
  setDraggable(pnt, s) {
    let idx = this._getIndex(pnt);
    if (idx == -1)
      return this;
    this.points[idx].draggable = s;
    return this;
  }
  setVisible(pnt, s) {
    let idx = this._getIndex(pnt);
    if (idx == -1)
      return this;
    this.points[idx].visible = s;
    return this;
  }
  iterPoints() {
    return this.points.values();
  }
  rangedSegmentGroup(grpName, aName, bName) {
    const a = this.getPoint(aName);
    const b = this.getPoint(bName);
    if (!a) {
      console.error("rangedSegmentGroup : Point Name not Found", aName);
      return this;
    }
    if (!b) {
      console.error("rangedSegmentGroup : Point Name not Found", bName);
      return this;
    }
    const pnts = [a, b];
    this.constraints.push(new DistanceConstrant_default(a, b).ranged());
    this.groups.set(grpName, new VerletGroup_default(grpName, "segment", pnts));
    return this;
  }
  segmentGroup(grpName, aName, bName) {
    const a = this.getPoint(aName);
    const b = this.getPoint(bName);
    if (!a) {
      console.error("segmentGroup : Point Name not Found", aName);
      return this;
    }
    if (!b) {
      console.error("segmentGroup : Point Name not Found", bName);
      return this;
    }
    const pnts = [a, b];
    this.constraints.push(new DistanceConstrant_default(a, b));
    this.groups.set(grpName, new VerletGroup_default(grpName, "segment", pnts));
    return this;
  }
  chainGroup(grpName, pntNames) {
    const pnts = new Array();
    const len = pntNames.length - 1;
    let a;
    let b;
    let i;
    let ii;
    for (i = 0; i < len; i++) {
      ii = i + 1;
      a = this.getPoint(pntNames[i]);
      if (!a) {
        console.error("chainGroup : Point Name not Found", pntNames[i]);
        return this;
      }
      b = this.getPoint(pntNames[ii]);
      if (!b) {
        console.error("chainGroup : Point Name not Found", pntNames[ii]);
        return this;
      }
      pnts.push(a);
      this.constraints.push(new DistanceConstrant_default(a, b));
    }
    a = this.getPoint(pntNames[len]);
    if (a)
      pnts.push(a);
    this.groups.set(grpName, new VerletGroup_default(grpName, "chain", pnts));
    return this;
  }
  triGroup(grpName, pntNames) {
    const pnts = new Array();
    const len = pntNames.length;
    let a;
    let b;
    let i;
    let ii;
    for (i = 0; i < len; i++) {
      ii = (i + 1) % len;
      a = this.getPoint(pntNames[i]);
      if (!a) {
        console.error("TriGroup : Point Name not Found", pntNames[i]);
        return this;
      }
      b = this.getPoint(pntNames[ii]);
      if (!b) {
        console.error("TriGroup : Point Name not Found", pntNames[ii]);
        return this;
      }
      pnts.push(a);
      this.constraints.push(new DistanceConstrant_default(a, b));
    }
    this.groups.set(grpName, new VerletGroup_default(grpName, "tri", pnts));
    return this;
  }
  axisGroup(pntMain, pntUp, pntEff, pntPol) {
    this.segmentGroup(pntMain + "__MU", pntMain, pntUp);
    this.segmentGroup(pntMain + "__ME", pntMain, pntEff);
    this.segmentGroup(pntMain + "__MP", pntMain, pntPol);
    this.segmentGroup(pntMain + "__UE", pntUp, pntEff);
    this.segmentGroup(pntMain + "__UP", pntUp, pntPol);
    this.segmentGroup(pntMain + "__EP", pntEff, pntPol);
    return this;
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
var BipedFB = class {
  constructor(rig) {
    this.skeleton = new VerletSkeleton_default();
    this.poleArmL = new Vec37();
    this.poleArmR = new Vec37();
    this.poleLegL = new Vec37();
    this.poleLegR = new Vec37();
    this._spineNames = [];
    this._armLnames = ["armL_head", "armL_mid", "armL_tail"];
    this._armRnames = ["armR_head", "armR_mid", "armR_tail"];
    this._legLnames = ["legL_head", "legL_mid", "legL_tail"];
    this._legRnames = ["legR_head", "legR_mid", "legR_tail"];
    this.rig = rig;
    this._build();
    this.skeleton.iterations = 5;
  }
  _build() {
    const r = this.rig;
    const s = this.skeleton;
    let spineCnt = 0;
    s.addPoint("hip", { mass: 1 });
    s.addPoint("hip_eff", { mass: 20 });
    if (r.spine) {
      let n;
      for (let lnk of r.spine.links) {
        n = "spine" + lnk.idx;
        this._spineNames.push(n);
        s.addPoint(n, { mass: 1 });
        s.addPoint(n + "_eff", { mass: 20 });
        s.addPoint(n + "_pol", { mass: 20, visible: false });
      }
      let nn;
      for (let i = 0; i < this._spineNames.length - 1; i++) {
        n = this._spineNames[i];
        nn = this._spineNames[i + 1];
        s.axisGroup(n, nn, n + "_eff", n + "_pol");
      }
      n = this._spineNames[this._spineNames.length - 1];
      s.addPoint("spine_tail", { mass: 1 });
      s.axisGroup(n, "spine_tail", n + "_eff", n + "_pol");
      spineCnt = this._spineNames.length;
    }
    s.addPoint(this._armLnames[0], { mass: 10 }).addPoint(this._armLnames[1], { mass: 30 }).addPoint(this._armLnames[2], { mass: 10 });
    s.addPoint(this._armRnames[0], { mass: 10 }).addPoint(this._armRnames[1], { mass: 30 }).addPoint(this._armRnames[2], { mass: 10 });
    s.addPoint(this._legLnames[0], { mass: 10 }).addPoint(this._legLnames[1], { mass: 30 }).addPoint(this._legLnames[2], { mass: 10 });
    s.addPoint(this._legRnames[0], { mass: 10 }).addPoint(this._legRnames[1], { mass: 30 }).addPoint(this._legRnames[2], { mass: 10 });
    s.triGroup("hip", ["hip", "legL_head", "legR_head"]).segmentGroup("hipSpineH", this._spineNames[0], "hip").segmentGroup("hipSpineL", this._spineNames[0], "legL_head").segmentGroup("hipSpineR", this._spineNames[0], "legR_head").segmentGroup("hipSpineEH", "hip_eff", "hip").segmentGroup("hipSpineEL", "hip_eff", "legL_head").segmentGroup("hipSpineER", "hip_eff", "legR_head").segmentGroup("hipSpineES", "hip_eff", this._spineNames[0]).segmentGroup("chestRL", this._armLnames[0], this._armRnames[0]).segmentGroup("chestLT", this._armLnames[0], "spine_tail").segmentGroup("chestLH", this._armLnames[0], this._spineNames[spineCnt - 1]).segmentGroup("chestLE", this._armLnames[0], this._spineNames[spineCnt - 1] + "_eff").segmentGroup("chestRT", this._armRnames[0], "spine_tail").segmentGroup("chestRH", this._armRnames[0], this._spineNames[spineCnt - 1]).segmentGroup("chestRE", this._armRnames[0], this._spineNames[spineCnt - 1] + "_eff").chainGroup("armL", this._armLnames).chainGroup("armR", this._armRnames).chainGroup("legL", this._legLnames).chainGroup("legR", this._legRnames);
  }
  bindPose(pose, debug) {
    const r = this.rig;
    const s = this.skeleton;
    const v = new Vec37();
    let i;
    let pos;
    if (r.hip) {
      pos = r.hip.getStartPosition(pose);
      s.setPos("hip", pos);
      s.setPos("hip_eff", v.fromAdd(pos, [0, 0, 0.1]));
    }
    if (r.spine) {
      for (i = 0; i < r.spine.count; i++) {
        pos = pose.getBoneWorldPos(r.spine.links[i].idx);
        s.setPos(this._spineNames[i], pos);
        s.setPos(this._spineNames[i] + "_eff", v.fromAdd(pos, [0, 0, 0.1]));
        s.setPos(this._spineNames[i] + "_pol", v.fromAdd(pos, [0.1, 0, 0]));
      }
      this.skeleton.setPos("spine_tail", r.spine.getTailPosition(pose));
    }
    if (r.armL)
      this._bindLimb(r.armL, pose, this._armLnames);
    if (r.armR)
      this._bindLimb(r.armR, pose, this._armRnames);
    if (r.legL)
      this._bindLimb(r.legL, pose, this._legLnames);
    if (r.legR)
      this._bindLimb(r.legR, pose, this._legRnames);
    this.skeleton.rebindConstraints();
    return this;
  }
  _bindLimb(chain, pose, names) {
    const pos = chain.getMiddlePosition(pose);
    this.skeleton.setPos(names[0], chain.getStartPosition(pose));
    this.skeleton.setPos(names[1], pos);
    this.skeleton.setPos(names[2], chain.getTailPosition(pose));
    return pos;
  }
  updateRigTargets() {
    const r = this.rig;
    const s = this.skeleton;
    let a;
    let b;
    let c;
    const v0 = new Vec37();
    const v1 = new Vec37();
    const v2 = new Vec37();
    a = s.getPoint("armL_head")?.pos;
    b = s.getPoint("armL_mid")?.pos;
    c = s.getPoint("armL_tail")?.pos;
    r.armL?.solver.setTargetPos(c);
    r.armL?.solver.setTargetPole(calcPole(a, b, c));
    a = s.getPoint("armR_head")?.pos;
    b = s.getPoint("armR_mid")?.pos;
    c = s.getPoint("armR_tail")?.pos;
    r.armR?.solver.setTargetPos(c);
    r.armR?.solver.setTargetPole(calcPole(a, b, c));
    a = s.getPoint("legL_head")?.pos;
    b = s.getPoint("legL_mid")?.pos;
    c = s.getPoint("legL_tail")?.pos;
    r.legL?.solver.setTargetPos(c);
    r.legL?.solver.setTargetPole(calcPole(a, b, c));
    a = s.getPoint("legR_head")?.pos;
    b = s.getPoint("legR_mid")?.pos;
    c = s.getPoint("legR_tail")?.pos;
    r.legR?.solver.setTargetPos(c);
    r.legR?.solver.setTargetPole(calcPole(a, b, c));
    if (r.spine) {
      let n;
      let aEff = [];
      let aPol = [];
      for (let i = 0; i < this._spineNames.length; i++) {
        n = this._spineNames[i];
        a = s.getPoint(n)?.pos;
        b = s.getPoint(n + "_eff")?.pos;
        c = s.getPoint(n + "_pol")?.pos;
        v0.fromSub(b, a);
        v1.fromSub(c, a);
        v2.fromCross(v0, v1);
        aEff.push(v2.norm().toArray());
        aPol.push(v0.norm().toArray());
        r.spine?.solver.setChainDir(aEff, aPol);
      }
    }
    a = s.getPoint(this._legLnames[0])?.pos;
    b = s.getPoint(this._legRnames[0])?.pos;
    v1.fromSub(a, b);
    a = s.getPoint("hip")?.pos;
    b = s.getPoint("hip_eff")?.pos;
    v0.fromSub(b, a);
    v2.fromCross(v0, v1);
    r.hip?.solver.setTargetDir(v0.norm(), v2.norm()).setMovePos(a, true);
  }
};
var V0 = new Vec37();
var V1 = new Vec37();
var V2 = new Vec37();
function calcPole(a, b, c) {
  V0.fromSub(c, a);
  V1.fromSub(b, a);
  V2.fromCross(V1, V0);
  return V1.fromCross(V0, V2).norm();
}
var BipedFB_default = BipedFB;
import { Vec3 as Vec38, Quat as Quat6 } from "./core.js";
var SwingTwistEndsSolver = class {
  constructor() {
    this.startEffectorDir = [0, 0, 0];
    this.startPoleDir = [0, 0, 0];
    this.endEffectorDir = [0, 0, 0];
    this.endPoleDir = [0, 0, 0];
  }
  initData(pose, chain) {
    if (pose && chain) {
      const pole = new Vec38();
      const eff = new Vec38();
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
    const ikEffe = new Vec38();
    const ikPole = new Vec38();
    const dir = new Vec38();
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
};
var SwingTwistEndsSolver_default = SwingTwistEndsSolver;
import { Vec3 as Vec39, Transform as Transform8, Quat as Quat7 } from "./core.js";
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
      const eff = new Vec39(0, lnk.len, 0);
      pose.bones[lnk.idx].world.transformVec3(eff);
      eff.copyTo(this.effectorPos);
    }
    if (chain) {
      const cnt = chain.count;
      this._chainCnt = cnt;
      this._world = new Array(cnt + 1);
      this._local = new Array(cnt + 1);
      for (let i = 0; i < cnt; i++) {
        this._world[i] = new Transform8();
        this._local[i] = new Transform8();
      }
      this._world[cnt] = new Transform8();
      this._local[cnt] = new Transform8([0, 0, 0, 1], [0, chain.last().len, 0], [1, 1, 1]);
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
    const root = new Transform8();
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
    if (Vec39.lenSq(this.effectorPos, this._getTailPos()) < this._minEffRng) {
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
    const tailDir = new Vec39();
    const effDir = new Vec39();
    const lerpDir = new Vec39();
    const q = new Quat7();
    const k = this._kFactor;
    let i;
    let diff;
    let b;
    if (k)
      k.reset();
    for (i = cnt - 1; i >= 0; i--) {
      diff = Vec39.lenSq(tail.pos, this.effectorPos);
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
  BipedFB_default as BipedFB,
  BipedRig_default as BipedRig,
  HipSolver_default as HipSolver,
  IKChain,
  IKRig_default as IKRig,
  LimbSolver_default as LimbSolver,
  Link,
  NaturalCCDSolver_default as NaturalCCDSolver,
  SwingTwistChainSolver_default as SwingTwistChainSolver,
  SwingTwistEndsSolver_default as SwingTwistEndsSolver,
  SwingTwistSolver_default as SwingTwistSolver
};
