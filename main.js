// ---------------------------------------------------------------------- //
let path = script_path();
let game_load_time = Date.now();


PIXI.loader.add("player1", "game/assets/json/p1_walk.json")
PIXI.loader.add("tiles", "game/assets/json/tile_sheet.json")

PIXI.loader.load(main);

console.log("Load time: " +  (Date.now() - game_load_time ) / 1000);

function test_call(x){
    console.log("Hello",x);
}

let g = eval("test_call('world')");


function main(){
    let tile_sheet = PIXI.loader.resources["tiles"].spritesheet;
    let jump_debounce = 0;

    let admin = {
        tool: "Object",//"None",
        selected_sprite: "00_00",
        render_mouse_tile: false,
        zIndex: 1,
    }
    // ---------------------------------------------------------------------- //

    // Pasaulio ir zaidejo sukurimas


    world = new game("#display");
    world.resize(); $(window).on('resize', function(){world.resize()})

    let plr = new player("Player1", world.objects, 0,0);
    world.draw_map(map_list[0], plr);
    
    // gauti taskus
    $.ajax({
        method: "POST",
        url: "get_points.php",
        contentType: "application/json",
        success: function(e){
            world.points = parseInt(e);
            $("#points").text("Taškai: " + world.points);
            console.log("pavyko", e);
        },
    
        error: function(e){
            console.log("nepavyko gauti tasku",e);
        }
    })
    
    //plr.position = vector.mul(tiles.spawn, game.tile_size)

    let renderer = new render(world.graphics);
    
    let parallax_images = [];
    for(let i = 9; i >= 0; i--){
        let p = PIXI.Sprite.fromImage('game/assets/images/parallax/'+ i +'.png')
        p.anchor.x = .5;
        p.anchor.y = .5;

        //p.width = 1000

        parallax_images.push(p);
        world.parallax.addChild(p);
    }

    // ---------------------------------------------------------------------- //
    // Pagrindinis ciklas
    //let reflect = (a - (2 * vector.dot(a,surface) * surface));
    
    world.app.ticker.add(function(delta) {
        $("#fps").text("FPS: " + Math.floor(world.app.ticker.FPS));

        renderer.clear();
        //renderer.draw([new vector(0,0),new vector(game.tile_size,game.tile_size)])
        if(world.pause){return}

        if(plr.position.y > 3000) plr.position = vector.mul(world.map.spawn, game.tile_size); // jei nukrenta i apacia

        if(jump_debounce > 0) jump_debounce++; // sokinejimo laiko limitas
        if(jump_debounce == 50) jump_debounce = 0;

        let movement_force = (plr.keys['d'] || plr.keys['ArrowRight']) - (plr.keys['a'] || plr.keys['ArrowLeft']);
        plr.force.x = (movement_force)*plr.walk_force;
        plr.force.y = plr.gravity;

        plr.acceleration = vector.div(plr.force, plr.mass); // a = F/m
        plr.velocity = vector.add(plr.velocity, plr.acceleration ); // Vf = Vi + a*t

        //plr.velocity.y = (plr.keys['s'] - plr.keys['w'])*plr.walk_speed
        let mouse_direction = vector.sub(plr.mouse, plr.position).unit;
        //plr.force = vector.mul(mouse_direction, 10);

        //console.log(plr.velocity.magnitude);
        //-------------------------------------------------------
        // Animation
        if(plr.force.x > 0){
            plr.sprite.play();
            plr.sprite.scale.x =  1;
        }
        if(plr.force.x < 0){
            plr.sprite.play();
            plr.sprite.scale.x = -1;
        }
        if(plr.force.x == 0){
            plr.sprite.gotoAndStop(0);
            
        }

        //console.log(parallax_images)
        for(let i = 0; i < 10; i++){
            parallax_images[i].x = -plr.position.x/(30-i) + world.app.screen.width/2
            parallax_images[i].y = -plr.position.y/(30-i) + world.app.screen.height/2
        }

        //-------------------------------------------------------
        check_forces = function(velocity){
            plr.position = vector.add(plr.position, velocity); 
            
            let plr_tile = game.global_to_tile(plr.position, game.tile_size);
            let check = [];

            for(let i = 0; i < world.map.data.length; i++){
                for(let y = -1; y < 2; y++){
                    for(let x = -1; x < 2; x++){
                        if(plr_tile.y + x == world.map.data[i].x && 
                            plr_tile.x + y == world.map.data[i].y &&
                            world.map.data[i].z == 1){
                            check.push(world.map.data[i]);
                        }
                    //check.push({x: plr_tile.y + y, y: plr_tile.x + x});
                    }   
                }
            }

            check.forEach(function(tile){
                let tile_vertices = [];
                if(tile.n=="01_12"||tile.n=="02_00"||tile.n=="02_01"
                 ||tile.n=="02_02"||tile.n=="03_06"||tile.n=="03_07"
                 ||tile.n=="03_08"||tile.n=="03_09"||tile.n=="05_03"
                 ||tile.n=="05_04"||tile.n=="05_05"||tile.n=="05_06"
                 ||tile.n=="08_03"||tile.n=="08_04"||tile.n=="08_05"
                 ||tile.n=="08_06"||tile.n=="10_03"||tile.n=="10_04"
                 ||tile.n=="10_05"||tile.n=="10_06"){
                    tile_vertices = [
                        new vector(tile.x*game.tile_size, tile.y*game.tile_size),
                        new vector(tile.x*game.tile_size+game.tile_size, tile.y*game.tile_size),
                        new vector(tile.x*game.tile_size+game.tile_size, tile.y*game.tile_size+game.tile_size/1.75),
                        new vector(tile.x*game.tile_size, tile.y*game.tile_size+game.tile_size/1.75),
                    ];
                }else if(tile.n == "05_00"){
                    tile_vertices = [
                        new vector(tile.x*game.tile_size, tile.y*game.tile_size),
                        new vector(tile.x*game.tile_size+game.tile_size, tile.y*game.tile_size+game.tile_size),
                        new vector(tile.x*game.tile_size, tile.y*game.tile_size+game.tile_size),
                    ];
                }else{
                    tile_vertices = [
                        new vector(tile.x*game.tile_size, tile.y*game.tile_size),
                        new vector(tile.x*game.tile_size+game.tile_size, tile.y*game.tile_size),
                        new vector(tile.x*game.tile_size+game.tile_size, tile.y*game.tile_size+game.tile_size),
                        new vector(tile.x*game.tile_size, tile.y*game.tile_size+game.tile_size),
                    ];
                }

                

                let result = object.check_collision(plr.vertices, tile_vertices);
                if(result.collision){
                    if(tile.n=="09_04"){
                        if(plr.keys[' '] == 1){ // doors
                            plr.keys[' '] = 0;
                            console.log(tile.function)
                            eval(tile.function);
                        }
                        return plr.velocity
                    }
                    if(tile.n=="00_05"){ // game
                        if(plr.keys[' '] == 1 && world.pause == false){
                            let game_start_time = Date.now();
                            world.pause = true;
                            eval(tile.function);
                            console.log(tile.function + ": " +  (Date.now() - game_start_time ) / 1000)
                        }
                        return plr.velocity
                    }


                    //renderer.draw(tile_vertices);
                    //console.log(mtv, plr.velocity)
                    //reflectedNormal = (normal - (2 * normal:Dot(surfaceNormal) * surfaceNormal)
                    let reflect  = vector.sub(velocity.unit, vector.mul(result.normal , (2*vector.dot(velocity.unit, result.normal)) ))
                    velocity = vector.mul(reflect, velocity.magnitude*1)
                    
                    plr.position = vector.add(plr.position, result.mtv); 
                    
                    if(result.mtv.x != 0){velocity.x = 0;}
                    if(result.mtv.y != 0){velocity.y = 0;}

                    if((plr.keys['w'] == 1 || plr.keys['ArrowUp'] == 1)&& result.mtv.y < 0 && jump_debounce == 0){
                        velocity.y = -30;
                        jump_debounce = 1;
                        console.log("jump");
                    }else{
                        velocity.y = 0;
                    }
                } // if
            }) // foreach

            return vector.mul(velocity, 1-plr.resistance)
        }
        let v1 = check_forces(new vector(plr.velocity.x, 0));
        let v2 = check_forces(new vector(0, plr.velocity.y));

        plr.velocity = vector.add(v1, v2);
        if(plr.velocity.x >= plr.walk_speed){
            plr.velocity.x = plr.walk_speed;
        }
        if(plr.velocity.x <= -plr.walk_speed){
            plr.velocity.x = -plr.walk_speed;
        }

        //console.log(plr.velocity.magnitude)

        plr.sprite.position = plr.position
        //renderer.draw(plr.vertices);

        world.container.x = world.app.screen.width/2 - plr.position.x*world.container.scale.x 
        world.container.y = world.app.screen.height/2 - plr.position.y*world.container.scale.y
    });


    // ---------------------------------------------------------------------- //
    // Mygtuku paspaudimas

    $("body").keydown(function(event){
        //console.log(event.key)
        plr.keys[event.key] = 1;

        if(event.key == 'c'){
            if($("#admin").is(":visible")){
                $("#admin").hide();
            }else{
                $("#admin").show();
            }
        }
    })

    $("body").keyup(function(event){
        plr.keys[event.key] = 0;
    })

    $("body").on("wheel",function(event){
        let s = event.originalEvent.deltaY/400;
        if(world.container.scale.x - s >= .25 && world.container.scale.x - s <= 2){
            world.container.scale.x -= s;
            world.container.scale.y -= s;
        }
        console.log("Scale:",world.container.scale.x)
    })

    $("#display canvas").on("mousemove",function(event){
        plr.mouse = new vector(event.offsetX - world.container.x, event.offsetY - world.container.y)
    })

    //---------------------------------------------------------------------------------------------------
    // admin tools

    $("#display canvas").on("click",function(event){
        let pos = new vector(event.offsetY - world.container.y, event.offsetX - world.container.x)
        let tile = game.global_to_tile(pos, game.tile_size*world.container.scale.x);
        console.log(tile.point)
        if(admin.tool == "Create"){
            
            let sprite = new PIXI.Sprite(tile_sheet.textures[admin.selected_sprite]);
            sprite.x = tile.x * game.tile_size;
            sprite.y = tile.y * game.tile_size;

            sprite.width = 71;
            sprite.height = 71;

            //if(admin.zIndex == 0){world.background.addChild(sprite)};
            //if(admin.zIndex == 1){world.grid.addChild(sprite)};
            //if(admin.zIndex == 2){world.foreground.addChild(sprite)};
            sprite.zOrder = admin.zIndex;
            world.grid.addChild(sprite)
            console.log(sprite.zOrder)

            let tile_object = {x:tile.x, y:tile.y, z:admin.zIndex, r:0, n: admin.selected_sprite}
            if(tile_object.n=="09_04"){ // doors
                tile_object.function = "world.draw_map(map_list[0], plr)";
            }else if(tile_object.n=="00_05"){
                tile_object.function = "game.start_game('slide-puzzle');";
            } // event
            console.log(tile_object)
            world.map.data.push(tile_object);

        }else if(admin.tool == "Object"){
            console.log("obj")
        }else if(admin.tool == "Delete"){
            for(let i = 0; i < world.map.data.length; i++){
                if(world.map.data[i].x == tile.x && world.map.data[i].y == tile.y){
                    world.map.data.splice(i, 1)
                    world.grid.removeChildAt(i);
                    break;
                }
            }
        }
    })

    $(".admin-tools #sprite_selection").on("click",function(event){
        let pos = game.global_to_tile(new vector(event.offsetX, event.offsetY), 72/2);
        admin.selected_sprite = "" + Math.floor(pos.y/10) + pos.y%10 + "_" + Math.floor(pos.x/10) + pos.x%10;

        $("#sprite_selection_box").css({
            top: (35 + pos.x*36) + "px",
            left: (pos.y*36) + "px",
        })
        console.log(admin.selected_sprite);
    })

    $(".admin-tools #Create").on("click",function(event){ admin.tool = "Create" })
    $(".admin-tools #Delete").on("click",function(event){ admin.tool = "Delete" })
    $(".admin-tools #Object").on("click",function(event){ admin.tool = "Object" })
    $(".admin-tools #None").on("click",function(event){ admin.tool = "None" })

    $(".admin-tools #z0").on("click",function(event){ admin.zIndex = 0 })
    $(".admin-tools #z1").on("click",function(event){ admin.zIndex = 1 })
    $(".admin-tools #z2").on("click",function(event){ admin.zIndex = 2 })

    $(".admin-tools #save-btn").on("click",function(event){ 
        let str = JSON.stringify(world.map.data);
        //console.log(str)
        $(".admin-tools textarea").val(str); 
    })
}

