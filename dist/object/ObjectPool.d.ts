declare class ObjectPoolItem {
    obj: any;
    inUse: boolean;
    constructor(obj: any);
}
declare class ObjectPool {
    items: Array<ObjectPoolItem>;
    avail: Array<ObjectPoolItem>;
    onNew?: (() => any) | null;
    constructor(fnNew?: null);
    _createNew(): ObjectPoolItem | undefined;
    get(): any;
    recycle(o: any): ObjectPool;
}
export default ObjectPool;
