import { MutableRefObject, Ref, useRef, useState } from 'react'

import './App.css'
import {draw} from "./process_draws"; 
import React from 'react'
import { draw_command } from './draw_commands';
import game from './Game';
import { dist } from './lines';
import write_command from './write_commands';
import Game from './Game';
import { Selection_ } from './Selection_';
import { initialize } from './generate_level';
//@ts-ignore
import {command_lst } from './command_lst';
import { Selection_end } from './Selection_end';
import { End } from './End';
import { can_choose_any, get_w_and_v, get_weight } from './get_w_and_v';
import { load_images } from './load_images';
import Visualization from './Visualization';
let state : game_state | undefined= undefined;
let commands : write_command[] = [];
function choice(n : number){
  if(!state){
    throw "state is undefined"
  }
  let name = state.names[n]; 
  state.taken[n] = true;
  if(state.opt[n] ){
    commands = command_lst[name + " good"];
  } else {
    commands = command_lst[name + " bad"];
  }
}
type game_screen = "menu" | "reading" | "selection" |"selection_transition"| "end_reading" | "end2" | "end_sel" | "end3" | "intro" | "loading" | "vis" | "visloading" | "name"

let player_name = ""

function App() {
  const [count, setCount] = useState<game_screen>('loading')
  if(count == "loading"){
    load_images().then(() => setCount("menu"));
    return "Loading"
  }
  if(count == "name"){
    return <><img src="title scene.png" style={{position:"absolute",top:0, left:0, zIndex:-1}} />
    <div style={{position:"absolute",top:10, left:0}} ><h1> Enter your name </h1><br />
    <input type="text" id="name_input" defaultValue="Jim"/><button onClick={function(){
      //@ts-ignore
      player_name = document.getElementById("name_input").value;
      setCount("intro");
    }}> Start</button></div></>
  }
  if(count == "intro"){
    if(!state){
      throw "state is undefined"
    }
    return (
      <Game player_name={player_name} c={commands} return_={!can_choose_any(state) ?  () => setCount("end_sel") : () => setCount("selection")}/>
    )
  }
  if(count == "reading"){
    if(!state){
      throw "state is undefined"
    }
    return (
      <Game player_name={player_name} c={commands} return_={!can_choose_any(state) ?  () => setCount("end_sel") : () => setCount("selection_transition")}/>
    )
  }
  if(count == "menu"){
    return <><img src="title scene.png" style={{position:"absolute",top:0, left:0, zIndex:-1}} />
    <div style={{position:"absolute", "backgroundColor":"#003300", "opacity" :0.7, top:30, left:100, width:500, height:280 }}></div>
      <div style={{position:"absolute", top:30, left:100, width:500, height:250 , color:"white"}}>
    <h2>A Fun Day With Laura</h2>
    
    <button onClick={() => {state = initialize(); commands = command_lst["intro good"];setCount("name")}}>Start; </button> <br />{state ? <button onClick={() => setCount("visloading")}>Visualize solution</button> : null} <ul>
      <li> Credits:</li><li>Piano notes: <a href="https://freesound.org/people/TEDAgame/packs/25405/">TEDAGame</a></li><li>Graphics : GIMP and three.js</li><li>Framework : React</li></ul></div></>
  }
  if(count == "selection_transition"){
    return <><img src="transition.png" style={{position:"absolute",top:0, left:0, zIndex:-1}} />
  <div style={{position:"absolute",top:200, left:200, width:500, height:100,backgroundColor:"#444444", padding:10, fontSize:60, color:'white'}}>End of activity </div>

  <div onClick={()=>setCount("selection")} style={{position:"absolute",top:400, left:300, width:300, height:100,backgroundColor:"#444444",padding:10, fontSize:60, color:'white'}}>Continue</div>

  </>

  }
  if(count == "selection"){
    if(!state){
      throw "state is undefined"
    }
    return <Selection_ state={state} return={(x : number) => {choice(x); setCount("reading")}} />
  }
  if(count == "end_sel"){
    if(!state){
      throw "state is undefined"
    }
    return <Selection_end  state={state} return={(x : number) => {choice(x); setCount("end_reading")}} />
  }
  if(count == "end_reading"){
    if(!state){
      throw "state is undefined"
    }
    // get ending
    let v_ = get_w_and_v(state)[1];
    let ratio = v_/state.opt_amt; 
    if(v_ == state.opt_amt){
      commands = command_lst["end good"];
    } else if(ratio > 0.98){
      commands = command_lst["end neutral"];
    } else {
      commands = command_lst["end bad"];
    }
    return (
      <Game c={commands} return_={() => setCount("end2") }player_name={player_name} />
    )
  }
  if(count == "end2"){
    if(!state){
      throw "state is undefined"
    }
    let v_ = get_w_and_v(state)[1];
    
    return <End state={state} return={v_ == state.opt_amt ?  () => setCount("end3") :  () => setCount("menu")}/>
  }
  if(count == "end3"){
    return <img src="small_scenes/end.png"  style={{"position":"absolute", "top":0, "left":0}} onClick={() => setCount("menu")} />
  }
  if(count == "vis"){
    if(!state){
      throw "state is undefined"
    }
    return <Visualization state={state} fn={() => setCount("menu")} /> 

  }
  if(count == "visloading"){
    if(!state){
      throw "state is undefined"
    }
    setTimeout(() => setCount("vis"), 10)
    return "Visualization is loading (this might take some time)"

  }


}

export default App
