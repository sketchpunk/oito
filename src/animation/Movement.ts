// http://iamralpht.github.io/equations/

class Motion{


    velocity( vel: number, friction: number, deltaTime: number ) : number{
        return vel * Math.pow( friction, deltaTime );
    }

    acceleration( vel: number, accel: number, deltaTime: number ): number{
        return vel + accel * deltaTime;
    }

    positionVel( pos: number, vel: number, friction: number, deltaTime: number ) : number{
        return  pos + 
                vel * Math.pow( friction, deltaTime ) / Math.log( friction ) -
                vel / Math.log( friction );
    }

    positionAccel( pos: number, vel: number, accel: number, deltaTime: number ) : number{
        return  pos + 
                vel * deltaTime + 
                0.5 * accel * deltaTime * deltaTime;
    }


}


/*
// This function takes the initial position, initial velocity, mass, spring constant and damping and
// returns a functions to give the position and velocity as a function of time.
//
// Only the mass, spring constant and damping change whether the spring is underdamped, critically
// damped or underdamped.

// F: force, k: spring constant, c: damping
// x: position, v: velocity.
// F = -kx - cv

// @param initial   the initial position
// @param velocity  the initial velocity
// @param c         the spring damping
// @param m         the mass of the object (I normally use "1").
// @param k         the spring constant

function solveSpring(initial, velocity, c, m, k) {
    // Solve the quadratic equation; root = (-c +/- sqrt(c^2 - 4mk)) / 2m.
    var cmk = c * c - 4 * m * k;
    if (cmk == 0) {
        // The spring is critically damped.
        // x = (c1 + c2*t) * e ^(-c/2m)*t
        var r = -c / (2 * m);
        var c1 = initial;
        var c2 = velocity / (r * initial);
        return {
            x: function(t) { return (c1 + c2 * t) * Math.pow(Math.E, r * t); },
            dx: function(t) { var pow = Math.pow(Math.E, r * t); return r * (c1 + c2 * t) * pow + c2 * pow; }
        };
    } else if (cmk > 0) {
        // The spring is overdamped; no bounces.
        // x = c1*e^(r1*t) + c2*e^(r2t)
        // Need to find r1 and r2, the roots, then solve c1 and c2.
        var r1 = (-c - Math.sqrt(cmk)) / (2 * m);
        var r2 = (-c + Math.sqrt(cmk)) / (2 * m);
        var c2 = (velocity - r1 * initial) / (r2 - r1);
        var c1 = initial - c2;

        return {
            x: function(t) { return (c1 * Math.pow(Math.E, r1 * t) + c2 * Math.pow(Math.E, r2 * t)); },
            dx: function(t) { return (c1 * r1 * Math.pow(Math.E, r1 * t) + c2 * r2 * Math.pow(Math.E, r2 * t)); }
            };
    } else {
        // The spring is underdamped, it has imaginary roots.
        // r = -(c / 2*m) +- w*i
        // w = sqrt(4mk - c^2) / 2m
        // x = (e^-(c/2m)t) * (c1 * cos(wt) + c2 * sin(wt))
        var w = Math.sqrt(4*m*k - c*c) / (2 * m);
        var r = -(c / 2*m);
        var c1= initial;
        var c2= (velocity - r * initial) / w;
            
        return {
            x: function(t) { return Math.pow(Math.E, r * t) * (c1 * Math.cos(w * t) + c2 * Math.sin(w * t)); },
            dx: function(t) {
                var power =  Math.pow(Math.E, r * t);
                var cos = Math.cos(w * t);
                var sin = Math.sin(w * t);
                return power * (c2 * w * cos - c1 * w * sin) + r * power * (c2 * sin + c1 * cos);
            }
        };
    }
}
*/

export default Motion;