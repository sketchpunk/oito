/*
Create a class that Extends Multiple classes.
You use functions to dynamiclly assign an extends class.
Then each function in the chain will extend the previous object till the final object extends the merged class.

const extender = ( ...parts )=>parts.reduce( ( prev, curr )=>curr( prev ), class Base{} );

function AA( base ){
    return class AA extends base {
        a = "a";
        aa(){ console.log( this.a ); }
    }
}

function BB( base ){
    return class BB extends base{
        b = "b";
        bb(){ console.log( this.b ); }
    }
}

class AB extends extender( AA, BB ){}

let ab = new AB();
ab.aa()
ab.bb();
console.log( AB );
*/

type ClsFn = ( cls:unknown )=>unknown;

function Extender( ...parts: Array< ClsFn > ): unknown {
    return parts.reduce(
        ( prev: unknown, curr: ClsFn )=>curr( prev ),
        class Base{}
    );
}

export default Extender;