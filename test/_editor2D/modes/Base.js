class Base{
    //#region FIELDS
    modeName     = 'Base';
    modeEvents   = null;
    view         = null;
    //#endregion

    //#region ABSTRACT METHODS
    activate( view ){   console.log( 'Mode.activate not implemented.', this.modeName ) }
    deactivate( view ){ console.log( 'Mode.deactivate not implemented.', this.modeName ) }
    //#endregion

    //#region METHODS
    mountEvents(){
        if( !this.modeEvents ) return;
        for( let ename in this.modeEvents ) this.view.on( ename, this.modeEvents[ ename ] );
    }

    unmountEvents(){
        if( !this.modeEvents ) return;
        for( let ename in this.modeEvents ) this.view.off( ename, this.modeEvents[ ename ] );
    }
    //#endregion
}

export default Base;