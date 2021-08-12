import * as THREE               from "../../node_modules/three/build/three.module.js";
import { TransformControls }    from './TransformControls.js';

class Draggables{
    constructor( app=null ){
        this.app    = null;
        this.items  = [];
        this.onMove = null;
        this.onStop = null;
        if( app ) this.init( app );
    }

    init( app ){
        this.app = app;
        document.addEventListener( "pointerdown", this.onDown.bind( this ), false );

        this.gizmo = new TransformControls( app.camera, app.renderer.domElement );
        this.gizmo.addEventListener( "change", this.onGizmoChange.bind( this ) );
        this.gizmo.addEventListener( "dragging-changed", this.onGizmoDragChange.bind( this ) );
        app.add( this.gizmo );
        return this;
    }

    add(){ this.items.push( ...arguments ); return this }
    remove( o ){
        let i = this.items.indexOf( o );

        if( i < 0 ) console.log( "Draggables.remove : Mesh not found in items list. ", o );
        else        this.items.splice( i, 1 );

        return this;
    }

    deselect(){ this.gizmo.detach(); return this; }

    getSelected(){ return this.gizmo.object; }

    onGizmoDragChange( e ){
        this.app.orbit.enabled = !e.value;
        if( !e.value && this.onStop && this.gizmo.object ) this.onStop( this.gizmo.object );
    }

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