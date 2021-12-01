// #region GLOBAL VARS
const NORMALIZE_RGB	= 1 / 255.0;
const COLORS : { [key:string]: number } = {
	"black"		: 0x000000,
	"white"		: 0xffffff,
	"red"		: 0xff0000,
	"green"		: 0x00ff00,
	"blue"		: 0x0000ff,
	"fuchsia"	: 0xff00ff,
	"cyan"		: 0x00ffff,
	"yellow"	: 0xffff00,
	"orange"	: 0xff8000,
	"gray"		: 0x808080,
	"darkgray"	: 0x303030,
};
// #endregion ////////////////////////////////////////////////////////

class Colour extends Float32Array{
    // #region MAIN
    constructor()
    constructor( c: string )
    constructor( c: number )
    constructor( c ?: string | number | Colour ){
        super( 4 );

        if( c !== undefined ){
            if( typeof c == "number" && !isNaN( c ) ){
                 this.fromNumber( c );
            }else if( typeof c == "string" ){
                if( c.charAt( 0 ) == "#" ) this.fromHex( c );
                else                       this.fromName( c );
            }
        }
    }
    // #endregion ////////////////////////////////////////////////////////

    // #region GETTERS / SETTERS
    get r() : number{ return this[ 0 ]; }   set r( v: number ){ this[ 0 ] = v; }
    get g() : number{ return this[ 1 ]; }   set g( v: number ){ this[ 1 ] = v; }
    get b() : number{ return this[ 2 ]; }   set b( v: number ){ this[ 2 ] = v; }
    get a() : number{ return this[ 3 ]; }   set a( v: number ){ this[ 3 ] = v; }

    //get rgbSlice(){ return new Float32Array( this.buffer, 0, 3*4 ); } // See if can create new F32 from buf but maybe just the 3 floats instead of 4.

    fromName( s: string ) : this{
        if( COLORS[ s ] !== undefined ) this.fromNumber( COLORS[ s ] );
        else                            this.fromNumber( 0xff0000 );
        return this
    }

    fromNumber( c: number) : this{
        this[ 0 ] = ( c >> 16 & 255 )	* NORMALIZE_RGB;
        this[ 1 ] = ( c >> 8 & 255 )	* NORMALIZE_RGB;
        this[ 2 ] = ( c & 255 )		    * NORMALIZE_RGB;
        return this;
    }

    fromHex( c: string ) : this{
        if( !c || c.charAt(0) != "#" ){ console.error( "Missing Pound Symbol: ", c ); return this; }

        this[ 0 ] = parseInt( c[1] + c[2], 16 ) * NORMALIZE_RGB;
        this[ 1 ] = parseInt( c[3] + c[4], 16 ) * NORMALIZE_RGB;
        this[ 2 ] = parseInt( c[5] + c[6], 16 ) * NORMALIZE_RGB;
        if( c.length == 9 ) this[ 3 ] = parseInt( c[7] + c[8], 16 ) * NORMALIZE_RGB;

        return this;
    }

    fromLerp( a: Colour, b: Colour, t: number ): this{
        const ti = 1 - t;
        this[ 0 ] = a[ 0 ] * ti + b[ 0 ] * t;
        this[ 1 ] = a[ 1 ] * ti + b[ 1 ] * t;
        this[ 2 ] = a[ 2 ] * ti + b[ 2 ] * t;
        this[ 3 ] = a[ 3 ] * ti + b[ 3 ] * t;
        return this;
    }

    toRGBNumber(): number{
        return  ( this[ 0 ] * 255 ) << 16 |
                ( this[ 1 ] * 255 ) << 8  |
                ( this[ 2 ] * 255 );
    }
    // #endregion ////////////////////////////////////////////////////////
}


