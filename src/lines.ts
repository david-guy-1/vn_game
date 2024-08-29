
type point = [number, number];
type point3d = [number, number, number];

export function flatten<T>(lst : T[][]) : T[] {
	var x  : T[] = [];
	for(var item of lst){
		for(var item2 of item){
			x.push(item2);
		}
	}
	return x;
}

export function add_obj<K extends string | number | symbol, V>(obj : Record<K,V[]>, k : K, v : V){
	if(obj[k] == undefined){
		obj[k] = [];
	}
	obj[k].push(v); 
}

export function concat_obj<K extends string | number | symbol, V>(obj : Record<K,V[]>, k : K, v : V[]){
	if(obj[k] == undefined){
		obj[k] = [];
	}
	obj[k] = obj[k].concat(v); 
}

export function lerp(start : number[], end : number[], t : number) : number[] {
	if(start.length != end.length){
		throw "lerp with different lengths"
	} 
	let out : number[] = [];
	for(let i=0; i<start.length; i++){
		out.push(start[i]*t + (1-t)*end[i]);
	}
	return out; 
}

export function noNaN(lst : any[]) {
    for (var f of lst) {
        if (typeof (f) == "number" && isNaN(f)) {
            throw "noNaN but is NaN";
        }
        if (Array.isArray(f)) {
            noNaN(f);
        }
    }
}
// av + bw
export function lincomb(a : number, v : number[], b : number, w : number[] ) : number[]  {
	let x : number[] = [];
	for(let i=0; i<v.length; i++){
		x[i] = a * v[i] + b * w[i];
	}
	return x; 
}

export function move_towards(v1 : number[] , v2 : number[] , amt : number){
	noNaN(arguments as any as any[][]); 
	if(v1.length != v2.length){
		throw "move_towards with different lengths"; 
	}
	if(amt < 0){
		throw "move_towards negative amount"
	}
	let x : number[] = [] ;
	let d = dist(v1, v2);
	if(d < amt || amt == 0 ){ // immediately move to end
		return JSON.parse(JSON.stringify(v2)) as number[] ; 
	} else {
		//v1 + (v2-v1)/d * amt; 
		return lincomb(1, v1, amt/d, lincomb(1, v2, -1, v1));
	}
}
export function num_diffs<T>(x : T[], y : T[]) : number{
	let s= 0;
	for(var i=0; i < x.length; i++){
		if(x[i] != y[i]){
			s++;
		}
	}
	return s; 
}
export function len(v: number[] ) : number{
	noNaN(arguments as any as any[][]);
	var l = 0;
	for(var item of v){
		l += item*item;
	}
	return  Math.sqrt(l);
}

export function dist(v : number[], w : number[]) : number {
	noNaN(arguments as any as any[][]);
	if(v.length != w.length){
		throw "move with uneven lengths"; 
	}
	var s = 0;
	for(var i=0; i < v.length; i++){
		s += Math.pow((w[i] - v[i]),2);
	}	
	return Math.sqrt(s);
}

