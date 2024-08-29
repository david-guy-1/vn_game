import React, { useEffect, useState } from "react";
import { generate_level } from "./generate_level";
import { draw_command } from "./draw_commands";
import { draw } from "./process_draws";
import { render } from "react-dom";
import { getMuted, toggleMute } from "./Sound";
import { get_w_and_v } from "./get_w_and_v";
const date_scenes = "movie theater|circus|zoo|dancing|museum|escape room|bowling|painting|skating|video games|board games|rock climbing|karaoke|stargazing|golf|bookstore|store|restaurant|park|garden".split("|");

let entry = 0;
let state :game_state | undefined = undefined;

function draw_(){
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
        

        //draw middle part 
        
        for(let i=0; i<9; i+=3){
            let color = ["#782a29","#682020","#481010"][i/3]
            lst.push({type:"drawRectangle", "tlx":146+i, "tly":254+i, "brx":638-i, "bry" : 415-i, "color":color, "fill":true})
        }
        

        lst.push({type:"drawText", "x":172, "y":296, "color":"#45fcfc", text_:`There is no more time to do anything else.`})
        lst.push({type:"drawText", "x":172, "y":316, "color":"#45fcfc", text_:`Click anywhere to go to the ending.`})
        draw(lst, c);
        
    } else {
        console.log("NO STATE")
    }

}

function clicked(x : number,y : number, fn : Function){
    if(Date.now() - entry > 300){
        fn();
    }
}
export function Selection_end(props : {state : game_state, return : Function}){
    state = props.state;
    entry = Date.now(); 
    let [render, reRender] = useState(false);

    useEffect(function(){
        //componentDidMount


        document.getElementById("a")?.addEventListener("click", function(e){
            console.log("CLICK");
            clicked(e.offsetX, e.offsetY, props.return)
        })
        draw_();
        return function(){
            //componentWillUnmount
        }
    }, []); 
    return <><canvas id="a" style={{position:"absolute", top:0,left:0}}width={960} height={700}> </canvas>
    
    <img style={{position:"absolute", top:0, left:0, zIndex:3}} src={getMuted() ? "mute.png" : "unmute.png"} onClick={() => { toggleMute(); reRender(!render )}} />
    
    </>
}