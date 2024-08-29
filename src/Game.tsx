import { MutableRefObject, useEffect, useRef, useState } from "react";
import write_command from "./write_commands";
import { draw_command, drawImage_command } from "./draw_commands";
import { draw } from "./process_draws";
import { move_towards } from "./lines";
import { animation } from "./animations";
import { change_music, get_music, getMuted, play, toggleMute } from "./Sound";
import React from "react";


let w = 960;
let h = 540
class fg_anim implements animation { 
    img : string;
    x : number;
    y : number;
    init_x : number;
    init_y : number;
    desired_x : number;
    desired_y : number;
    constructor(img  :  string,x  :  number,y  :  number){
        this.img =img ;
        this.x =x ;
        this.y =y ;
        this.init_x = x;
        this.init_y = y; 
        this.desired_x = x;
        this.desired_y = y; 
    }
    update(){
        let [rx, ry] = move_towards([this.x,this.y],[this.desired_x,this.desired_y], 5) ; 
        this.x = rx;
        this.y = ry; 
        return false; 
    } 
    draw(){
        return [{type:"drawImage", x : this.x, y : this.y, img : this.img} as drawImage_command];  
    }
}

let commands: write_command[] = [];
let current : number = -1; 
let dict : Record<string, fg_anim> = {};

function get_last_bg_call(commands:write_command[], index : number){
    while(index >= 0){
        let c = commands[index]
        if(c.type == "bg"){
            return c.img;
        }
        index--;
    }
    return "";
}

function get_last_music_call(commands:write_command[], index : number){
    while(index >= 0){
        let c = commands[index]
        if(c.type == "music"){
            return c.path;
        }
        index--;
    }
    return undefined;
}

// image is currently on ctx1, ctx2 in front 
function transition(ctx1 : CanvasRenderingContext2D, ctx2: CanvasRenderingContext2D, first_img: string, second_img: string){
    // current image goes to ctx2, new image goes to ctx1, then erase ctx2
    draw([{type:"drawImage",x:0, y:0, img:first_img }], ctx2); 
    draw([{type:"drawImage",x:0, y:0, img:second_img }], ctx1);
    for(let i=0; i<30; i++){
        setTimeout(() => ctx2.clearRect(0, 0, i*60, 1000), 20*i);
        setTimeout(() => ctx2.clearRect(w-i*60, 0, w, 1000), 20*i);
    } 
    //console.log("transitioning");
}
let displayed = "";

