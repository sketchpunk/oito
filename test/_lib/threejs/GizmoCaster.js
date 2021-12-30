import * as THREE from './three.module.js';
import { TransformControls }    from './TransformControls.js';

//import * as THREE               from 'three';
//import { TransformControls }    from 'three/examples/jsm/controls/TransformControls';


class GizmoCaster{
    static reduceMinPointHit( min, hit ){ return ( hit.distanceToRay < min.distanceToRay )? hit : min; }

    //#region MAIN
    constructor( canvas, camera, camCtrl ){
        this.ndcMouse   = new THREE.Vector2();
        this.ray        = new THREE.Raycaster();
        this.gizmo      = new TransformControls( camera, canvas );

        this.canvas     = canvas;
        this.camera     = camera;
        this.camCtrl    = camCtrl;

        this.onRayCast      = null;
        this.onGizmoStart   = null;
        this.onGizmoMove    = null;
        this.onGizmoEnd     = null;
    }

    initEvents(){
        this.canvas.addEventListener( 'pointerdown',        this.onPointerDown.bind( this ) );
        this.gizmo.addEventListener( 'change',              this.onGizmoChange.bind( this ) );
        this.gizmo.addEventListener( 'dragging-changed',    this.onGizmoDragChange.bind( this ) );

        return this;
    }
    //#endregion

    //#region RAY
    _prepareRay( e ){
        const x         = e.layerX;
        const y         = e.layerY;
        this.ndcMouse.x =  ( x / this.canvas.clientWidth  ) * 2 - 1;
        this.ndcMouse.y = -( y / this.canvas.clientHeight ) * 2 + 1;

        this.ray.setFromCamera( this.ndcMouse, this.camera );
        /*
        let dir = new THREE.Vector3( x, y, 0.5 )
            .unproject( camera )
            .sub( camera.position )
            .normalize();

        return new THREE.Raycaster( this.app.camera.position, dir );
        */
        //this.caster
    }

    onPointerDown( e ){
        if( e.button == 2 && this.isGizmoVisible() ) this.detachGizmo();

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // If Gizmo is being used, stop event bubble.
        if( this.isGizmoInUse() ){
            e.stopPropagation();
            return;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( this.onRayCast ){
            this._prepareRay( e );
            this.onRayCast( this ); // hits = this.ray.intersectObjects( [...manyObjects] || oneObject );
        }        
    }
    //#endregion

    //#region GIZMO METHODS
    useLocal(){ this.gizmo.space = 'local'; return this; }
    useWorld(){ this.gizmo.space = 'world'; return this; }

    attachGizmo( obj, userData=null ){
        this.gizmo.attach( obj );
        this.gizmo.userData = userData;
        return this;
    }

    detachGizmo(){
        this.gizmo.detach();
        this.camCtrl.enabled        = true;
        this.camCtrl.enableRotate   = true;
        return this;
    }

    isGizmoInUse(){ return this.gizmo.dragging; }
    isGizmoVisible(){ return ( this.gizmo.object || this.gizmo.visible ); }
    //#endregion

    //#region GIZMO EVENTS
    onGizmoChange( e ){
        if( this.isGizmoInUse() ){
            switch( this.gizmo.mode ){
                case 'translate':
                    if( this.onGizmoMove ) this.onGizmoMove( this.gizmo.object.position.toArray(), this.gizmo.userData );
                    break;
            }
        }
    }

    onGizmoDragChange( e ){
        const isDragging            = e.value;
        this.camCtrl.enabled        = !isDragging;
        this.camCtrl.enableRotate   = !isDragging;

        if( isDragging && this.onGizmoStart )       this.onGizmoStart();
        else if( !isDragging && this.onGizmoEnd )   this.onGizmoEnd();
    }
    //#endregion
}

export default GizmoCaster;