/* eslint-disable @typescript-eslint/no-explicit-any */

class ObjectPoolItem{
    obj     : any;
    inUse   = false;
    constructor( obj: any ){ this.obj = obj; }
}

class ObjectPool{
    items  : Array<ObjectPoolItem> = [];
    avail  : Array<ObjectPoolItem> = [];
    onNew ?: (()=>any) | null;
    
    constructor( fnNew=null ){
        this.onNew = fnNew;
    }

    _createNew() : ObjectPoolItem | undefined {
        if( !this.onNew ) return undefined;

        const i = new ObjectPoolItem( this.onNew() );
        this.items.push( i );

        return i;
    }

    get() : any{
        const i : ObjectPoolItem | undefined = ( this.avail.length != 0 )? this.avail.pop() : this._createNew();
        if( !i ) return null;

        i.inUse = true;
        return i.obj;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    recycle( o: any ) : ObjectPool{
        let i;
        for( i of this.items ){
            if( i.obj === o ){
                i.inUse = false;
                this.avail.push( i );
                break;
            }
        }
        return this;
    }
}

export default ObjectPool;