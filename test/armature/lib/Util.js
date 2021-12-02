import { Armature, SkinMTX, SkinDQ }    from '../../../dist/armature.js';
import { Clip }                         from '../../../dist/animator.js';
import BoneViewMesh                     from './BoneViewMesh.js';

class Util{

    static clipFromGltf( gltf ){ return Clip.fromGLTF2( gltf.getAnimation() ); }

    static armFromGltf( gltf ){
        const skin = gltf.getSkin();
        const arm  = new Armature();
        
        // Create Armature
        for( let j of skin.joints ){
            arm.addBone( j.name, j.parentIndex, j.rotation, j.position, j.scale );
        }

        // Bind
        arm.bind( SkinMTX, 0.07 );

        // Save Offsets if available
        if( skin.rotation ) arm.offset.rot.copy( skin.rotation );
        if( skin.position ) arm.offset.pos.copy( skin.position );
        if( skin.scale )    arm.offset.scl.copy( skin.scale );

        return arm;
    }

    static newBoneView( arm, pose, meshScl, dirScl ){
        const boneView = new BoneViewMesh( arm );

        // Because of the transform on the Armature itself, need to scale up the bones
        // to offset the massive scale down of the model
        if( meshScl ) boneView.material.uniforms.meshScl.value = meshScl;
        if( dirScl )  boneView.material.uniforms.dirScl.value  = dirScl;

        // Set Initial Data So it Renders
        boneView.updateFromPose( pose || arm.newPose().updateWorld( true ) );

        return boneView;
    }
}

export default Util;