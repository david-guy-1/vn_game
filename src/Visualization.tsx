

import { useEffect, useMemo, useState } from "react";
//@ts-ignore
import knapsack from "./knapsack";
import { draw_command } from "./draw_commands";
import { draw } from "./process_draws";

type stack_frame = {
    "call stack" : [number, number][], "table" : Record<string, [number, string]>
}
function draw_(c : CanvasRenderingContext2D, stack : stack_frame, state : game_state){
    if(stack == undefined){
        throw " stack is undefined "; 
    }
    c.clearRect(0, 0, 2000, 2000); 
    // x takes in capacities, y takes in number of remaining items
    let color_rect = function(lst : draw_command[], x : number, y : number, color : string){
        let height = 540/(state.names.length+1); // number of items
        let width = 860/ (state.capacity+1); // capacity
        lst.push({type:"drawRectangle2", "tlx" : x * width, "tly" : y * height, width : Math.max(3, width), "height" : height , "color":color, "fill": true}); 
    }
    let lst : draw_command[] = [{type:"drawRectangle", "tlx":0,"tly":0, "brx":2000, "bry":2000 , "color":"#aaaaaa", "fill":true}]
    console.log(stack);
    for(let [amt, start] of stack["call stack"]){
        color_rect(lst, amt, start, "yellow");
    }
    for(let item of Object.keys(stack.table)){
        let [x,y] = item.split(" ").map(a => parseInt(a));
        color_rect(lst, x, y, "green"); 
    }
    draw(lst, c);

}
function Visualization({state, fn} : {state:game_state,fn:Function}){
    let [exp, setExp] = useState<boolean>(false);
    let stacktrace = useMemo(function(){
        let k = new knapsack(state.w, state.v); 
        k.solve(state.capacity, 0, true);
        let stacktrace : stack_frame[] = k.stacktrace; 
        console.log(stacktrace.length)
        return stacktrace;
    }, [state] );
    let [current_stack, set_current_stack] = useState<number>(0);
    console.log(stacktrace.length)
    console.log(current_stack);
    console.log(stacktrace[current_stack])
    useEffect(function(){
       
        draw_((document.getElementById("a") as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D, stacktrace[current_stack], state); 
    }, [current_stack])
    useEffect(function(){
         //componentDidMount
         let x=  setInterval(function(){
            if(current_stack + 1 < stacktrace.length){
                set_current_stack(current_stack + 1); 
            }
         }, 200)
         return () => clearInterval(x);
    }, [current_stack])
    return <>
    {/* main canvas */}

    <canvas id="a" style={{position:"absolute", top:0,left:0}}width={860} height={540}></canvas> 
    
    {/* back button */}

    <button style={{position:"absolute", top:540,left:0}} onClick={() => setExp(true)}>What's this?</button>
    <button style={{position:"absolute", top:590,left:0}} onClick={() => fn()}>Go back</button>

    {/* table */}

    <table style={{position:"absolute", top:540,left:150, border:"1px solid black"}}><tr>
        {
            ["Weight"].concat(state.w.map(x => x.toString())).map(x => <td>{x}</td>) 
        }
        </tr>
        <tr>
        {
            ["Value"].concat(state.v.map(x => x.toString())).map(x => <td>{x}</td>) 
        }
        </tr>
        <tr>
        {
            ["Optimal"].concat(state.opt.map(x => x ? "Y" : "N")).map(x => <td style={{color : x == "Y" ?"green" : "red"}}>{x}</td>) 
        }
        </tr>
        {
            ["Your choice"].concat(state.taken.map(x => x ? "Y" : "N")).map(x => <td style={{color : x == "Y" ?"green" : "red"}}>{x}</td>) 
        }
        </table>


    {/* list on right */}

    <div style={{position:"absolute", top:0,left:870, width:90}}><b>Call stack ({stacktrace.length} total calls)</b><br />
        {
            stacktrace[current_stack]["call stack"].map(([x,y]) => <> {x} , {y}<br /></>)
        }
        </div>
    {/* explanation */}
    {exp ? <div style={{position:"absolute",top:50, left:50, width:800, height:400, padding:10, zIndex:1,backgroundColor:"#cccccc", border:"1px solid black"}}> 

        <br />
        The game you just played is an instance of the <a target="_blank" href="https://en.wikipedia.org/wiki/Knapsack_problem">knapsack problem</a>. This is a visualization of a dynamic programming algorithm being used to solve the instance.<br />
        It is usually stated in terms of weights and values. There are a collection of items. You want to bring the most valuable collection of items but you are limited by the amount of weight you can carry.
        <br />
        In this game, you want to maximize the amount of enjoyment while being restricted by the time limitation.
        <br />
        The knapsack problem is NP-complete, meaning that any fast (polynomial time) method to solve the knapsack can be adapted to solve any problem whose solutions can be easily checked.
        <br /> 
        The algorithm that is being displayed is a dynamic programming algorithm. For each item, it guesses whether or not to take the item. Then , the algorithm recursively calls itself with one item fewer. 
        <br />
        If the algorithm is called with the same inputs as a previous call, the result is cached so the computations don't have to be performed again.
        <br />
        The call stack on the right shows the recursive calls that the algorithm is making
        <br />
        The part on the left shows the current cache. A green rectangle indicates that the value is in the cache, and a yellow one means that the value is currently being computed.
        <br />
        <button onClick={() => setExp(false)}>Close</button>
        </div>: null}
    </>
    
}

export default Visualization