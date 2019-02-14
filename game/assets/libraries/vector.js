let rad = function(deg){return deg * Math.PI / 180;}

class vector{
    constructor(x,y){
        this.x = x || 0;
        this.y = y || 0;
    }

    //----------------------------------------------------//
    static add(v1,v2) {
        return new vector(v1.x + v2.x, v1.y + v2.y);
    }

    static sub(v1,v2) {
        return new vector(v1.x - v2.x, v1.y - v2.y);
    }

    static mul(v1,s) {
        return new vector(v1.x * s, v1.y * s);
    }

    static div(v1,s) {
        return new vector(v1.x / s, v1.y / s);
    }

    static mod(v1,s) {
        return new vector(v1.x % s, v1.y % s);
    }
    //----------------------------------------------------//

    static dot(v1,v2) {
        return v1.x * v2.x + v1.y * v2.y; 
    }
    static mid(v1,v2) {
        return new vector((v1.x + v2.x)/2, (v1.y + v2.y)/2);
    }

    //----------------------------------------------------//
    get point(){
        return "( " + this.x + " : " + this.y + " )";
    }

    get magnitude(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    get unit() {
        return vector.div(this, this.magnitude);
    }

    get normal(){
        return new vector(this.y, -this.x).unit;
    }

    rotate(s){
        let x = Math.cos(rad(r)) * this.x - Math.sin(rad(r)) * this.y;
        let y = Math.sin(rad(r)) * this.x + Math.sos(rad(r)) * this.y;
        return new vector(x, y);
    }
    //----------------------------------------------------//
}


/*

let vec1 = new vector(5,5);
let vec2 = new vector(5,5);
let vec3 = vector.add(vec1,vec2);

console.log(vec3.point);
console.log(vec3.magnitude);
console.log(vec3.unit.point);

*/