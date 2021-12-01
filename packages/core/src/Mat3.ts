import type { TVec2, TMat3, TMat4 } from '@oito/types';

class Mat3 extends Float32Array{
    //#region STATIC VALUES
    static BYTESIZE = 9 * Float32Array.BYTES_PER_ELEMENT;
    //#endregion ////////////////////////////////////////////////////////

    //#region CONSTRUCTORS 
    constructor(){ 
        super(9); 
        this[0] = this[4] = this[8] = 1;
    }
    //#endregion ////////////////////////////////////////////////////////

    //#region GETTERS / SETTERS

    //copy another matrix's data to this one.
    copy( mat : TMat3, offset=0 ) : this{
        for( let i=0; i < 9; i++ ) this[ i ] = mat[ offset + i ];
        return this;
    }

    identity(): this {
        this[0]  = 1;
        this[1]  = 0;
        this[2]  = 0;
        this[3]  = 0;
        this[4]  = 1;
        this[5]  = 0;
        this[6]  = 0;
        this[7]  = 0;
        this[8]  = 1;
        return this;
    }

    determinant() : number {
        const a00 = this[0], a01 = this[1], a02 = this[2];
        const a10 = this[3], a11 = this[4], a12 = this[5];
        const a20 = this[6], a21 = this[7], a22 = this[8];
        return (
            a00 * ( a22 * a11 - a12 * a21) +
            a01 * (-a22 * a10 + a12 * a20) +
            a02 * ( a21 * a10 - a11 * a20)
        );
    }

    /** Frobenius norm of a Matrix */
    frob() : number{ return Math.hypot( this[0], this[1], this[2], this[3], this[4], this[5], this[6], this[7], this[8] ); }

    //#endregion ////////////////////////////////////////////////////////

    //#region FROM SETTERS
    
    fromTranslation( v: TVec2 ): this{
        this[0] = 1;
        this[1] = 0;
        this[2] = 0;
        this[3] = 0;
        this[4] = 1;
        this[5] = 0;
        this[6] = v[0];
        this[7] = v[1];
        this[8] = 1;
        return this;
    }
      
    fromRotation( rad: number ) : this{
        const   s = Math.sin( rad ),
                c = Math.cos( rad );
        this[0] = c;
        this[1] = s;
        this[2] = 0;
        this[3] = -s;
        this[4] = c;
        this[5] = 0;
        this[6] = 0;
        this[7] = 0;
        this[8] = 1;
        return this;
    }
      
    fromScaling( v: TVec2 ) : this{
        this[0] = v[ 0 ];
        this[1] = 0;
        this[2] = 0;
        this[3] = 0;
        this[4] = v[ 1 ];
        this[5] = 0;
        this[6] = 0;
        this[7] = 0;
        this[8] = 1;
        return this;
    }

    fromRotTranScale( rad: number, tran: TVec2, scl: TVec2 ) : this{
        const s  = Math.sin(rad),
              c  = Math.cos(rad),
              sx = scl[ 0 ], 
              sy = scl[ 1 ];

        this[0] = c * sx;
        this[1] = s * sx;
        this[2] = 0;
        this[3] = -s * sy;
        this[4] = c * sy;
        this[5] = 0;
        this[6] = tran[0];
        this[7] = tran[1];
        this[8] = 1;
        return this;
    }

