import Vec3     from "../../Vec3.js";
import Maths    from "../../Maths.js";

class Twist{
    //#region VALUES
    startPoint  = new Vec3( 0, -1.0, 0 );
    endPoint    = new Vec3( 0, 1.0, 0 );
    startAngle  = -45 * Math.PI / 180;
    endAngle    = 45 * Math.PI / 180;
    //#endregion 

    //#region SETTERS/GETTERS
    setYRange( start: number, end: number ) : this{
        this.startPoint[ 1 ]    = start;
        this.endPoint[ 1 ]      = end;
        return this;
    }

    setAngles( startAng: number, endAng: number ) : this{
        this.startAngle = startAng  * Maths.DEG2RAD;
        this.endAngle   = endAng    * Maths.DEG2RAD;
        return this;
    }
    //#endregion

    // https://github.com/keenanwoodall/Deform/blob/master/Code/Runtime/Mesh/Deformers/TwistDeformer.cs
    apply( verts: Array<number> ) : void{
        const posRange  = this.endPoint[1] - this.startPoint[1];
        const startPos  = this.startPoint[ 1 ];
        const v         = new Vec3();
        let t   = 0, 
            ang = 0, 
            c   = 0, 
            s   = 0, 
            y   = 0;

        /* TODO 
        Original code was able to deform from any axis created by two points. What it did was create a rotation
        matrix that rotated the model so it's axis aligns with UP, then do a Y Rotation on the verts then rotate
        the vertice back. That should be double to do with two quaternions
        */
        for( let i=0; i < verts.length; i+=3 ){
            v.fromBuf( verts, i );
            // TODO : Rotate to fit the correct Start+End Axis

            y       = Maths.clamp( v[1], this.startPoint[1], this.endPoint[1] );
            
            t       = ( y - startPos ) / posRange;  // TODO, Can Add Various Easing or Curves to Change the Lerping between Angles

            ang     = this.startAngle * ( 1-t ) + this.endAngle * t + Math.PI;  // Adding PI to the end makes it work, dont know why
            c       = Math.cos( ang );
            s       = Math.sin( ang );

            v[ 0 ]  = -v[ 0 ] * c - v[ 2 ] * s; // TODO Rotation
            v[ 2 ]  =  v[ 0 ] * s - v[ 2 ] * c;

            // TODO : Rotate Vert back to its correct axis
            v.toBuf( verts, i );
        }
    }

}

export default Twist;