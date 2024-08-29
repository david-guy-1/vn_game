//@ts-ignore
import knapsack from "./knapsack"; 
function make_good_knapsack() : [knapsack, number, string]{
	let w = []

	let v = []

	for (let i=0; i < 20; i++){
		let t = Math.random()*2+0.5;
		w.push(Math.floor(t * 45))
		v.push(Math.floor(t * 30 * (Math.random() * 0.1 + 1)))
		
	}
	let cap = 600;
	let k = new knapsack(w, v);
	let sol = k.solve(cap);
	let greedy = k.greedy(cap);
	console.log([sol, greedy, greedy[0]/sol[0]]);
	if(greedy[0] / sol[0] > 0.98){
		return make_good_knapsack(); 
	} else { 
		return [k, sol[0], sol[1]];
	}


}
export function generate_level() : [number[], number[], number, boolean[], number, string[]]{
	// generate this using knapsack generator
	let [k,opt_amt,  opt_] = make_good_knapsack(); 

	let w :number[] = k.w;
	let v : number[] = k.v;
	let capacity : number = 600; 
	let opt : boolean[]= Array.from(opt_).map(x => x == "1");
	
	// everything below here is hard-coded
	let names_by_length : string[] = "movie|circus|zoo|dancing|museum|escape room|bowling|painting|skating|video games|board games|rock climbing|singing|scenery|golf|library|grocery store|restaurant|park|garden".split("|");
	// sort the numbers 0-19 based on w 
	let lst = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].sort((x,y) => w[x] - w[y])
	// lst[0] is index of shortest thing, lst[19] is longest. 
	let names : string[] = ["","","","","","","","","","","","","","","","","","","",""];
	for(let i=0; i<20; i++){
		names[lst[i]] = names_by_length[19 - i]
	}
	return [w, v, capacity, opt,opt_amt, names];
}

export function initialize() : game_state {
	let [w, v, capacity, opt,opt_amt, names] = generate_level(); 
	return {"w":w, "v":v, "capacity":capacity,"names":names, 'opt':opt, "taken":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], opt_amt : opt_amt}	
}