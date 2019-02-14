
class object{
    constructor(name,parent,x,y){
        this.name = name;
        this.world = parent.parent;
        this.parent = parent;
        this._vertices = [];

        // Properties
        // torque / angular velocity
        this.position = new vector(x || 0, y || 0)
        this.velocity = new vector();
        this.acceleration = new vector();
        this.force = new vector();

        this.density = 1;
        this.friction = 0;
        this.resistance = .05; // air friction
        this.gravity = 60;

        this.locked = false;
    }

    get vertices(){
        let v = [];
        for(let i = 0; i < this._vertices.length; i++){
            v.push(vector.add(this.position, this._vertices[i]))
        }
        return v;
    }

    get area(){
        let sum0 = 0;
        let sum1 = 0;
    
        for(let i = 0; i < this._vertices.length-1; i++){
            sum0 += this._vertices[i].x + this._vertices[i+1].y
            sum1 += this._vertices[i].y + this._vertices[i+1].y
        }

        return sum0 + sum1;
    }

    get mass(){
        return this.area * this.density;
    }

    /*------------------------*/

    static check_collision(c1, c2){
        // c1, c2 - corners/vertices
        let mtv = new vector(Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER)
        let axis = [];
        let wall = new vector();

        for (let k = 0; k < c2.length; k++){
            let wall = vector.sub(c2[k] , c2[(k + 1) % c2.length])
            let normal = vector.mul(wall.normal.unit,-1); // neigimas
            axis.push(normal);
        }

        for (let k = 0; k < c1.length; k++){
            let wall = vector.sub(c1[k] , c1[(k + 1) % c1.length])
            let normal = vector.mul(wall.normal.unit,-1); // neigimas
            axis.push(normal);
        }

        // tikrinimas

        for(let i = 0; i < axis.length; i++){
            let min1 = Number.MAX_SAFE_INTEGER;
            let min2 = Number.MAX_SAFE_INTEGER;
            let max1 = Number.MIN_SAFE_INTEGER;
            let max2 = Number.MIN_SAFE_INTEGER;

            for(let j = 0; j < c1.length; j++){
                let scalar = vector.dot(c1[j], axis[i])
                if (scalar > max1) max1 = scalar;
                if (scalar < min1) min1 = scalar;
            }

            for(let j = 0; j < c2.length; j++){
                let scalar = vector.dot(c2[j], axis[i])
                if (scalar > max2) max2 = scalar;
                if (scalar < min2) min2 = scalar;
            }

            if (min2 >= max1 || max2 <= min1){
                return {collision: false, mtv: mtv, wall: wall}; // false
            }

            let overlap = max2 > max1 ? -(max1 - min2) : (max2 - min1);
            if (Math.abs(overlap) < mtv.magnitude){
                mtv = vector.mul(axis[i] , overlap);
                wall = axis[i];
            }

        }
        return {collision: true, mtv: mtv, normal: wall} // mtv
    }
}

class spape extends object{
    constructor(name,parent,x,y){
        super(name,parent, x, y)
        this.color = null 
        this.function = "this.world.draw_map(map_list[0])"; // collision function
    }
}
        /*
        this._vertices = [
            new vector(-32,-42),
            new vector( 32,-42),
            new vector( 32, 28),
            new vector( 13, 48),
            new vector(-13, 48),
            new vector(-32, 28),
            
        ];
        */
        

class player extends object{
    constructor(name,parent,x,y){
        super(name,parent,x,y)     
        
        this._vertices = [
            new vector(-30,-42),
            new vector( 30,-42),
            new vector( 30, 48),
            new vector(-30, 48),
        ];
        
        this.walk_force = 50; 
        this.jump_force = 30;
        this.walk_speed = 5; // max judejimo greitis
        this.direction = 1; // ziureti i kaira ar i desine
        this.ground = true; // ar liecia grindis
        this.alive = true; // ar gyvas

        this.keys = { // paspausti mygtukai
            w: 0,
            a: 0,
            s: 0,
            d: 0,
            ' ': 0,
            ArrowUp: 0,
            ArrowDown: 0,
            ArrowLeft: 0,
            ArrowRight: 0
        }
        this.mouse = new vector();  

        let sheet = PIXI.loader.resources["player1"].spritesheet;
        let anim = new PIXI.extras.AnimatedSprite(Object.values(sheet.textures));
        anim.animationSpeed = .3;

        anim.anchor.x = .5
        anim.anchor.y = .5
        anim.zOrder = 0;

        this.sprite = anim;

        parent.addChild(anim);

        anim.scale.x = this.direction
    }
}