/** Generic Iterator Object
 * @example
    class Test{
        static iter() : Iter< number >{
            let          i = 0;
            const data   = [0,1,2,3];
            const result : IterResult< number >     = { value:0, done:false };
            const next   : ()=>IterResult< number > = ()=>{
                if( i >= data.length ){
                    result.done  = true;
                }else{
                    result.value = data[ i ];
                    i++;
                }
                return result;
            };

            return new Iter<number>( next );
        }
    }
*/
class Iter {
    next;
    constructor(fn) {
        this.next = fn;
    }
    [Symbol.iterator]() {
        return this;
    }
}
/*
interface IterNext {
    value: Vertex | null,
    done : boolean,
}

iter() : { [Symbol.iterator]() : { next:()=>IterNext } } {
    let   i       = 0;
    const result : IterNext = { value:null, done:false };
    const len               = this.items.length;
    const next              = ()=>{
        if( i >= len ) result.done = true;
        else{
            result.value = this.items[ i ];
            i++;
        }
        return result;
    };

    return { [Symbol.iterator](){ return { next }; } };
}
*/
export default Iter;