export function cross(a : number[], b : number[]){
	if(a.length !== 3 || 3 !== b.length){
		throw "cross product not 3d"; 
	}
	noNaN(arguments as any as any[][]);
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

export function dot(a : number[],b : number[]){
	if(a.length != b.length){
		throw "dot with uneven lengths"; 
	}
	noNaN(arguments as any as any[][]);
	var s = 0; 
	for(var i=0; i<a.length; i++){
		s += a[i] * b[i];
	}
	return s; 
}



export function normalize(v : number[], amt : number=1) : number[]{
	noNaN(arguments as any as any[][]);

	var l =  len(v);
	var out : number[] = [];
	for(var item of v){
		out.push(item /l * amt); 
	}
	return out; 
}

// start at v, end at w
export function move(v: number[], w : number[], dist : number) : number[]{
	noNaN(arguments as any as any[][]);
	var lst: number[] = [];
	if(v.length != w.length){
		throw "move with uneven lengths"; 
	}
	for(var i=0; i < v.length; i++){
		lst.push(w[i] - v[i]);
	}
	if(len(lst) < dist){
		return JSON.parse(JSON.stringify(w)) as number[];
	} else {
		lst = normalize(lst, dist);
		for(var i=0; i < v.length; i++){
			lst[i] += v[i];
		}		
		return lst
	}
}
// x = left/right, y = up/down, z = forwards/backwards
// lat/long starts at right (1,0,0) and lat goes up (positive y), long goes forwards (positive z) 
export function latlong_to_xyz(lat : number, long : number){
	let r = Math.cos(lat);
	let y = Math.sin(lat);
	let x = Math.cos(long)*r;
	let z = Math.sin(long)*r;
	return [x,y,z]; 
}

// positive z is prime meridian, eastwards (left when facing positive z, with upwards as positive y and right as positive x ) is positive longitude 
export function xyz_to_latlong(x:number , y:number, z:number ){
	let r = Math.sqrt(x*x + y*y + z*z);
	let lat = Math.asin(y / r);
	let long =  Math.atan2(z, x) - Math.PI/2;
	return [lat, long];

}
export function move3d(x :number,y :number,z :number,lat :number,long :number, dist :number) : point3d{
	let [dx,dy,dz] = latlong_to_xyz(lat, long);
	return [x+dx*dist, y+dy*dist, z+dz*dist];
}


export function number_to_hex(n : number) : string {
	noNaN(arguments as any as any[][]);
    if(n == 0){
        return "";
    }
    return number_to_hex(Math.floor(n/16)) + "0123456789abcdef"[n%16] 
}


export function all_choices<T>(x : T[], amt : number) : T[][]{
	if(amt == 0 ){
		return [[]]; 
	}
	if(amt == x.length){
		return [[...x]];
	}
	else {
		let no_take = all_choices(x.slice(1), amt)
		let yes_take = all_choices(x.slice(1), amt-1);
		yes_take.forEach((y) => y.splice(0, 0, x[0]));
		return no_take.concat(yes_take); 
	}
}
export function all_combos<T>(x : T[][]) : T[][]{
	if(arguments.length != 1){ 
		throw "call all_combos with a single list please!";
	}


	var index : number[] = [];
	for(var i=0; i < x.length; i++){
		index.push(0);
		if(!Array.isArray(x[i])){
			throw "call all_combos with array of arrays, not " + x[i].toString(); 
		}
	}
	var carry : (x : number) => boolean = function(i : number){
		if(index[i] >= x[i].length){
			index[i] -= x[i].length;
			if(i != 0){
				index[i-1]++;
				return carry(i-1); 
			} else {
				// stop iteration
				return true; 
			}
		}
		return false; 
	}
	var out : T[][] = []; 
	while(true){
		var new_element: T[] = [];
		for(var i=0; i < x.length; i++){
			new_element.push(x[i][index[i]]);	
		}
		out.push(new_element);
		index[index.length-1]++;
		if(carry(index.length-1) ){
			break; 
		}
	}
	return out; 
}

// top left, top right, bottom right, bottom left
export function rectangle_corners(tl : point, br : point) : point[] {
	return [[tl[0], tl[1]], [br[0], tl[1]], [br[0], br[1]],  [tl[0], br[1]]]
}

// tl's z coord is further away (higher z coordinate)
// returns in order : front, back, top, bottom, left, right
export function rectangular_prism_corners(tl : point3d, br : point3d) : point3d[][]{
	return [ 
	rectangle_corners([tl[0], tl[1]], [br[0], br[1]]).map((x) => [x[0], x[1], br[2]]),

	rectangle_corners([tl[0], tl[1]], [br[0], br[1]]).map((x) => [x[0], x[1], tl[2]]),

	rectangle_corners([tl[0], tl[2]], [br[0], br[2]]).map((x) => [x[0], tl[1], x[1]]),

	rectangle_corners([tl[0], tl[2]], [br[0], br[2]]).map((x) => [x[0], br[1], x[1]]),

	rectangle_corners([tl[1], tl[2]], [br[1], br[2]]).map((x) => [tl[0], x[0], x[1]]),

	rectangle_corners([tl[1], tl[2]], [br[1], br[2]]).map((x) => [br[0], x[0], x[1]])]
}
export function rectangular_prism_centers(tl : point3d, br : point3d) : point3d[]{
	var x_avg = (tl[0] + br[0])/2;
	var y_avg = (tl[1] + br[1])/2;
	var z_avg = (tl[2] + br[2])/2;
	return [
		[x_avg, y_avg, br[2]],
		[x_avg, y_avg, tl[2]],
		[x_avg, tl[1], z_avg],
		[x_avg, br[1], z_avg],
		[tl[0], y_avg, z_avg],
		[br[0], y_avg, z_avg],
	]
}

export function rectangular_prism_edges(tl : point3d, br : point3d) : [point3d, point3d][]{
	let to_point = (x : point3d) => {return [x[0] == 0 ? tl[0] : br [0], x[1] == 0 ? tl[1] : br [1], x[2] == 0 ? tl[2] : br [2]] as point3d}
	var out : [point3d, point3d][] = [];
	var lst= all_combos([[0,1],[0,1],[0,1]]) as point3d[];
	for(var i=0; i<8; i++){
		for(var j=i+1; j<8; j++){
			if(num_diffs(lst[i], lst[j]) == 1){
				out.push([to_point(lst[i]) , to_point(lst[j])]);
			}
		}
	}
	return out
}

// given two points, returns the corners of a rectangular prism that is formed by thickening the line joining the two points
export function lineseg_prism(x1:number,y1:number,z1:number,x2:number,y2:number,z2:number,width:number) : point3d[] {
    var v = [x2-x1, y2-y1, z2-z1]; 
    var w = [-1,-1,-1];
    if(v[0] != 0){
        w = [0,1,1];
    }
    if(v[1] != 0){
        w = [1,0,1];
    }
    if(v[2] != 0) {
        w = [1,1,0];
    }
    if(w[0] == -1){
        throw "line segment but points are the same";
    }
    //v x w is perpendicular to v, then v x (v x w) is another normal
    var n1 = cross(v, w);
    var n2 = cross(v, n1); 
    if(Math.abs(dot(v, n1) + dot(v, n2) + dot(n1, n2)) > 0.001){
        throw "something went wrong with cross products";
    }
    n1 = normalize(n1, width/2);
    n2 = normalize(n2, width/2);
    // the vertices are : ( v1 or v2), (+/-)n1, (+/-) n2, 
    var choices = all_combos([[1, -1], [1, -1], [1, -1]]);
    var out_vertices : point3d[] = [] ; 
    for(var [vc, c1, c2] of choices){
        if(vc == 1){
            var start = [x1,y1,z1];
        } else { 
            var start = [x2, y2, z2]; 
        }
        out_vertices.push(lincomb(1, lincomb(1, start, c1, n1), c2, n2) as point3d); 
    }

    return out_vertices; 
}
export function lineseg_prism3(x : point3d, y : point3d, w : number){
	return lineseg_prism(x[0], x[1], x[2], y[0], y[1], y[2],w);
}

export function project3d(eyex : number, eyey : number, eyez : number, plane : number, px : number, py : number, pz : number ){
	noNaN(arguments as any);
	if(eyez == pz){
		throw "project3d with eye and point on the same z-value"
	}
	var v = [px - eyex, py - eyey, pz - eyez]; 
	var z_dist = plane - eyez;
	// scale v so z-coord is z_dist 
	var scale_factor = z_dist /(pz - eyez); 
	return [v[0] * scale_factor + eyex, v[1] * scale_factor + eyey];
}

export function inverse_project3d(eyex : number, eyey : number, eyez : number, plane : number, px : number, py : number, dist : number ){
	noNaN(arguments as any);
	if(eyez == plane){
		throw "inverse project3d with eye and plane on the same z-value"
	}
	var v = [px - eyex, py - eyey, plane - eyez]; 
	// scale v so z-coord is dist 
	var scale_factor =  dist  / (plane - eyez );
	return [v[0] * scale_factor + eyex, v[1] * scale_factor + eyey, v[2] * scale_factor + eyez];
}
//returns the [a, b] such that if f(x) = ax+b, then f(s0 ) = t0 and f(s1) = t1
export function scale_translate(s0 : number, s1 : number, t0 : number, t1 : number) {
	noNaN(arguments as any);
	if (s0 == s1 || t0 == t1){
		throw "scale_translate with same values "
	}
	var a = (t1-t0) / (s1-s0);
	var b = t0-a * s0;
	return [a,b];
}
export function pointInsideRectangle(px:number , py:number , tlx:number , tly:number , width:number , height:number){
    noNaN(arguments as any);
	if(px < tlx || px > tlx+width || py < tly || py > tly+height){
		return false;
	}
	return true;
}

export function max(x : number[]){
    var m = -Infinity; 
    for(var i of x){
        if(i > m){
            m = i;
        }
    }
    return m; 
}

 export function getIntersection(line1:number[] , line2:number[]){
	// lines are to be in the form of "ax + by = c", the lines are coefficients.
	var a = line1[0] , b = line1[1], c = line2[0], d = line2[1];
	var determinant = a*d-b*c;
	if (Math.abs(determinant) < 0.000001){
		throw "lines are too close to parallel";
	}
	// get the inverse matrix
	var ai = d/determinant, bi = -b/determinant, ci = -c/determinant, di = a/determinant;
	// now multiply
	return [ai * line1[2] + bi * line2[2], 	ci * line1[2] + di * line2[2]];
	
}
//given points (p1, p2), output the a,b,c coefficients that go through them
 export function pointToCoefficients(p1x:number , p1y:number , p2x:number , p2y:number){
	noNaN(arguments as any);
	if (p1x == p2x){ // vertical line
		return [1, 0, p1x]; // x = p1x
	}  else {
		var m = (p2y - p1y) / (p2x - p1x); // slope
		var b = p1y - m*p1x;
		// y = mx + b -> y - mx = b
		return [-m, 1, b];
	}
}

 export function between(x:number ,b1:number , b2:number){ // returns if x is between b1 and b2  (inclusive:number)
    noNaN(arguments as any);
	if (b1 <= x && x <= b2){
		return true;
	}
	if (b1 >= x && x >= b2){
		return true;
	}
	return false
}
// lines are P = (p1x, p1y, p2x, p2y) and Q = (q1x, q1y, q2x, q2y)
// intersection must be between endpoints
 export function doLinesIntersect(p1x:number , p1y:number , p2x:number , p2y:number , q1x:number , q1y:number , q2x:number , q2y:number){
    noNaN(arguments as any);
	
	var line1=pointToCoefficients(p1x, p1y, p2x, p2y);
	var line2=pointToCoefficients(q1x, q1y, q2x, q2y);
	try{
		var intersectionPoint = getIntersection(line1, line2)
	} catch(err){
		if(err == "lines are too close to parallel"){
			return false;
		} else {
			throw err;
		}
	}
	return (between(intersectionPoint[0]  , p1x, p2x) &&
	between(intersectionPoint[0]  , q1x, q2x) &&
	between(intersectionPoint[1]  , p1y, p2y) &&
	between(intersectionPoint[1]  , q1y, q2y));
}
// doLinesIntersect(412, 666, 620 , 434, 689, 675, 421, 514) = true
// doLinesIntersect(412, 666, 620 , 434, 498 ,480 ,431 ,609 ) = false 
// doLinesIntersect(100, 100, 200, 100, 100, 200, 200, 200) = false


export function pointInsidePolygon(x : number, y : number , points : [number, number][]) {
    noNaN(arguments as any);
    var dx = Math.random() + 1;
    var dy = Math.random();
    var max_x = max(points.map((x) => x[0]));
    var line = [x, y, x + dx * max_x, y + dy * max_x] ; 
    var counter = 0; 
    for(var i=0; i < points.length; i++){
        var lst = flatten([line, points[i], i==points.length-1 ? points[0] : points[i+1]]); 
		//@ts-ignore
        if(doLinesIntersect.apply("",lst)){
            counter ++; 
        }
    }
    return counter % 2 == 1
}

// find where a line segment (given by two points) intersects the rectangle. the first point is inside the rectangle and the second point is outside.

 export function getLineEnd(p1x:number , p1y:number , p2x:number , p2y:number , tlx:number , tly:number , width:number ,height:number){
	// ensure p1 is inside and 
	if(!pointInsideRectangle(p1x, p1y, tlx, tly,  width,height)){
		throw "p1 outside of rectangle";
	}
	if(pointInsideRectangle(p2x, p2y, tlx, tly, width,height)){
		throw "p2 inside rectangle";
	}
	//convert the line to ax+by=c
	// a (p2x - p1x) = -b (p2y - p1y)
	var a,b,c
	if(p2y - p1y != 0){ // a is not 0, set a = 1 (use this chart)
	// if a = 0 then b = 0 as well, we have 0 = c, so c = 0. This gives [0,0,0] which is not a point in P^2
	// a (p2x - p1x)/(p2y - p1y) = -b 
		a = 1;
		b = -(p2x - p1x)/(p2y - p1y);
		c = a*p1x + b*p1y ;
	} else {
		//p2y = p1y, so subtracting the equations gives a  = 0/(p2x - p1x) = 0
		// now we are in P^1 with b and c. We are solving by=c in P^1. 
		// so if y = 0 then we have [0,1,0]. Else, we have [0,?,1]
		a = 0;
		if(p2y == 0){
			b = 0;
			c = 0;
		} else{
			c = 1;
			b = c/p2y;
		}
	}
	var lineCoefficients = [a,b,c];
	var topLine = [0, 1, tly];// y = top left y
	var leftLine = [1, 0, tlx] // x = tlx
	var rightLine =[1, 0, tlx+width] // x = tlx+width
	var bottomLine = [0, 1, tly+height];// y = top left y + height
	var lines = [topLine, leftLine, rightLine, bottomLine]
	for(var i=0; i<4; i++){
		var line = lines[i]
		try {
			var intersection = getIntersection(lineCoefficients, line);
			// intersection must be inside the rectangle
			if(pointInsideRectangle(intersection[0], intersection[1],  tlx, tly,  width,height)){
			// and must also be in the correct direction of the second line:
				if((intersection[0] - p1x) * (p2x-p1x) + (intersection[1] - p1y) * (p2y-p1y) >= 0){
					return intersection;
				}
			}
		}catch (e){
			if(e == "lines are too close to parallel"){
				;
			} else {
				throw e;
			}
		}
	}
}

 export function testCases(){
	//getLineEnd(p1x, p1y, p2x, p2y, tlx, tly, height, width){
	console.log("This should be 5,5")
	console.log(getLineEnd(0,0,100,100,-10,-5,20,10)); // output should be 5,5, line is [1,-1,0]	
	
	console.log("This should be 166.216, 390")
	console.log(getLineEnd(159.1,337.34,207.9,689.46,133,260,150,130)); // output should be 166.216, 390, line is [3.7,-0.5,420]

	
	console.log("This should be 207.407, 260")
	console.log(getLineEnd(242,291.133,80,145.333,133,260,150,130)); // output should be 207.407, 260, line is [2.7,-3,-220]
	
	
	console.log("This should be 283, 328.033")
	console.log(getLineEnd(242,291.133,445, 473.833,133,260,150,130)); // output should be 283, 328.033, line is [2.7,-3,-220]  
	
	console.log("This should be 174, 390 (vertical line)")
	console.log(getLineEnd(174 ,300,174, 600,133,260,150,130)); // output should be 174, 390, line is [1,0,174] 
	
	
	console.log("This should be 133, 290 (horizontal line)")
	console.log(getLineEnd(211 ,290,1, 290,133,260,150,130)); // output should be 133, 290, line is [0,1,290] 
	
	console.log("all done")
}

	// given the coordinates of the top left (x and y smallest) corner of a rectangle, and its width and height, find the coordinates of the others. 
	// angle is  : look at rectangle's right, how much do you have to turn to look straight right?

	// the same as the other one : (positive x) is 0, and for angles close to 0, increasing is positive y. 
	
	//note this is different from the angle that angleToRadians returns. To convert from angleToRadians to our angle, add pi/2
	
	// returns the corners in a cyclic order. 
 export function corners(tlx:number , tly:number , width:number , height:number , angle:number) {
	//console.log([tlx, tly, width, height, angle]);
		var cornersLst = [[tlx, tly]]
		// travel "rightward" (width) units along (angle)
		cornersLst.push([cornersLst [0][0]+ width * Math.cos(angle), cornersLst[0][1] + width * Math.sin(angle)])
		
		//travel "upwards" (height) units along angle- 90 degrees
		cornersLst.push([cornersLst[1][0] + height * Math.cos(angle + Math.PI / 2), cornersLst[1][1]+ height * Math.sin(angle + Math.PI / 2)])
		
		//travel "upwards" from the start
		cornersLst.push([cornersLst[0][0] + height * Math.cos(angle + Math.PI / 2), cornersLst[0][1] + height * Math.sin(angle +Math.PI / 2)])
		
		
		return cornersLst
	}
	
