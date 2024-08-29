class knapsack{
    constructor(w, v){
        this.w = w;
        this.v = v;
        this.table = {}
		this.hits = 0;
		this.stacktrace = [] ; // each element is a list (call stack), and a lookup table
		this.call_stack = []; 
    }
    solve(amt, start=0, stacktrace = false){
		if(stacktrace){
			this.call_stack.push([amt, start]); 
		}
        let l_str = amt + " " + start
		// check lookup table
        if(this.table[l_str] != undefined){
			if(stacktrace){
				this.call_stack.pop();
			}
            return this.table[l_str];
        }
		// base case : no items
		if(start == this.w.length){
			if(stacktrace){
				this.call_stack.pop();
			}
			return [0, ""];
		}
		// breakpoint 1; 
		if(stacktrace){
			this.stacktrace.push({"call stack" : JSON.parse(JSON.stringify(this.call_stack)) , "table" : JSON.parse(JSON.stringify(this.table))})
		}
		// guess yes
		let yes_amt, yes_choices;
        if(amt - this.w[start] < 0){
            yes_amt = -1;
            yes_choices = "DO NOT SELECT";
        } else { 
            [yes_amt, yes_choices] = this.solve(amt-this.w[start], start+1, stacktrace );
            yes_amt += this.v[start]; 
            }
        // guess no
        let [no_amt, no_choices] = this.solve(amt, start + 1, stacktrace );
        // choose the larger one
		let out; 
		if(yes_amt > no_amt){
            out= [yes_amt, "1" + yes_choices]
        } else {
            out = [no_amt, "0" + no_choices];
        }
        this.table[l_str] = out;
		// breakpoint 2;
		if(stacktrace){
			this.stacktrace.push({"call stack" : JSON.parse(JSON.stringify(this.call_stack)) , "table" : JSON.parse(JSON.stringify(this.table))})
		}
		if(stacktrace){
			this.call_stack.pop();
		}
        return out; 
    }
	greedy(amt){
		let rem = amt;
		let ratios = [];
		let take = [];
		for(let i=0; i < this.w.length; i++){
			ratios.push(this.v[i] / this.w[i])
			take.push(false);
		}
		// while still can take : 
		while(true){
			let take_this = undefined; 
			for(let i=0; i < this.w.length; i++){
				if(take[i]){
					continue;
				}
				if(rem < this.w[i]){
					continue;
				}
				if(take_this == undefined || ratios[i] > ratios[take_this]){
					take_this = i; 
				}
			}
			if(take_this == undefined){
				break; // cannot take any more
			}
			take[take_this] = true;
			rem -= this.w[take_this];
		}
		let s = 0
		let items = ""
		for(let i=0; i < this.w.length; i++){
			if(take[i]){
				s += this.v[i];
				items += "1";
			} else {
				items += "0";
			}
		}
		return [s, items]
	}
	brute_force(amt){
		let current = [];
		for(let i=0; i<this.w.length;i++){
			current.push(false);
		}
		let best = 0;
		let best_takes = [];
		let increment = function(lst){
			let i = lst.length - 1;
			while(i >= 0){
				if(lst[i] == true){
					lst[i] = false;
				}
				else{
					lst[i] = true; 
					break;
					return false; 
				}
				i--;
				if(i == -1){
					return true;  // true = done incrementing
				}
			}
		}
		let knapsack_valid = function(lst){
			//console.log(amt);
			let weight = 0; 
			let value = 0;
			for(let i=0; i<lst.length; i++){
				if(lst[i]){
					weight += this.w[i];
					value += this.v[i];
				}
				if(weight > amt){
					return -1;
				}
			}
			return value; 
		}.bind(this);
		while(true){
			let done = increment(current)
			if(done){
				break;
			}
			//console.log(current);
			let gotten = knapsack_valid(current)
			if(gotten > best){
				best = gotten; 
				best_takes = JSON.parse(JSON.stringify(current));
			}
		}
		return [best, best_takes.map((x) => x ? "1" : "0").join("")]
	}
}

export default knapsack; 
