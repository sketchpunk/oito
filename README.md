# Oito
Math Library written in TypeScript focused on WebGL / Graphics Programming.

### Get Started
```Shell
npm install
npm start
```

### Example
```Javascript
function onRender( dt, et ){
    const SEC = 4;
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Smoothly transition between 0 to 1 to 0 every SEC
    let t = Maths.smoothTStep( 
        Maths.bounce(
            Maths.gradient010( 
                Maths.fract( et * 1.2 / SEC ) 
            )
        )
    );

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Move Cube
    let angle = Maths.noise( et * 0.2 ) * Maths.PI_2;	// Smooth Randomish Angles
    let v     = new Vec3();
    v	.fromLerp( [1,0,0], [-1,0,0], t )   // Directions to PingPong From
        .scale( 3 )                         // Increase Range of Movement
        .axisAngle( Vec3.UP, angle )        // Rotate Direction
        .toStruct( Cube.position );         // Apply it to THREE.js's Position Struct

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Rotate Cube
    let nx = Maths.noise( et ) * 360;          // Smooth-ish Angles  
    let nz = Maths.noise( (7.3 + et) ) * 360;
    let ry = Maths.toRad( 360 * t );           // Y Rotates from T
    
    let q  = new Quat();
    q   .fromEuler( nx, 0, nz )          // Start Rotating XZ with Noise
        .pmulAxisAngle( [0,1,0], ry )    // Apply Y Rotation
        .scaleAngle( 1.2 )               // Speed up the angle of rotation
        .norm()                          // Normalize !!!
        .toStruct( Cube.quaternion );    // Apply to THREE.JS Quat Struct
}
```