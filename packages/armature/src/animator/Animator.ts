import { ITrack } from ".";
import type Pose    from "../Pose";
import type Clip    from "./Clip";

// Special Modulus that can take in Negative Number 
// and Loop Around as the result
function mod( a: number, b: number ) : number{	
    const v = a % b;
    return ( v < 0 )? b + v : v;
}

/** Set of information to pass to Tracks for when animating a character. */
class FrameInfo{
    kt0 : number = 0;   // Keyframe Index for Start Tangent
    kt1 : number = 0;   // Keyframe Index for End Tangent
    k0  : number = -1;  // Keyframe Index Lerp Start
    k1  : number = -1;  // Keyframe Index Lerp End
    t   : number = 0;   // Lerp Time  
    ti  : number = 0;   // Lerp Time Inverse
}

/** Basic Animator for Armature */
class Animator{
    //#region MAIN
    frameInfo   : Array< FrameInfo > = [];  // Clips can have multiple TimeStamps, So need to compute Frame Data for each
    clock       : number             = 0;   // Running Animation Clock
    clip        !: Clip;                    // Animation to Run
    inPlace     = false;                    // Lock the forward movement of the animation when applied to pose
    //constructor(){}
    //#endregion

    //#region METHODS
    
    setClip( c: Clip ): this{ this.clip = c; return this; }

    update( deltaTime: number ): this{
        this.clock = ( this.clock + deltaTime ) % this.clip.duration;
        this._computeFrameInfo();
        return this;
    }

    applyPose( pose: Pose ): this{
        if( !this.clip ) return this;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let t : ITrack;
        for( t of this.clip.tracks ){
            t.apply( pose, this.frameInfo[ t.timeStampIndex ] );
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( this.inPlace ){
            // TODO: Y only because Maximo Animations have ZUp, Need to do a better version of inplace setting
            // Also come up with a better way then just "inPlace" property.
            const bPos = pose.bones[ 0 ].local.pos;
            bPos.y = 0; 
        }

        return this;
    }

    //endregion

    //#region INTERNAL
    _computeFrameInfo() : void{
        if( !this.clip ) return;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const aryFi = this.frameInfo;
        const aryTs = this.clip.timeStamps;
        const time  = this.clock;

        //console.log( aryFi, aryTs );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Make sure we have enough frame info objects to handle all the timestamps of the clip
        if( aryFi.length < aryTs.length ){
            for( let i=aryFi.length; i < aryTs.length; i++ ) aryFi.push( new FrameInfo );
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let ts   : Float32Array;    // TimeStamp;
        let fi   : FrameInfo;
        let tLen : number;          // TimeStamp Length;

        for( let i=0; i < aryTs.length; i++ ){
            //-------------------------------------
            // Get our Main bits of Data
            ts      = aryTs[ i ];
            fi      = aryFi[ i ];
            tLen    = ts.length;

            //-------------------------------------
            // Some Animations have a timestamp with just one frame
            // this is to set specific bones at the start of the animation but
            // doesn't change during the course of the animation.
            if( tLen == 0 ){
                //console.log( 'Single Keyframe' );
                fi.t    = 1;
                fi.ti   = 0;
                fi.k0   = 0;
                fi.k1   = 0;
                fi.kt0  = 0;
                fi.kt1  = 0;
                continue;
            }

            //-------------------------------------
            if( fi.k0 != -1 && time >= ts[ fi.k0 ] && time <= ts[ fi.k1 ] ){
                // If the clock still exists between the previous keyframes,
                // then just save time by just computing its T values.
                
                //console.log( 'Reuse Keyframes' );
                //continue;
            }else{
                // Find the Start/End Keyframes that the clock lives between
                //console.log( 'Find Keyframes' );
                //console.log( 'Clock', time );
                //console.log( "TimeStamp", ts );

                // Find the Index of timestamp that is the first one to be greater then time.
                let imin = 0, mi = 0, imax = ts.length - 1;
                while( imin < imax ){                     // Once Min Crosses or Equals Max, Stop Loop.
                    mi = (imin + imax) >>> 1              // Compute Mid Index
                    if( time < ts[ mi ] ) imax = mi;      // Time is LT Timestamp, use mid as new Max Range
                    else                  imin = mi + 1;  // Time is GTE TimeStamp, move min to one after mid.
                }

                // The starting / ending Keyframe Indices
                if( imax <= 0 ){    fi.k0 = 0;          fi.k1 = 1; }        // Can't go negative, so set to main frame
                else{               fi.k0 = imax - 1;   fi.k1 = imax; }

                // Tangent Keyframe Indices that loop around
                fi.kt0 = mod( fi.k0 - 1, tLen );
                fi.kt1 = mod( fi.k1 + 1, tLen );
            }

            //-------------------------------------
            // Lerp Time & its inverse.
            fi.t    = ( time - ts[ fi.k0 ] ) / ( ts[ fi.k1 ] - ts[ fi.k0 ] ); // Map Time between the Two Time Stamps
            fi.ti   = 1 - fi.t;
        }
    }
    //endregion
}

export default Animator;
export { FrameInfo };