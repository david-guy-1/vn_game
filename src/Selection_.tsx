import React, { useEffect, useState } from "react";
import { generate_level } from "./generate_level";
import { draw_command } from "./draw_commands";
import { draw } from "./process_draws";
import { render } from "react-dom";
import { getMuted, play, toggleMute } from "./Sound";
import { get_w_and_v, can_choose, summarize } from "./get_w_and_v";
import { drawRectangle } from "./canvasDrawing";
const date_scenes = "movie theater|circus|zoo|dancing|museum|escape room|bowling|painting|skating|video games|board games|rock climbing|karaoke|stargazing|golf|bookstore|store|restaurant|park|garden".split("|");

let lst : draw_command[] = [] ;
let state :game_state | undefined = undefined;
let current_over : number | undefined = undefined
let entry = 0;
let played_time = 0; 

function draw_(){
    //console.log("Drawing" + lst);
    let c = (document.getElementById("a") as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D; 
    c.clearRect(0,0,1000,1000)
    //console.log(lst);
    //console.log(c);
    draw([{type:"drawImage", "x":0, "y":0, "img":"small_scenes/selection.png"}],c )
    if(state){
        let lst : draw_command[] = []; 
        //draw top part
        let [current_w,current_v] = get_w_and_v(state);  
        lst.push({type:"drawRectangle", "tlx":33, "tly":15, "brx":791, "bry" : 87, "color":"#782a29", "fill":true})
        lst.push({type:"drawRectangle", "tlx":35, "tly":17, "brx":789, "bry" : 85, "color":"#651f1f", "fill":true})
        lst.push({type:"drawRectangle", "tlx":37, "tly":19, "brx":787, "bry" : 83, "color":"#451c1c", "fill":true})
        lst.push({type:"drawText", "x":50, "y":50, "color":"#45fcfc", text_:`Time remaining: ${current_w} `})
        
        lst.push({type:"drawText", "x":450, "y":50, "color":"#45fcfc", text_:`Laura's enjoyment: ${current_v}`})
        
        lst.push({type:"drawRectangle", "tlx":146, "tly":514, "brx":738, "bry" : 575, "color":"#782a29", "fill":true})
        lst.push({type:"drawRectangle", "tlx":147, "tly":517, "brx":735, "bry" : 572, "color":"#682020", "fill":true})
        lst.push({type:"drawRectangle", "tlx":151, "tly":521, "brx":731, "bry" : 568, "color":"#481010", "fill":true})

        //draw bottom part 
        if(current_over != undefined){
            lst.push({type:"drawText", "x":162, "y":556, "color":"#45fcfc", text_:`${state.names[current_over]} ${can_choose(state, current_over) ? "" : "- no time"} `})
            lst.push({type:"drawText", "x":462, "y":556, "color":"#45fcfc", text_:`(time : ${state.w[current_over]}, enjoyment ${state.v[current_over]})`})
        }
        draw(lst, c);
        
    } else {
        throw "NO STATE";
    }
    draw(lst, c);
    lst = []; 
}
function add_sel (x : number, y: number, select:boolean, icon : string,enough_time : boolean, w : number, v : number){
    //console.log([x,y,x-187+216,   y-192+205]);
    lst.push({type:"drawImage", 'img' : select ? "selection.png" : "icon.png", x : x-187,  y : y-192})
    lst.push({type:"drawImage", 'img' :`icons/${icon}.png`, x : x-187+216,  y : y-192+205})
    lst.push({type:"drawText", 'text_' :`${w}`, x : x-187+311, size:21, color:"#aaaaff" ,y : y-192+205+20})
    lst.push({type:"drawText", 'text_' :`${v}`, x : x-187+311, size:21, color:"#ffffaa" ,y : y-192+205+50})
    
    if(!enough_time){
        lst.push({type:"drawRectangle2", tlx:(x + 216 - 187),tly : y + 205 - 192, "width":87, height:67, "color":"black", "fill":true, "transparency":0.8});
    }
    
}
function render_all(){
    if(!state){
        throw "no state"; 
    }
    //console.log([current_over, Math.random()])
    for(let i=0; i<5; i++){
        for(let j=0; j<4; j++){
            let index = i*4 + j 
            if(state?.taken[index]){
                continue; // Don't draw anything that is already done
            }
            let x = 160*i+ 10;
            let y = 100*j + 100;
            
            add_sel(x,y,index == current_over, state?.names[index], can_choose(state, index), state.w[index], state.v[index]); 
        }
    }
    draw_(); 
}
function moved(ex : number, ey : number){
    let new_over : number | undefined = undefined; 
    for(let i=0; i<5; i++){
        for(let j=0; j<4; j++){
            let index = i*4 + j;  
            if(state?.taken[index]){
                continue;
            }
            let x = 160*i+ 10;
            let y = 100*j + 100;
            let [w,h] = [156, 82];
            if(x <= ex && ex <= x+w && y <= ey && ey < y+h){
                new_over = index;
                break; 
            }
        }
    }
    if(new_over != current_over){
        if(current_over == undefined){
            let now = Date.now();
            if(now - 100 > played_time){
                play("hover.mp3");
                played_time = now;
            }
        }
        current_over = new_over; 
        render_all(); 
    }
    current_over = new_over; 
    //console.log([ex,ey,current_over, new_over])
    
}
function clicked(x : number,y : number, fn : Function){
    //console.log(x + " " + y + current_over + " CLICKS")
    if(state && current_over != undefined && !state?.taken[current_over] && can_choose(state, current_over) && Date.now() - entry > 300){
        fn(current_over);
    }
}
export function Selection_(props : {state : game_state, return : Function}){
    state = props.state;
    
    entry = Date.now(); 
    let [render, reRender] = useState(false);

    useEffect(function(){
        //componentDidMount
        document.getElementById("a")?.addEventListener("mousemove", function(e){
            moved(e.offsetX, e.offsetY)
        })

        document.getElementById("a")?.addEventListener("click", function(e){
            //console.log("CLICK");
            clicked(e.offsetX, e.offsetY, props.return)
        })
        render_all(); 
        return function(){
            //componentWillUnmount
        }
    }, []); 
    return <><canvas id="a" style={{position:"absolute", top:0,left:0}}width={960} height={700}> </canvas>
    <textarea style={{position:"absolute", top:600,left:100}}>{JSON.stringify(summarize(state))}</textarea>
    <img style={{position:"absolute", top:0, left:0, zIndex:3}} src={getMuted() ? "mute.png" : "unmute.png"} onClick={() => { toggleMute(); reRender(!render )}} />
    
    </>
}