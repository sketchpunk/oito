import * as THREE from "../node_modules/three/build/three.module.js";

function UnlitMaterial( baseColor="cyan", useLowPoly=false ){
    let mat = new THREE.ShaderMaterial({
		uniforms		:  {
            color   : { type :'vec3', value:new THREE.Color( baseColor ) },
            color_x : { type :'vec3', value:new THREE.Color( "#878FA3" ) }, // Each axis gets a Grayscaled Value, used as strength of baseColor
            color_y : { type :'vec3', value:new THREE.Color( "#ffffff" ) }, // these don't really need to be modified unless looking to change 
            color_z : { type :'vec3', value:new THREE.Color( "#CED4E0" ) }, // the overall strength of each axis
        },
        
        vertexShader	: `
        varying vec3 frag_norm; // Fragment Normal
        varying vec3 frag_wpos; // Fragment World Space Position
		    void main() {
            vec4 wpos   = modelMatrix * vec4( position, 1.0 );

            frag_wpos   = wpos.xyz;
            frag_norm   = normalMatrix * normal;

            gl_Position = projectionMatrix * viewMatrix * wpos; 
        }`,
        
		fragmentShader	: `
        ${(useLowPoly)?"#define LOWPOLY":""}
        
        uniform vec3 color;
        uniform vec3 color_x;
        uniform vec3 color_y;
        uniform vec3 color_z;

        varying vec3 frag_wpos;
        varying vec3 frag_norm;
        void main() {
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            #ifndef LOWPOLY
              vec3 norm = normalize( frag_norm ); // Normals From Mesh
            #else
              // Create normals using derivitive functions. Makes things look low poly
              vec3 norm = normalize( cross( dFdx(frag_wpos), dFdy(frag_wpos) ) );
            #endif

            // Treating normal as Light Strength, it curves the progression from dark to light
            // if left as is, it gives the tint lighting much more strength and also linear progression
            norm = norm * norm; 
        
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // From what I understand of how this works is by applying a Lighting Color for Each axis direction.
            // Then using the normal direction to blend each axis color together. From kenny's image example, he
            // setup the brightest color to come from Y, Second from Z then the darkest color at X.
            vec3 out_color;
            out_color = mix( color, color * color_x, norm.x );
            out_color = mix( out_color, color * color_y, norm.y );
            out_color = mix( out_color, color * color_z, norm.z );

		    gl_FragColor = vec4( out_color, 1.0 );
		}`,
    });

    // If not using WebGL2.0 and Want to use dfdx or fwidth, Need to load extension
    if( useLowPoly ) mat.extensions = { derivatives : true };

    return mat;
}

export default UnlitMaterial;