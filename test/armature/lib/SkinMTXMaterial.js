import { THREE } from "../../lib/starter.js";


function SkinMTXMaterial( color='cyan', poseBuffer=null ){
    let mat = new THREE.RawShaderMaterial({
        //side     : THREE.DoubleSide,
        uniforms : {
            color   : { type :'vec3', value:new THREE.Color( color ) },
            pose    : { value: poseBuffer },
        },

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        vertexShader : `#version 300 es
        in vec3 position;   // Vertex Position
        in vec3 normal;     // Vertex Position
        in vec4 skinWeight; // Bone Weights
        in vec4 skinIndex;  // Bone Indices

        #define MAXBONES 90             // Arrays can not be dynamic, so must set a size
        uniform mat4 pose[ MAXBONES ];

        uniform mat4 modelMatrix;       // Matrices should be filled in by THREE.JS Automatically.
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;

        out vec3 frag_wpos;             // Fragment World Space Position
        out vec3 frag_norm;             // Fragment Normal

        ////////////////////////////////////////////////////////////////////////

        mat4 getBoneMatrix( mat4[ MAXBONES ] pose, vec4 idx, vec4 wgt ){
            /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            NORMALIZE BONE WEIGHT VECTOR - INCASE MODEL WASN'T PREPARED LIKE THAT
            If Weights are not normalized, Merging the Bone Offsets will create artifacts */
            int a = int( idx.x ),
                b = int( idx.y ),
                c = int( idx.z ),
                d = int( idx.w );
            
            wgt *= 1.0 / ( wgt.x + wgt.y + wgt.z + wgt.w );

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // MERGE THE BONE OFFSETS BASED ON WEIGHT
            mat4 bone_wgt =
                pose[ a ] * wgt.x +  
                pose[ b ] * wgt.y +
                pose[ c ] * wgt.z +
                pose[ d ] * wgt.w;

            return bone_wgt;
        }

        ////////////////////////////////////////////////////////////////////////

        void main() {
            mat4 boneMatrix = getBoneMatrix( pose, skinIndex, skinWeight );         // Get the Skinning Matrix
            mat4 mbMatrix   = modelMatrix * boneMatrix;                             // Merge Model and Bone Matrices togethr

            vec4 wpos       = mbMatrix * vec4( position, 1.0 );                     // Use new Matrix to Transform Vertices
            frag_wpos       = wpos.xyz;                                             // Save WorldSpace Position for Fragment Shader
            frag_norm       = mat3( transpose( inverse( mbMatrix ) ) ) * normal;    // Transform Normals using bone + model matrix

            gl_Position     = projectionMatrix * viewMatrix * wpos; 
        }`,
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        fragmentShader	: `#version 300 es
        precision mediump float;
        
        ////////////////////////////////////////////////////////////////////////
        
        out     vec4 out_color;
        in      vec3 frag_wpos;
        in      vec3 frag_norm;

        uniform vec3 color;

        ////////////////////////////////////////////////////////////////////////
        
        #define LITCNT 2
        const vec3[] light_pos = vec3[](
            vec3( 0.0, 2.5, 1.0 ),
            vec3( -1.0, 0.0, 1.0 )
        );

        float computePointLights( vec3[LITCNT] lights, vec3 norm ){
            vec3 light_vec;
            vec3 light_dir;

            float dist;
            float attenuation;
            float diffuse     = 0.0;
            float constant    = 0.5;
            float linear      = 0.5;
            float quadratic   = 0.5;
            
            for( int i=0; i < LITCNT; i++ ){
                light_vec       = lights[i].xyz - frag_wpos;
                light_dir       = normalize( light_vec );
                dist            = length( light_vec );
                attenuation     = 1.0 / ( constant + linear * dist + quadratic * (dist * dist) );
                diffuse        += max( dot( norm, light_dir ), 0.0 ) * attenuation;
            }

            return diffuse;
        }

        void main(){
            //vec3 norm   = normalize( cross( dFdx(frag_wpos), dFdy(frag_wpos) ) ); // Low Poly Normals
            vec3 norm     = normalize( frag_norm ); // Model's Normals            
            float diffuse = computePointLights( light_pos, norm );
            out_color     = vec4( color * diffuse, 1.0 );
        }`,
    });

    // If not using WebGL2.0 and Want to use dfdx or fwidth, Need to load extension
    mat.extensions = { derivatives : true };

    return mat;
}

export default SkinMTXMaterial;