// ---------------------------------------------------------------------- //
// ---------------------------------------------------------------------- //

/*

Ensure autoResize is set to `false`
Use CSS to style the canvas to 100% width/height (remember to make html/body/canvas parent have 100% height too)
Call renderer.resize() with the values of canvas.clientWidth and canvas.clientHeight

*/

// ---------------------------------------------------------------------- //
/*
let interaction = new PIXI.interaction.InteractionManager(app.renderer,{})
interaction.on("click",click_function)
*/
// ---------------------------------------------------------------------- //

// ---------------------------------------------------------------------- //
/*
// create a new Sprite from an image path
let bunny = PIXI.Sprite.fromImage('game/assets/images/Random.png')

// center the sprite's anchor point
bunny.anchor.set(0.5);
app.stage.addChild(bunny);

bunny.interactive = true;
bunny.on('pointerdown',function(){
    console.log("clicked on bunny")
});


    let sheet = loader.resources["player1"].spritesheet;
    let sprite = new PIXI.Sprite(sheet.textures["frame00"]);
    sprite.position.x = 80;

    let anim = new PIXI.extras.AnimatedSprite(Object.values(sheet.textures));
    anim.animationSpeed = .3;
    anim.position.x = 270;
    anim.anchor.x = 1;
    anim.scale.x = -1;
*/



