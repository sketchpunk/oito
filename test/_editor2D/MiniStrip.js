

class MiniStrip extends HTMLElement{
    constructor(){
        super();

        this.attachShadow( {mode: 'open'} );
        this.shadowRoot.appendChild( MiniStrip.Template.content.cloneNode( true ) ); //document.importNode( PropPanel.Template.content, true )
    
    }

    connectedCallback(){}
}

MiniStrip.Template = document.createElement( "template" );
MiniStrip.Template.innerHTML = `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
<style>
:host{ background-color:silver; border-radius:20px; padding:2px; display:flex; flex-direction:column; width:25px; }

main{ flex:1 1 auto; display:none; flex-direction:column; margin-bottom:5px; }
footer{ flex:0 0 auto; }

footer > label, ::slotted( a ){
    width:25px; height:25px; border-radius:50%; background-color:gray;
    font-size:15px; text-decoration:none; color: black;
    display:grid; align-items:center; justify-items: center;
    cursor:pointer;
}

::slotted(a:hover){ color:lime; }
::slotted(a:not( :first-of-type )){ margin-top:5px; }

input[type='checkbox']{ display:none; } 
input[type='checkbox']:checked ~ main{ display:flex; }
</style>

<input type="checkbox" id="chkToggle">
<main><slot></slot></main>
<footer><label for="chkToggle"><i class="fas fa-bars"></i></label></footer>
`;

window.customElements.define( "mini-strip", MiniStrip );
export default MiniStrip;