/**
 * Convert HSV spectrum to RGB.
 * @param h Hue
 * @param s Saturation
 * @param v Value
 * @returns {number[]} Array with rgb values.
 
 export function hsvToRgb(h, s, v) {
    h = (h / 360) * 6;
    s /= 100;
    v /= 100;

    const i = floor(h);

    const f = h - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    const mod = i % 6;
    const r = [v, q, p, p, t, v][mod];
    const g = [t, v, v, q, p, p][mod];
    const b = [p, p, t, v, v, q][mod];

    return [
        r * 255,
        g * 255,
        b * 255
    ];
}
*/
/**
 * Convert HSV spectrum to Hex.
 * @param h Hue
 * @param s Saturation
 * @param v Value
 * @returns {string[]} Hex values
 
 export function hsvToHex(h, s, v) {
    return hsvToRgb(h, s, v).map(v =>
        round(v).toString(16).padStart(2, '0')
    );
}
*/
/**
 * Convert HSV spectrum to CMYK.
 * @param h Hue
 * @param s Saturation
 * @param v Value
 * @returns {number[]} CMYK values
 
 export function hsvToCmyk(h, s, v) {
    const rgb = hsvToRgb(h, s, v);
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;

    const k = min(1 - r, 1 - g, 1 - b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

    return [
        c * 100,
        m * 100,
        y * 100,
        k * 100
    ];
}
*/
/**
 * Convert HSV spectrum to HSL.
 * @param h Hue
 * @param s Saturation
 * @param v Value
 * @returns {number[]} HSL values

 export function hsvToHsl(h, s, v) {
    s /= 100;
    v /= 100;

    const l = (2 - s) * v / 2;

    if (l !== 0) {
        if (l === 1) {
            s = 0;
        } else if (l < 0.5) {
            s = s * v / (l * 2);
        } else {
            s = s * v / (2 - l * 2);
        }
    }

    return [
        h,
        s * 100,
        l * 100
    ];
}
 */
/**
 * Convert RGB to HSV.
 * @param r Red
 * @param g Green
 * @param b Blue
 * @return {number[]} HSV values.

 function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const minVal = min(r, g, b);
    const maxVal = max(r, g, b);
    const delta = maxVal - minVal;

    let h, s;
    const v = maxVal;
    if (delta === 0) {
        h = s = 0;
    } else {
        s = delta / maxVal;
        const dr = (((maxVal - r) / 6) + (delta / 2)) / delta;
        const dg = (((maxVal - g) / 6) + (delta / 2)) / delta;
        const db = (((maxVal - b) / 6) + (delta / 2)) / delta;

        if (r === maxVal) {
            h = db - dg;
        } else if (g === maxVal) {
            h = (1 / 3) + dr - db;
        } else if (b === maxVal) {
            h = (2 / 3) + dg - dr;
        }

        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }

    return [
        h * 360,
        s * 100,
        v * 100
    ];
}
 */

/**
 * Convert CMYK to HSV.
 * @param c Cyan
 * @param m Magenta
 * @param y Yellow
 * @param k Key (Black)
 * @return {number[]} HSV values.

 function cmykToHsv(c, m, y, k) {
    c /= 100;
    m /= 100;
    y /= 100;
    k /= 100;

    const r = (1 - min(1, c * (1 - k) + k)) * 255;
    const g = (1 - min(1, m * (1 - k) + k)) * 255;
    const b = (1 - min(1, y * (1 - k) + k)) * 255;

    return [...rgbToHsv(r, g, b)];
}
 */
/**
 * Convert HSL to HSV.
 * @param h Hue
 * @param s Saturation
 * @param l Lightness
 * @return {number[]} HSV values.

function hslToHsv(h, s, l) {
    s /= 100;
    l /= 100;
    s *= l < 0.5 ? l : 1 - l;

    const ns = (2 * s / (l + s)) * 100;
    const v = (l + s) * 100;
    return [h, isNaN(ns) ? 0 : ns, v];
}
 */
/**
 * Convert HEX to HSV.
 * @param hex Hexadecimal string of rgb colors, can have length 3 or 6.
 * @return {number[]} HSV values.
 
function hexToHsv(hex) {
    return rgbToHsv(...hex.match(/.{2}/g).map(v => parseInt(v, 16)));
}
*/

export default Colour;