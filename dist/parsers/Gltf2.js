var ComponentTypeMap = {
  5120: [1, Int8Array, "int8", "BYTE"],
  5121: [1, Uint8Array, "uint8", "UNSIGNED_BYTE"],
  5122: [2, Int16Array, "int16", "SHORT"],
  5123: [2, Uint16Array, "uint16", "UNSIGNED_SHORT"],
  5125: [4, Uint32Array, "uint32", "UNSIGNED_INT"],
  5126: [4, Float32Array, "float", "FLOAT"]
};
var ComponentVarMap = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
};
var Accessor = class {
  constructor(accessor, bufView, bin) {
    this.componentLen = 0;
    this.elementCnt = 0;
    this.byteOffset = 0;
    this.byteSize = 0;
    this.boundMin = null;
    this.boundMax = null;
    this.type = null;
    this.data = null;
    const [
      compByte,
      compType,
      typeName
    ] = ComponentTypeMap[accessor.componentType];
    if (!compType) {
      console.error("Unknown Component Type for Accessor", accessor.componentType);
      return;
    }
    this.componentLen = ComponentVarMap[accessor.type];
    this.elementCnt = accessor.count;
    this.byteOffset = (accessor.byteOffset || 0) + (bufView.byteOffset || 0);
    this.byteSize = this.elementCnt * this.componentLen * compByte;
    this.boundMin = accessor.min ? accessor.min.slice(0) : null;
    this.boundMax = accessor.max ? accessor.max.slice(0) : null;
    this.type = typeName;
    if (bin) {
      const size = this.elementCnt * this.componentLen;
      this.data = new compType(bin, this.byteOffset, size);
    }
  }
};
var Accessor_default = Accessor;
var Mesh = class {
  constructor() {
    this.index = null;
    this.name = null;
    this.primitives = [];
    this.position = null;
    this.rotation = null;
    this.scale = null;
  }
};
var Primitive = class {
  constructor() {
    this.materialName = null;
    this.materialIdx = null;
    this.indices = null;
    this.position = null;
    this.normal = null;
    this.tangent = null;
    this.texcoord_0 = null;
    this.texcoord_1 = null;
    this.color_0 = null;
    this.joints_0 = null;
    this.weights_0 = null;
  }
};
var Skin = class {
  constructor() {
    this.index = null;
    this.name = null;
    this.joints = [];
    this.position = null;
    this.rotation = null;
    this.scale = null;
  }
};
var SkinJoint = class {
  constructor() {
    this.name = null;
    this.index = null;
    this.parentIndex = null;
    this.bindMatrix = null;
    this.position = null;
    this.rotation = null;
    this.scale = null;
  }
};
var ETransform = {
  Rot: 0,
  Pos: 1,
  Scl: 2
};
var ELerp = {
  Step: 0,
  Linear: 1,
  Cubic: 2
};
var _Track = class {
  constructor() {
    this.transform = ETransform.Pos;
    this.interpolation = ELerp.Step;
    this.jointIndex = 0;
    this.timeStampIndex = 0;
  }
  static fromGltf(jointIdx, target, inter) {
    const t = new _Track();
    t.jointIndex = jointIdx;
    switch (target) {
      case "translation":
        t.transform = ETransform.Pos;
        break;
      case "rotation":
        t.transform = ETransform.Rot;
        break;
      case "scale":
        t.transform = ETransform.Scl;
        break;
    }
    switch (inter) {
      case "LINEAR":
        t.interpolation = ELerp.Linear;
        break;
      case "STEP":
        t.interpolation = ELerp.Step;
        break;
      case "CUBICSPLINE":
        t.interpolation = ELerp.Cubic;
        break;
    }
    return t;
  }
};
var Track = _Track;
Track.Transform = ETransform;
Track.Lerp = ELerp;
var Animation = class {
  constructor(name) {
    this.name = "";
    this.timestamps = [];
    this.tracks = [];
    if (name)
      this.name = name;
  }
};
var PoseJoint = class {
  constructor(idx, rot, pos, scl) {
    this.index = idx;
    this.rot = rot;
    this.pos = pos;
    this.scl = scl;
  }
};
var Pose = class {
  constructor(name) {
    this.name = "";
    this.joints = [];
    if (name)
      this.name = name;
  }
  add(idx, rot, pos, scl) {
    this.joints.push(new PoseJoint(idx, rot, pos, scl));
  }
};
var Gltf = class {
  constructor(json, bin) {
    this.json = json;
    this.bin = bin || new ArrayBuffer(0);
  }
  getNodeByName(n) {
    let o, i;
    for (i = 0; i < this.json.nodes.length; i++) {
      o = this.json.nodes[i];
      if (o.name == n)
        return [o, i];
    }
    return null;
  }
  getMeshNames() {
    const json = this.json, rtn = [];
    let i;
    for (i of json.meshes)
      rtn.push(i.name);
    return rtn;
  }
  getMeshByName(n) {
    let o, i;
    for (i = 0; i < this.json.meshes.length; i++) {
      o = this.json.meshes[i];
      if (o.name == n)
        return [o, i];
    }
    return null;
  }
  getMeshNodes(idx) {
    const out = [];
    let n;
    for (n of this.json.nodes) {
      if (n.mesh == idx)
        out.push(n);
    }
    return out;
  }
  getMesh(id) {
    if (!this.json.meshes) {
      console.warn("No Meshes in GLTF File");
      return null;
    }
    const json = this.json;
    let m = null;
    let mIdx = null;
    switch (typeof id) {
      case "string": {
        const tup = this.getMeshByName(id);
        if (tup !== null) {
          m = tup[0];
          mIdx = tup[1];
        }
        break;
      }
      case "number":
        if (id < json.meshes.length) {
          m = json.meshes[id];
          mIdx = id;
        }
        break;
      default:
        m = json.meshes[0];
        mIdx = 0;
        break;
    }
    if (m == null || mIdx == null) {
      console.warn("No Mesh Found", id);
      return null;
    }
    const mesh = new Mesh();
    mesh.name = m.name;
    mesh.index = mIdx;
    let p, prim, attr;
    for (p of m.primitives) {
      attr = p.attributes;
      prim = new Primitive();
      if (p.material != void 0 && p.material != null) {
        prim.materialIdx = p.material;
        prim.materialName = json.materials[p.material].name;
      }
      if (p.indices != void 0)
        prim.indices = this.parseAccessor(p.indices);
      if (attr.POSITION != void 0)
        prim.position = this.parseAccessor(attr.POSITION);
      if (attr.NORMAL != void 0)
        prim.normal = this.parseAccessor(attr.NORMAL);
      if (attr.TANGENT != void 0)
        prim.tangent = this.parseAccessor(attr.TANGENT);
      if (attr.TEXCOORD_0 != void 0)
        prim.texcoord_0 = this.parseAccessor(attr.TEXCOORD_0);
      if (attr.TEXCOORD_1 != void 0)
        prim.texcoord_1 = this.parseAccessor(attr.TEXCOORD_1);
      if (attr.JOINTS_0 != void 0)
        prim.joints_0 = this.parseAccessor(attr.JOINTS_0);
      if (attr.WEIGHTS_0 != void 0)
        prim.weights_0 = this.parseAccessor(attr.WEIGHTS_0);
      if (attr.COLOR_0 != void 0)
        prim.color_0 = this.parseAccessor(attr.COLOR_0);
      mesh.primitives.push(prim);
    }
    const nodes = this.getMeshNodes(mIdx);
    if (nodes?.length) {
      if (nodes[0].translation)
        mesh.position = nodes[0].translation.slice(0);
      if (nodes[0].rotation)
        mesh.rotation = nodes[0].rotation.slice(0);
      if (nodes[0].scale)
        mesh.scale = nodes[0].scale.slice(0);
    }
    return mesh;
  }
  getSkinNames() {
    const json = this.json, rtn = [];
    let i;
    for (i of json.skins)
      rtn.push(i.name);
    return rtn;
  }
  getSkinByName(n) {
    let o, i;
    for (i = 0; i < this.json.skins.length; i++) {
      o = this.json.skins[i];
      if (o.name == n)
        return [o, i];
    }
    return null;
  }
  getSkin(id) {
    if (!this.json.skins) {
      console.warn("No Skins in GLTF File");
      return null;
    }
    const json = this.json;
    let js = null;
    let idx = null;
    switch (typeof id) {
      case "string": {
        const tup = this.getSkinByName(id);
        if (tup !== null) {
          js = tup[0];
          idx = tup[1];
        }
        break;
      }
      case "number":
        if (id < json.skins.length) {
          js = json.meshes[id];
          idx = id;
        }
        break;
      default:
        js = json.skins[0];
        idx = 0;
        break;
    }
    if (js == null) {
      console.warn("No Skin Found", id);
      return null;
    }
    const bind = this.parseAccessor(js.inverseBindMatrices);
    if (bind && bind.elementCnt != js.joints.length) {
      console.warn("Strange Error. Joint Count & Bind Matrix Count dont match");
      return null;
    }
    let i, bi, ni, joint, node;
    const jMap = new Map();
    const skin = new Skin();
    skin.name = js.name;
    skin.index = idx;
    for (i = 0; i < js.joints.length; i++) {
      ni = js.joints[i];
      node = json.nodes[ni];
      jMap.set(ni, i);
      joint = new SkinJoint();
      joint.index = i;
      joint.name = node.name ? node.name : "bone_" + i;
      joint.rotation = node?.rotation?.slice(0) ?? null;
      joint.position = node?.translation?.slice(0) ?? null;
      joint.scale = node?.scale?.slice(0) ?? null;
      if (bind && bind.data) {
        bi = i * 16;
        joint.bindMatrix = Array.from(bind.data.slice(bi, bi + 16));
      }
      if (joint.scale) {
        if (Math.abs(1 - joint.scale[0]) <= 1e-6)
          joint.scale[0] = 1;
        if (Math.abs(1 - joint.scale[1]) <= 1e-6)
          joint.scale[1] = 1;
        if (Math.abs(1 - joint.scale[2]) <= 1e-6)
          joint.scale[2] = 1;
      }
      skin.joints.push(joint);
    }
    let j;
    for (i = 0; i < js.joints.length; i++) {
      ni = js.joints[i];
      node = json.nodes[ni];
      if (node?.children?.length) {
        for (j = 0; j < node.children.length; j++) {
          bi = jMap.get(node.children[j]);
          skin.joints[bi].parentIndex = i;
        }
      }
    }
    if (skin.name) {
      const snode = this.getNodeByName(skin.name);
      if (snode) {
        const n = snode[0];
        skin.rotation = n?.rotation?.slice(0) ?? null;
        skin.position = n?.translation?.slice(0) ?? null;
        skin.scale = n?.scale?.slice(0) ?? null;
      }
    }
    return skin;
  }
  getMaterial(id) {
    console.log(id);
    if (!this.json.materials) {
      console.warn("No Materials in GLTF File");
      return null;
    }
    const json = this.json;
    let mat = null;
    switch (typeof id) {
      case "number":
        if (id < json.materials.length) {
          mat = json.materials[id].pbrMetallicRoughness;
        }
        break;
      default:
        mat = json.materials[0].pbrMetallicRoughness;
        break;
    }
    return mat;
  }
  getAnimationNames() {
    const json = this.json, rtn = [];
    let i;
    for (i of json.animations)
      rtn.push(i.name);
    return rtn;
  }
  getAnimationByName(n) {
    let o, i;
    for (i = 0; i < this.json.animations.length; i++) {
      o = this.json.animations[i];
      if (o.name == n)
        return [o, i];
    }
    return null;
  }
  getAnimation(id) {
    if (!this.json.animations) {
      console.warn("No Animations in GLTF File");
      return null;
    }
    const json = this.json;
    let js = null;
    let idx = null;
    switch (typeof id) {
      case "string": {
        const tup = this.getAnimationByName(id);
        if (tup !== null) {
          js = tup[0];
          idx = tup[1];
        }
        break;
      }
      case "number":
        if (id < json.animations.length) {
          js = json.animations[id];
          idx = id;
        }
        break;
      default:
        js = json.animations[0];
        idx = 0;
        break;
    }
    if (js == null) {
      console.warn("No Animation Found", id);
      return null;
    }
    const NJMap = new Map();
    const timeStamps = [];
    const tsMap = new Map();
    const fnGetJoint = (nIdx) => {
      let jIdx = NJMap.get(nIdx);
      if (jIdx != void 0)
        return jIdx;
      for (let skin of this.json.skins) {
        jIdx = skin.joints.indexOf(nIdx);
        if (jIdx != -1 && jIdx != void 0) {
          NJMap.set(nIdx, jIdx);
          return jIdx;
        }
      }
      return -1;
    };
    const fnGetTimestamp = (sIdx) => {
      let aIdx = tsMap.get(sIdx);
      if (aIdx != void 0)
        return aIdx;
      const acc2 = this.parseAccessor(sIdx);
      if (acc2) {
        aIdx = timeStamps.length;
        timeStamps.push(acc2);
        tsMap.set(sIdx, aIdx);
        return aIdx;
      }
      return -1;
    };
    const anim = new Animation(js.name);
    anim.timestamps = timeStamps;
    let track;
    let ch;
    let jointIdx;
    let sampler;
    let acc;
    for (ch of js.channels) {
      jointIdx = fnGetJoint(ch.target.node);
      sampler = js.samplers[ch.sampler];
      track = Track.fromGltf(jointIdx, ch.target.path, sampler.interpolation);
      acc = this.parseAccessor(sampler.output);
      if (acc)
        track.keyframes = acc;
      track.timeStampIndex = fnGetTimestamp(sampler.input);
      anim.tracks.push(track);
    }
    return anim;
  }
  getPoseByName(n) {
    let o, i;
    for (i = 0; i < this.json.poses.length; i++) {
      o = this.json.poses[i];
      if (o.name == n)
        return [o, i];
    }
    return null;
  }
  getPose(id) {
    if (!this.json.poses) {
      console.warn("No Poses in GLTF File");
      return null;
    }
    const json = this.json;
    let js = null;
    let idx = null;
    switch (typeof id) {
      case "string": {
        const tup = this.getPoseByName(id);
        if (tup !== null) {
          js = tup[0];
          idx = tup[1];
        }
        break;
      }
      default:
        js = json.poses[0];
        idx = 0;
        break;
    }
    if (js == null) {
      console.warn("No Pose Found", id);
      return null;
    }
    const pose = new Pose(js.name);
    let jnt;
    for (jnt of js.joints) {
      pose.add(jnt.idx, jnt.rot, jnt.pos, jnt.scl);
    }
    return pose;
  }
  parseAccessor(accID) {
    const accessor = this.json.accessors[accID];
    const bufView = this.json.bufferViews[accessor.bufferView];
    if (bufView.byteStride) {
      console.error("UNSUPPORTED - Parsing Stride Buffer");
      return null;
    }
    return new Accessor_default(accessor, bufView, this.bin);
  }
  static async fetch(url) {
    let bin;
    const json = await fetch(url).then((r) => {
      return r.ok ? r.json() : null;
    });
    if (!json)
      return null;
    if (json.buffers && json.buffers.length > 0) {
      const path = url.substring(0, url.lastIndexOf("/") + 1);
      bin = await fetch(path + json.buffers[0].uri).then((r) => r.arrayBuffer());
    }
    return new Gltf(json, bin);
  }
};
var src_default = Gltf;
export {
  Accessor_default as Accessor,
  src_default as default
};
