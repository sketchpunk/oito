

/*https://www.mathcurve.com/courbes2d.gb/watt/watt.shtml
Polar parametrization:
    d^2			= a^2 + b^2 - c^2
    length		= b * cos(t);
    sinTheta	= (d^2 - b^2 * cos(t)^2) / ( 2 * a * b * sin(t) )

    a : Distance between the center of 2 circles
    b : Radius of Circles
    c : Length of Rods

function watts_curve( a, b, c, t, out){
    var bb		= b * b,
        dd		= a * a + bb - c*c,
        cosT	= Math.cos(t),
        length	= b * cosT,
        theta 	= (dd - bb * cosT * cosT) / (2 * a * b * Math.sin(t));

    out = out || new Vec2();
    out.fromAngleLen(theta, length);
}

fromAngleLen(ang, len){
    this[0] = len * Math.cos(ang);
    this[1] = len * Math.sin(ang);
    return this;
}
*/

class Watts{


}

export default Watts;