function Game({c,return_, player_name} : {"c":write_command[], return_:Function,player_name : string}){
    if(player_name == undefined){
        throw "no name"
    }
    commands = c; 
    const displayCanvas : MutableRefObject<HTMLCanvasElement | null> = useRef(null);  
    const frontCanvas : MutableRefObject<HTMLCanvasElement | null> = useRef(null);  
    const swapCanvas : MutableRefObject<HTMLCanvasElement | null> = useRef(null);  
    const iconCanvas : MutableRefObject<HTMLCanvasElement | null> = useRef(null);  
    let [text, setText] = useState(""); 
    let [speaker, setSpeaker] = useState(""); 
    let [icon, setIcon] = useState(""); 
    let [render, reRender] = useState(false);
    function change(){
        current++;
        //console.log(current);
        if(!displayCanvas.current){
            return; 
        }
        let ctx = displayCanvas.current.getContext("2d");
        if(!ctx){
            return; 
        }
        let lst : draw_command[] = []; 
        let current_command = commands[current]
        if(current_command == undefined){
            return_();
            return;
        }
        // background
        let next_img = get_last_bg_call(commands, current);
        //console.log([displayed,next_img]);
        if(next_img != displayed){
            if(displayed == ""){
                lst.push({type:"drawImage", "x":0, "y":0, "img" : get_last_bg_call(commands, current)}); 
            } else {
                //transition
                let ctx2 = swapCanvas.current?.getContext("2d");
                if(ctx2){
                    transition(ctx, ctx2, displayed, next_img); 
                }
            }
        }
		//console.log("setting displayed to " + next_img);
        displayed = next_img;
        //music
        let music = get_last_music_call(commands, current);
        if(music != get_music()){
            change_music(music);
        }
        switch(current_command.type){           
        case "speaker":
            setText(current_command.text); 
            setSpeaker(current_command.speaker?.replace("PLAYER_ONE", player_name) ?? ""); 
            setIcon(current_command.icon_image ?? "");
            // move items
            for(let item of Object.keys(dict)){
                let anim = dict[item];
                if(item == current_command.speaker){
                    anim.desired_y = anim.init_y - 30; 
                } else {
                    anim.desired_y = anim.init_y;
                }
            }            
            break;
        case "fg":
            // if already exists and same image, ignore it.
            let key = current_command.key;
            if(dict[key] != undefined && dict[key].img == current_command.img){
                ;    
            } else { 
                if(current_command.img == undefined){
                    delete dict[key]; 
                } else { 
                    // if already exists, keep the X and Y.
                    if(dict[key] != undefined){
                        let [old_x, old_y] = [ dict[key].desired_x, dict[key].desired_y];
                        dict[key] = new fg_anim(current_command.img, current_command.x , current_command.y);
                        dict[key].x = old_x; 
                        dict[key].y = old_y;
                    } else { 
                        dict[key] = new fg_anim(current_command.img, current_command.x, current_command.y );
                    }
                }
            }
            break;
        }       

        //ctx.clearRect(0, 0, 2000, 2000);
        draw(lst, ctx); 
        if(current_command.type != "speaker"){
            change(); // repeatedly call until speaker 
        }
    }
    function goback(){
        console.log("called!");
        console.log(commands)
        console.log(current)
        let pointer = current;
        while(pointer > 0 ){
            
            pointer--;
            if( commands[pointer].type == "speaker"){
                break; 
            }
        }
        current = pointer-1;
        console.log(current);
    }
    function change2(e : KeyboardEvent){
        console.log(e.key);if(e.key == "ArrowLeft" || e.key == "Backspace"){goback()}; change()
    }
    function run(){
        // go over each item in the dict;
        if(!frontCanvas.current){
            return; 
        }
        let ctx = frontCanvas.current.getContext("2d");
        if(!ctx){
            return; 
        }
        let lst : draw_command[] = []; 
        for(let item of Object.keys(dict)){
            lst = lst.concat(dict[item].draw());
            dict[item].update();  
        }
        ctx.clearRect(0, 0, 2000, 2000);
        draw(lst, ctx); 

    }
    useEffect(function(){
        current = -1;
		displayed = "";
        dict = {};

        change(); // componentDidMount;    
        setInterval(run, 1000/60);
        window.addEventListener("keydown",change2);
    
        return () => { // componentWillUnmount
          window.removeEventListener("keydown", change2);
          change_music(undefined);
        };
    }, [])
    // draw icon
    useEffect(function(){
        let ctx = iconCanvas?.current?.getContext("2d")
        if( ctx){
            ctx.clearRect(0, 0, 1000, 1000);
			draw([{type:"drawRectangle", "tlx":0, "tly":0, "brx":200, bry:200,fill:true, color:"#ddffdd"}], ctx);
            if(icon){
                draw([{type:"drawImage", img:icon, x:0, y:0}], ctx)
            }
        }
    }, [icon])
    // change
    useEffect(() => {

      }, []);
    return <> 
    {/*canvases for displaying stuff  */}
    <canvas  style={{position:"absolute", top:0, left:0, zIndex:1}} ref={swapCanvas} width={w} height={h} ></canvas>
    <canvas  style={{position:"absolute", top:0, left:0, zIndex:0}} ref={displayCanvas} width={w} height={h} ></canvas>
    <canvas onClick={change} style={{position:"absolute", top:0, left:0, zIndex:1}} ref={frontCanvas} width={w} height={h}></canvas>
    {/*bottom stuff */}
    <div onClick={() => console.log(current)} style={{position:"absolute", top:h, left:130, zIndex:1, fontSize:35, fontFamily:"Times New Roman",fontWeight:"bold", color:"#667900"}} >{speaker}</div>
    <div  style={{position:"absolute", width:700 ,textAlign:"left", top:h+60, left:130, zIndex:1,fontSize:21,fontWeight:"bold", fontFamily:"Helvetica" ,overflow:"hidden"}}  >{text}</div>
    {/*displaying speaker */}
    <canvas  style={{position:"absolute", top:h, left:0, zIndex:-2}} ref={iconCanvas}  ></canvas>
    <img  src="screen_bg.png" style={{position:"absolute", top:h, left:0, zIndex:-1}} ></img>
    <br />
    <img style={{position:"absolute", top:0, left:0, zIndex:3}} src={getMuted() ? "mute.png" : "unmute.png"} onClick={() => { toggleMute(); reRender(!render )}} />
     </>
}

export default Game;