import MiniStrip from "./MiniStrip.js";

class UI{
    constructor( view ){
        this.view = view;
        
        this.view.appendChild( TMP_MiniStrip.content.cloneNode( true ) );

        this.bind();
    }

    on( root, elm, evtName, doStop, fn ){
        elm = root.querySelector( elm );
    
        if( doStop ){
            elm.addEventListener( evtName, e=>{
                e.stopPropagation();
                e.preventDefault();
                fn( e );
            });
        }else elm.addEventListener( evtName, fn );
        return elm;
    }
    

    bind(){
        this.on( document, '#btnMMove',     'click', false, ()=>this.view.modes.activate( 'move' ) );
        this.on( document, '#btnMPoints',   'click', false, ()=>this.view.modes.activate( 'points' ) );
        this.on( document, '#btnMEdges',    'click', false, ()=>this.view.modes.activate( 'edges' ) );
        this.on( document, '#btnMCurve',    'click', false, ()=>this.view.modes.activate( 'curves' ) );
    }
}


const TMP_MiniStrip = document.createElement( "template" );
TMP_MiniStrip.innerHTML = `<mini-strip>
<a href="javascript:void(0)" id="btnMMove"      title='Move Mode'><i class="fas fa-arrows-alt"></i></a>
<a href="javascript:void(0)" id="btnMPoints"    title='Point Mode'><i class="fas fa-dot-circle"></i></a>
<a href="javascript:void(0)" id="btnMEdges"     title='Edge Mode'><i class="fas fa-vector-square"></i></a>
<a href="javascript:void(0)" id="btnMCurve"     title='Curve Mode'><i class="fas fa-bezier-curve"></i></a>
</mini-strip>`;

export default UI;