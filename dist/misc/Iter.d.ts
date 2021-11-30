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
interface IterResult<T> {
    done: boolean;
    value: T;
}
declare class Iter<T> {
    next: () => IterResult<T>;
    constructor(fn: () => IterResult<T>);
    [Symbol.iterator](): IterableIterator<T>;
}
export default Iter;
export type { IterResult };