    /** Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix */
    fromMat4Normal( a: TMat4 ) : this{
        const a00 = a[0],  a01 = a[1],  a02 = a[2],  a03 = a[3];
        const a10 = a[4],  a11 = a[5],  a12 = a[6],  a13 = a[7];
        const a20 = a[8],  a21 = a[9],  a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    
        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;
    
        // Calculate the determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) return this;
        
        det = 1.0 / det;
        this[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        this[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        this[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        this[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        this[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        this[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        this[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        this[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        this[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        return this;
    }

    /** Generates a 2D projection matrix with the given bounds */
    fromProjection( width: number, height: number) : this{
       this[0] = 2 / width;
       this[1] = 0;
       this[2] = 0;
       this[3] = 0;
       this[4] = -2 / height;
       this[5] = 0;
       this[6] = -1;
       this[7] = 1;
       this[8] = 1;
       return this;
    }
   
    //#endregion ////////////////////////////////////////////////////////

    //#region FROM OPS

    fromAdd( a: TMat3, b: TMat3) : this{
        this[0] = a[0] + b[0];
        this[1] = a[1] + b[1];
        this[2] = a[2] + b[2];
        this[3] = a[3] + b[3];
        this[4] = a[4] + b[4];
        this[5] = a[5] + b[5];
        this[6] = a[6] + b[6];
        this[7] = a[7] + b[7];
        this[8] = a[8] + b[8];
        return this;
    }
      
    fromSub( a: TMat3, b: TMat3) : this{
        this[0] = a[0] - b[0];
        this[1] = a[1] - b[1];
        this[2] = a[2] - b[2];
        this[3] = a[3] - b[3];
        this[4] = a[4] - b[4];
        this[5] = a[5] - b[5];
        this[6] = a[6] - b[6];
        this[7] = a[7] - b[7];
        this[8] = a[8] - b[8];
        return this;
    }
      
    fromScalar( a: TMat3, b: number) : this{
        this[0] = a[0] * b;
        this[1] = a[1] * b;
        this[2] = a[2] * b;
        this[3] = a[3] * b;
        this[4] = a[4] * b;
        this[5] = a[5] * b;
        this[6] = a[6] * b;
        this[7] = a[7] * b;
        this[8] = a[8] * b;
        return this;
    }

    fromMul( a: TMat3, b: TMat3 ) : this{
        const a00 = a[0], a01 = a[1], a02 = a[2];
        const a10 = a[3], a11 = a[4], a12 = a[5];
        const a20 = a[6], a21 = a[7], a22 = a[8];

        const b00 = b[0], b01 = b[1], b02 = b[2];
        const b10 = b[3], b11 = b[4], b12 = b[5];
        const b20 = b[6], b21 = b[7], b22 = b[8];

        this[0] = b00 * a00 + b01 * a10 + b02 * a20;
        this[1] = b00 * a01 + b01 * a11 + b02 * a21;
        this[2] = b00 * a02 + b01 * a12 + b02 * a22;

        this[3] = b10 * a00 + b11 * a10 + b12 * a20;
        this[4] = b10 * a01 + b11 * a11 + b12 * a21;
        this[5] = b10 * a02 + b11 * a12 + b12 * a22;

        this[6] = b20 * a00 + b21 * a10 + b22 * a20;
        this[7] = b20 * a01 + b21 * a11 + b22 * a21;
        this[8] = b20 * a02 + b21 * a12 + b22 * a22;
        return this;
    }

    fromInvert( a: TMat3 ) : this {
        const a00 = a[0], a01 = a[1], a02 = a[2];
        const a10 = a[3], a11 = a[4], a12 = a[5];
        const a20 = a[6], a21 = a[7], a22 = a[8];
      
        const b01 =  a22 * a11 - a12 * a21;
        const b11 = -a22 * a10 + a12 * a20;
        const b21 =  a21 * a10 - a11 * a20;
      
        // Calculate the determinant
        let det   = a00 * b01 + a01 * b11 + a02 * b21;
        if( !det ) return this;

        det = 1.0 / det;
      
        this[0] = b01 * det;
        this[1] = (-a22 * a01 + a02 * a21) * det;
        this[2] = (a12 * a01 - a02 * a11) * det;
        this[3] = b11 * det;
        this[4] = (a22 * a00 - a02 * a20) * det;
        this[5] = (-a12 * a00 + a02 * a10) * det;
        this[6] = b21 * det;
        this[7] = (-a21 * a00 + a01 * a20) * det;
        this[8] = (a11 * a00 - a01 * a10) * det;
        return this;
    }

    fromTranspose( a: TMat3 ) : this{
        this[0] = a[0];
        this[1] = a[3];
        this[2] = a[6];
        this[3] = a[1];
        this[4] = a[4];
        this[5] = a[7];
        this[6] = a[2];
        this[7] = a[5];
        this[8] = a[8];
        return this;
    }

    fromAdjoint( a: TMat3 ) : this{
        const a00 = a[0], a01 = a[1], a02 = a[2];
        const a10 = a[3], a11 = a[4], a12 = a[5];
        const a20 = a[6], a21 = a[7], a22 = a[8];
      
        this[0] = a11 * a22 - a12 * a21;
        this[1] = a02 * a21 - a01 * a22;
        this[2] = a01 * a12 - a02 * a11;
        this[3] = a12 * a20 - a10 * a22;
        this[4] = a00 * a22 - a02 * a20;
        this[5] = a02 * a10 - a00 * a12;
        this[6] = a10 * a21 - a11 * a20;
        this[7] = a01 * a20 - a00 * a21;
        this[8] = a00 * a11 - a01 * a10;
        return this;
    }

    //#endregion ////////////////////////////////////////////////////////

    //#region OPERATIONS

    mul( b: TMat3 ) : this{
        const a00 = this[0], a01 = this[1], a02 = this[2];
        const a10 = this[3], a11 = this[4], a12 = this[5];
        const a20 = this[6], a21 = this[7], a22 = this[8];

        const b00 = b[0], b01 = b[1], b02 = b[2];
        const b10 = b[3], b11 = b[4], b12 = b[5];
        const b20 = b[6], b21 = b[7], b22 = b[8];

        this[0] = b00 * a00 + b01 * a10 + b02 * a20;
        this[1] = b00 * a01 + b01 * a11 + b02 * a21;
        this[2] = b00 * a02 + b01 * a12 + b02 * a22;

        this[3] = b10 * a00 + b11 * a10 + b12 * a20;
        this[4] = b10 * a01 + b11 * a11 + b12 * a21;
        this[5] = b10 * a02 + b11 * a12 + b12 * a22;

        this[6] = b20 * a00 + b21 * a10 + b22 * a20;
        this[7] = b20 * a01 + b21 * a11 + b22 * a21;
        this[8] = b20 * a02 + b21 * a12 + b22 * a22;
        
        return this;
    }

    pmul( a: TMat3 ) : this{
        const a00 = a[0], a01 = a[1], a02 = a[2];
        const a10 = a[3], a11 = a[4], a12 = a[5];
        const a20 = a[6], a21 = a[7], a22 = a[8];

        const b00 = this[0], b01 = this[1], b02 = this[2];
        const b10 = this[3], b11 = this[4], b12 = this[5];
        const b20 = this[6], b21 = this[7], b22 = this[8];

        this[0] = b00 * a00 + b01 * a10 + b02 * a20;
        this[1] = b00 * a01 + b01 * a11 + b02 * a21;
        this[2] = b00 * a02 + b01 * a12 + b02 * a22;

        this[3] = b10 * a00 + b11 * a10 + b12 * a20;
        this[4] = b10 * a01 + b11 * a11 + b12 * a21;
        this[5] = b10 * a02 + b11 * a12 + b12 * a22;

        this[6] = b20 * a00 + b21 * a10 + b22 * a20;
        this[7] = b20 * a01 + b21 * a11 + b22 * a21;
        this[8] = b20 * a02 + b21 * a12 + b22 * a22;
        
        return this;
    }

    invert() : this{
        const a00 = this[0], a01 = this[1], a02 = this[2];
        const a10 = this[3], a11 = this[4], a12 = this[5];
        const a20 = this[6], a21 = this[7], a22 = this[8];
      
        const b01 =  a22 * a11 - a12 * a21;
        const b11 = -a22 * a10 + a12 * a20;
        const b21 =  a21 * a10 - a11 * a20;
      
        // Calculate the determinant
        let det   = a00 * b01 + a01 * b11 + a02 * b21;
        if( !det ) return this;

        det = 1.0 / det;
      
        this[0] = b01 * det;
        this[1] = (-a22 * a01 + a02 * a21) * det;
        this[2] = (a12 * a01 - a02 * a11) * det;
        this[3] = b11 * det;
        this[4] = (a22 * a00 - a02 * a20) * det;
        this[5] = (-a12 * a00 + a02 * a10) * det;
        this[6] = b21 * det;
        this[7] = (-a21 * a00 + a01 * a20) * det;
        this[8] = (a11 * a00 - a01 * a10) * det;
        return this;
    }

    transpose() : this{
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        const a01 = this[1],
              a02 = this[2],
              a12 = this[5];
        this[1] = this[3];
        this[2] = this[6];
        this[3] = a01;
        this[5] = this[7];
        this[6] = a02;
        this[7] = a12;
        return this;
    }

    translate( v: TVec2 ) : this{
        const   a00 = this[0], a01 = this[1], a02 = this[2],
                a10 = this[3], a11 = this[4], a12 = this[5],
                a20 = this[6], a21 = this[7], a22 = this[8],
                x   = v[0],    y   = v[1];
        //this[0] = a00;
        //this[1] = a01;
        //this[2] = a02;
        //this[3] = a10;
        //this[4] = a11;
        //this[5] = a12;
        this[6] = x * a00 + y * a10 + a20;
        this[7] = x * a01 + y * a11 + a21;
        this[8] = x * a02 + y * a12 + a22;
        return this;
    }
      
    rotate( rad: number) : this{
        const   a00 = this[0], a01 = this[1], a02 = this[2],
                a10 = this[3], a11 = this[4], a12 = this[5],
                //a20 = this[6], a21 = this[7], a22 = this[8],
                s   = Math.sin(rad),
                c   = Math.cos(rad);
      
        this[0] = c * a00 + s * a10;
        this[1] = c * a01 + s * a11;
        this[2] = c * a02 + s * a12;
        this[3] = c * a10 - s * a00;
        this[4] = c * a11 - s * a01;
        this[5] = c * a12 - s * a02;
        //this[6] = a20;
        //this[7] = a21;
        //this[8] = a22;
        return this;
    }
      
    scale( v: TVec2 ) : this{
        const x = v[0],
              y = v[1];
        
        this[0] = x * this[0];
        this[1] = x * this[1];
        this[2] = x * this[2];
        this[3] = y * this[3];
        this[4] = y * this[4];
        this[5] = y * this[5];
        //this[6] = this[6];
        //this[7] = this[7];
        //this[8] = this[8];
        return this;
    }

    transformVec2( v: TVec2, out ?: TVec2 ) : TVec2{
        const x = v[0], y = v[1];
        out    = out || v;
        out[0] = this[0] * x + this[3] * y + this[6];
        out[1] = this[1] * x + this[4] * y + this[7];
        return out;
    }

    //#endregion ////////////////////////////////////////////////////////

    //#region STATIC

    static fromScale( v: TVec2 )       : Mat3{ return new Mat3().fromScaling( v ); }
    static fromTranslation( v: TVec2 ) : Mat3{ return new Mat3().fromTranslation( v ); }
    static fromRotation( v: number )   : Mat3{ return new Mat3().fromRotation( v ); }

    //#endregion
}

/*

 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat3} out

export function fromQuat(out, q) {
    let x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;
  
    let xx = x * x2;
    let yx = y * x2;
    let yy = y * y2;
    let zx = z * x2;
    let zy = z * y2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;
  
    out[0] = 1 - yy - zz;
    out[3] = yx - wz;
    out[6] = zx + wy;
  
    out[1] = yx + wz;
    out[4] = 1 - xx - zz;
    out[7] = zy - wx;
  
    out[2] = zx - wy;
    out[5] = zy + wx;
    out[8] = 1 - xx - yy;
  
    return out;
  }
  */

export default Mat3;