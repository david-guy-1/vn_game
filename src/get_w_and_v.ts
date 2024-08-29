export function get_weight(state : game_state){
    let w_ =0;
    for(let i=0; i<state.names.length; i++){
      if(state.taken[i]){
        w_ += state.w[i]
      }
    }
    return w_;
}
export function get_w_and_v(x : game_state){ // REMAINING w and v
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
export function can_choose(x : game_state, item : number) : boolean{
    //console.log("got here")
    //console.log(x)
    if(x.taken[item]){
        return false; 
    }
    let [w,v] = get_w_and_v(x);
    //console.log([x.w[item], w])
    return x.w[item] <= w;
}

export function can_choose_any(state : game_state){
    // compute current weight
    let w_ =0;
    for(let i=0; i<state.names.length; i++){
      if(state.taken[i]){
        w_ += state.w[i]
      }
    }
    let remaining = state.capacity - w_;
    for(let i=0; i<state.names.length; i++){
      if(!state.taken[i] && state.w[i] <= remaining){
        return true;
      }
    } 
    return false; 
  }


export function summarize(state : game_state){
    let obj = [];
    for(let i=0; i<state.names.length; i++){
        obj.push({"name":state.names[i], "time" : state.w[i], "enjoyment":state.v[i]})
    }
    return obj;
}