import * as THREE               from "../../node_modules/three/build/three.module.js";
import { TransformControls }    from './TransformControls.js';

class Draggables{
    constructor( app ){
        this.app    = app;
        this.items  = [];
        this.onMove = null;

        document.addEventListener( "pointerdown", this.onDown.bind( this ), false );

        this.gizmo = new TransformControls( app.camera, app.renderer.domElement );
        this.gizmo.addEventListener( "change", this.onGizmoChange.bind( this ) );
        this.gizmo.addEventListener( "dragging-changed", this.onGizmoDragChange.bind( this ) );

        app.add( this.gizmo );
    }

    add(){ this.items.push( ...arguments ); return this }

    onGizmoDragChange( e ){ this.app.orbit.enabled = !e.value; }
    onGizmoChange(){
        if( this.gizmo.object ){
            if( this.gizmo.dragging && this.onMove ) this.onMove( this.gizmo.object );
        }
    }

    getRay( e ){
        let x   = e.clientX / window.innerWidth * 2 - 1;
        let y   = -( e.clientY / window.innerHeight ) * 2 + 1;
        let dir = new THREE.Vector3( x, y, 0.5 )
            .unproject( this.app.camera )
            .sub( this.app.camera.position )
            .normalize();

        return new THREE.Raycaster( this.app.camera.position, dir );
    }

    onDown( e ){
        let ray = this.getRay( e );
        let hit = ray.intersectObjects( this.items );

        if( hit.length > 0 ){
            this.gizmo.attach( hit[ 0 ].object );
        }else if( this.gizmo.object && !this.gizmo.dragging ){
            this.gizmo.detach();
        }
    }
}

export default Draggables;