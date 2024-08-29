import React, { useEffect, useState } from "react";
import { generate_level } from "./generate_level";
import { draw_command } from "./draw_commands";
import { draw } from "./process_draws";
import { render } from "react-dom";
import { getMuted, toggleMute } from "./Sound";
import { get_weight } from "./get_w_and_v";
const date_scenes = "movie theater|circus|zoo|dancing|museum|escape room|bowling|painting|skating|video games|board games|rock climbing|karaoke|stargazing|golf|bookstore|store|restaurant|park|garden".split("|");

let entry = 0;
let state :game_state | undefined = undefined;

function get_w_and_v(x : game_state){
    let w_sum = 0;
    let v_sum = 0;
    for(let i=0; i<x.names.length; i++){
        if(x.taken[i]){
            w_sum += x.w[i]; 
            v_sum += x.v[i];
        }
    }
    return [x.capacity - w_sum, v_sum]
}
function draw_(){
    let c = (document.getElementById("a") as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D; 
    c.clearRect(0,0,1000,1000)
    //console.log(lst);
    //console.log(c);
    draw([{type:"drawImage", "x":0, "y":0, "img":"small_scenes/selection.png"}],c )
    if(state){
        let lst : draw_command[] = []; 

        let v_ = get_w_and_v(state)[1];
    

        //draw middle part 
        
        for(let i=0; i<9; i+=3){
            let color = ["#782a29","#682020","#481010"][i/3]
            lst.push({type:"drawRectangle", "tlx":146+i, "tly":254+i, "brx":438-i, "bry" : 415-i, "color":"#782a29", "fill":true})
        }
        

        lst.push({type:"drawText", "x":172, "y":296, "color":"#45fcfc", text_:`Laura's enjoyment : ${v_}`})
        
        lst.push({type:"drawText", "x":172, "y":326, "color":"#45fcfc", text_:`Optimal enjoyment : ${state.opt_amt}`})

        lst.push({type:"drawText", "x":172, "y":356, "color":"#45fcfc", text_:`Ending: ${v_ == state.opt_amt ? "Good" : (v_ / state.opt_amt > 0.98 ? "Medium" : "Bad") }`})

        //girl image starts at 235 , 213
        lst.push({type:"drawImage", "x":450-235, "y":30-213, "img":`${v_ == state.opt_amt ? "girl happy.png" : (v_ / state.opt_amt > 0.98 ? "girl neutral.png" : "girl sad.png") }`})

        lst.push({type:"drawText", "x":172, "y":386, "color":"#45fcfc", text_:`Click anywhere to continue.`})
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
export function End(props : {state : game_state, return : Function}){
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