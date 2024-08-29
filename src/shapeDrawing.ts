class img_with_center{
	commands : draw_command[];
	x : number;
	y : number;
	img : string;
	constructor(commands : draw_command[], x : number, y : number, width : number, height : number ) {
		this.commands = commands;
		this.x = x;
		this.y = y; 
		this.img = save_image(commands, width, height)
	}
	output(x : number , y : number) : draw_command{
		return {type:"drawImage", x : x-this.x, y:y-this.y, img:this.img};
	}
}

function save_image(commands : draw_command[] , width : number, height : number) : string  {
	var c = document.createElement("canvas");
	c.setAttribute("width", width.toString());
	c.setAttribute("height", height.toString());
	var ctx = c.getContext("2d") ;
	draw(commands, ctx);
	return c.toDataURL('image/png');
}


function draw_roof(x : number, y: number, width: number, height: number, coords : [number, number, boolean][], color : string = "black") :draw_command[] {
	// params are :
	// color (opt) : house color
	
	// draws at coordinates (x + coord[0], y + coord[1]) if not mirrored
	// otherwise, x + width - coord[0], y+  coord[1] if mirrored
	var points_x = coords.map((p) => p[2] ? x + width - p[0] : x + p[0]);
	var points_y = coords.map((p) => y + p[1]);
	number_to_hex(3); 
	return [{"type": "drawPolygon", "points_x": points_x, "points_y": points_y, "color": color}]
	
}
function draw_house(x: number, y: number, width: number, height: number, params : house_draw){
	/*
			params are:
			color (opt) (house color)
			roof (list of roofs) 
			decoration (list of decorations, each is an object with a type)
			
			
			roofs are : 
				type : "triangle" or "list" 

				(triangle)
				height 
				offset_left (opt) (only one that is negative x)
				offset_peak (opt)
				offset_right (opt)
				color 

				(list)
				color
				coords (list of triples : x, y, flip : boolean)

				

			decorations are:
			vertical lines (amount, color, width) 
			horizontal lines (amount, color, width)
			rectangle (x, y, width, height, color)
			rectangle grid (x, y, w)
			grid (x, y, width, height, hbars, vbars, color, bar_width)
			steps (left_offset, right_offse, height, rows, cols, gap_width, gap_height, color, height, amount, color = string or array)
			circle (x, y, radius,color)
			bottom rectangle (x, width, height, color)
			ellipsed door (x, width, height, ellipse_height, color)
			polygon : points (array of points), y (array of points)
	*/
	var s : draw_command[] = []
	s.push({"type": "drawRectangle", "tlx": x, "tly": y, "brx": x+width, "bry": y+height, "color": params.color, "width":1, "fill":true})
	s.push({"type": "drawRectangle", "tlx": x, "tly": y, "brx": x+width, "bry": y+height, "color": params.color, "width":1, "fill":true})
	for (var roof of params.roof) {
		if(roof.type == "triangle"){
			var A = [x-roof.offset_left, x+width/2+roof.offset_peak, x+width+roof.offset_right];
			var B = [y, y -roof.height, y];
			s.push({"type": "drawPolygon", "points_x": A, "points_y":B , "color": roof.color, "width": 1, "fill": true})

		}
		if(roof.type == "list"){
			s=s.concat(draw_roof(x, y, width, height, roof.coords,roof.color)); 
		}
	}
	for(var dec of params.decorations){
		if(dec.type == "vertical lines"){
			var gap = width/(dec.amount + 1);
			s=s.concat(draw_vertical_line_series(x+gap, y, height, gap, dec.amount, dec.color, dec.width));
		}
		else if(dec.type == "horizontal lines"){
			var gap = height/(dec.amount + 1);
			s=s.concat(draw_horizontal_line_series(x, y+gap, width, gap, dec.amount, dec.color, dec.width));
		}
		else if(dec.type == "rectangle"){
			s.push({"type": "drawRectangle", "tlx": x +dec.x, "tly": y+dec.y, "brx": x +dec.x+dec.width, "bry": y+dec.y+dec.height, "color":dec.color, "width": 1, "fill": true})
		}
		else if(dec.type == "rectangle grid"){
			s=s.concat(draw_rectangle_grid( x+dec.x, y + dec.y, dec.width, dec.height, dec.rows, dec.cols, dec.gap_width, dec.gap_height, dec.color));
		}
		else if(dec.type == "grid"){
			var hgap = dec.height / (dec.hbars-1);
			var vgap = dec.width / (dec.vbars-1);
			s=s.concat(draw_vertical_line_series(x + dec.x, y+dec.y, dec.height, vgap, dec.vbars, dec.color, dec.bar_width))
			s=s.concat(draw_horizontal_line_series( x + dec.x, y+dec.y, dec.width, hgap,dec.hbars, dec.color, dec.bar_width))
		}
		else if (dec.type == "steps"){
			var yv = y + height
			var xv_left = x - dec.left_offset
			var xv_right = x + width + dec.right_offset	
			for(var i=0; i < dec.amount; i++){
				var this_color = Array.isArray(dec.color) ? dec.color[i] : dec.color;
				s.push({"type": "drawRectangle", "tlx": xv_left, "tly": yv, "brx": xv_right, "bry": yv+dec.height, "color": this_color , "width": 1, "fill": true})

				xv_left-= dec.left_offset
				xv_right += dec.right_offset
				yv += dec.height
			}
		}
		
		else if(dec.type == "circle"){
			s.push({"type": "drawCircle", "x": x+dec.x, "y": y+dec.y, "r": dec.radius, "color": dec.color, "width": 1, "fill": true})
		}
		else if(dec.type == "bottom rectangle"){
			s.push({"type": "drawRectangle", "tlx": x +dec.x, "tly": y+height-dec.height, "brx": x +dec.x+dec.width, "bry": y+height, "color":dec.color, "width": 1, "fill": true})

		} 
		else if (dec.type == "ellipsed door"){
			s.push({"type": "drawRectangle", "tlx": x +dec.x, "tly": y+height-dec.height, "brx": x +dec.x+dec.width, "bry": y+height, "color":dec.color, "width": 1, "fill": true})
			s.push({"type": "drawEllipseCR", "cx": x + dec.x + dec.width/2, "cy": y + height - dec.height, "rx": dec.width/2, "ry": dec.ellipse_height, "color": dec.color})

		}
		else if(dec.type == "polygon"){
			var x_points :number[]= [];
			var y_points :number[]= [];
			for(var item of dec.points){
				x_points.push(x + item[0])
				y_points.push(y + item[1])
			}
			s.push({"type": "drawPolygon", "points_x": x_points, "points_y": y_points, "color": dec.color, "width":1, "fill": true})
		}

		else {
			console.log("unknown type" + dec)
		}
	}
	return s
}
type point = [number, number]
// x and y are center of the flower circle
function draw_flower(x: number, y: number, stem_points: [point, point, point, point], stem_color : string, flower_params : point3d, petals_color : string, circle_radius : number, circle_color : string):draw_command[] {
// stem_points : a bezier curve , 4 points, each point is list of length 2 , first point is the start point 
//flower_params : size, petals, theta offset
var s : draw_command[] = [];
s.push({"type": "drawBezierCurve", "x": x + stem_points[0][0], "y": y + stem_points[0][1], "p1x": x + stem_points[1][0], "p1y": y + stem_points[1][1], "p2x":x + stem_points[2][0], "p2y": y + stem_points[2][1], "p3x": x + stem_points[3][0], "p3y": y + stem_points[3][1], "color": stem_color , "width": 3})
	s=s.concat(draw_flower_shape( x, y, flower_params[0], flower_params[1] , flower_params[2],petals_color));
	s.push({"type": "drawCircle", "x": x, "y": y , "r":circle_radius, "color": circle_color, "width": 1, "fill": true})
return s;
}

function draw_vertical_line_series( x: number, y: number,height: number, gap: number, amount: number, color : string ="black", width: number=1):draw_command[]{
	var s : draw_command[] = [];
	var xv = x
	for(var i=0; i < amount; i++){
		s.push({"type": "drawLine", "x0": xv, "y0": y, "x1": xv, "y1": y + height, "color": color, "width": width})
		xv += gap;
	};
	return s; 
}

function draw_horizontal_line_series( x: number, y: number,width_: number, gap: number, amount: number, color : string ="black", width : number =1):draw_command[]{
	var s : draw_command[] = [];
	var yv = y
	for(var i=0; i < amount; i++){
		s.push({"type": "drawLine", "x0": x, "y0": yv, "x1": x+width_, "y1": yv, "color": color, "width": width})
		yv += gap;
	};
	return s; 
}

function draw_flower_shape( x: number, y: number, size: number, petals: number, theta_offset: number = 0, color="black"):draw_command[]{
	// x and y are centers of the flower shape
	// each petal is a bezier curve to points with radius = size, and angle determined by number of petals
	var command : drawBezierShape_command = {
		"x" : x,
		"y" : y,
		"type" : "drawBezierShape",
		"curves" : [], 
		"color" : color
	}
	theta_offset = 10;
	for(var i=0; i < petals; i++){
		var t1= (2*Math.PI / petals) * i+theta_offset;
		var t2= (2*Math.PI / petals) * (i+1)+theta_offset; 
		command.curves.push([size * Math.cos(t1) + x, size * Math.sin(t1) + y,size * Math.cos(t2) + x, size * Math.sin(t2) + y, x,y]);
	}
	return [command];
}

function draw_rectangle_grid(x: number, y: number, width: number, height: number, rows: number, cols: number, gapWidth: number, gapHeight: number, color : string ="black"):draw_command[]{
	var s : draw_command[] = [];
	for(var i=0; i < rows; i++){
		for(var j=0; j < cols; j++){
			var xv = x + j*(width + gapWidth);
			var yv = y + i*(height + gapHeight);
			s.push({"type": "drawRectangle2", "tlx": xv, "tly": yv, "width": width, "height": height, "color": color, "widthA": 1, "fill": true})
		}
	}
	return s;
}

declare function QuickHull(points : point[]) : point[];

function lerp(start : number, end : number, t : number) : number {
	return (end - start) * t + start; 
}

function sawtooth(low: number, high: number, period: number, number: number ) : number {
	while(number < 0){
		number += period;
	}
	number = number % period;
	if(number <= period/2){ 
		return lerp(low, high, number/(period/2))
	} else { 
		number -= period/2;
		return lerp(high, low, number/(period/2))
	}
}
// rects are tlx, tly, brx, bry
function draw_rock(top_rect : [number, number, number, number], bottom_rect : [number, number, number, number], top_points : number, bottom_points : number, top_color : string = "white", bottom_color : string = "black", generator : (a : number | string ) => number = (a) => Math.random() ):draw_command[]{
	var rand_counter = 0;
	var top_points_lst : point[]= []; 
	var bottom_points_lst : point[]= [];
	for(var i=0; i < top_points; i++){
		// choose a random point 
		top_points_lst.push([lerp(top_rect[0], top_rect[2], generator(rand_counter)), lerp(top_rect[1], top_rect[3], generator(rand_counter+1))])
		rand_counter += 2; 
	}
	for(var i=0; i < bottom_points; i++){
		// choose a random point 
		bottom_points_lst.push([lerp(bottom_rect[0], bottom_rect[2], generator(rand_counter)), lerp(bottom_rect[1], bottom_rect[3], generator(rand_counter+1))])
		rand_counter += 2; 
	}
	var top_hull = QuickHull(top_points_lst);
	var bottom_hull = QuickHull(top_points_lst.concat(bottom_points_lst));
	
	return [{type:"drawPolygon", "points_x" : bottom_hull.map((x) => x[0]), "points_y" : bottom_hull.map((x) => x[1]), "fill" : true, "color" : bottom_color},{type:"drawPolygon", "points_x" : top_hull.map((x) => x[0]), "points_y" : top_hull.map((x) => x[1]), "fill" : true, "color" : top_color}]; 
}

// angle is programming convention, right is 0, and goes downwards/clockwise (opposite of math convention )
function draw_jagged_circle(x : number, y : number, angle : point, radius : number, deviance : number, points : number, color : string = "black", generator : (a : number | string ) => number = (a) => Math.random()) : draw_command[]{
	// get which angles to put points at 
	var angles : number[] = [];
	var angle_step = (angle[1] - angle[0]) / (points - 1)
	var current_angle = angle[0] ; 
	for(var i=0; i < points; i++){
		angles.push(current_angle); 
		current_angle += angle_step; 
	}
	var rand_counter = 0; 
	var waypoints : point[] = [];
	for(var an_angle of angles){
		var this_radius = radius + deviance * (generator(rand_counter) * 2 - 1);
		waypoints.push([Math.cos(an_angle) * this_radius + x, Math.sin(an_angle) * this_radius + y])
		rand_counter += 1; 	
	}
	return [{type:"drawPolygon", points_x : waypoints.map((x) => x[0]), points_y : waypoints.map((x) => x[1]), color : color, fill : true}]
}

function draw_jagged_rectangle(x : number, y : number, width: number, height : number, waypoints_v : number, waypoints_h : number, jiggle_amt : number, color : string = "black", generator : (a : number | string ) => number = (a) => Math.random()) : draw_command[]{
	// make evenly spaced points, 
	var points : point[] = [];
	var size_h = width / (waypoints_h+1);
	var size_v = height /(waypoints_v+1);
	var current = [x,y];
	points.push([current[0], current[1]])
	for(var i=0; i < waypoints_h + 1; i++){
		current[0] += size_h;
		points.push([current[0], current[1]])
	}
	for(var i=0; i < waypoints_v + 1; i++){
		current[1] += size_v;
		points.push([current[0], current[1]])
	}
	for(var i=0; i < waypoints_h + 1; i++){
		current[0] -= size_h;
		points.push([current[0], current[1]])
	}
	for(var i=0; i < waypoints_v + 1; i++){
		current[1] -= size_v;
		points.push([current[0], current[1]])
	}
	jiggle_points(points, jiggle_amt, jiggle_amt, generator);

	return [{type:"drawPolygon", 'points_x' : points.map((x) => x[0]), points_y : points.map((x) => x[1]), color : color, fill :  true}]
//	return points.map((x) => {return {type:"drawCircle", x:x[0], y:x[1], r:3, color:color,fill:true} }) ;
} 

function rescale_polygon(polygon :drawPolygon_command, x : number, y : number, x_scale : number, y_scale : number) : void { 
	polygon.points_x = polygon.points_x.map((poly_x) => x_scale * (poly_x - x) + x ); 
	polygon.points_y = polygon.points_y.map((poly_y) => y_scale * (poly_y - y) + y ); 
}

function move_point_inside(point : point, rect  : [number, number, number,number]) : void {
	if(point[0] < rect[0]){
		point[0] = rect[0];
	}
	if(point[0] > rect[2]){
		point[0] = rect[2];
	}
	if(point[1] < rect[1]){
		point[1] = rect[1];
	}
	if(point[1] > rect[3]){
		point[1] = rect[3];
	}
}

//tlx, tly, brx, bry
function evenly_spread_points(rect : [number, number, number, number] , amount_x : number,amount_y:number,centered : boolean = false) : point[] { 
	var points : point[] = [];

	for(var i=0; i < amount_x; i++){
		for(var j=0; j < amount_y; j++){
			points.push([lerp(rect[0], rect[2], (i + (centered ? 0.5 : 0))/(centered ? amount_x : amount_x-1)),lerp(rect[1], rect[3], (j + (centered ? 0.5 : 0))/(centered ? amount_y : amount_y-1))])
		}
	}
	return points;
}

function evenly_spread_points_line(p1 : point, p2 : point, amt : number) : point[] {
	var dx = p2[0] - p1[0];
	var dy = p2[1] - p1[1];
	var out : point[] = [];
	var [x, y] = p1; 
	for(var i=0; i < amt; i++){
		out.push([x + dx *i/ (amt-1), y + dy*i / (amt-1)]);
	}
	return out; 
}

function jiggle_points(points : point[], x_amount : number, y_amount : number, generator : (a : number | string ) => number = (a) => Math.random()) : void{
	for(var i=0; i < points.length; i++){
		points[i][0] += generator(2*i) * 2 * x_amount - x_amount; 
		points[i][1] += generator(2*i+1) * 2 * y_amount - y_amount; 
	}
}

function move_points(points :  [number, number][], x_amount : number, y_amount : number) : void { 
	for(var i=0; i < points.length; i++){
		points[i][0] += x_amount;
		points[i][1] += y_amount;
 	}
}



function point_in_circle(x : number, y : number, r : number, generator : (a : number | string ) => number = (a) => Math.random() ) : point{
	var tries = 0; 
	while(true){
		var xval = 2*(generator(tries)-0.5); 
		tries++;
		var yval = 2*(generator(tries)-0.5); 
		tries++;
		if(xval*xval + yval*yval < 1){
			break;
		}
		if(tries > 100){
			throw "too many tries";
		}
	}
	return [x + r*xval, y + r*yval];
}

function draw_soil(x : number, y : number, width : number, height : number,  worms_x  : number,worms_y  : number , worms_radius : number, soil_color : string = "#331111", worms_color : string = "#666600", worms_thickness : number = 2,generator : (a : number | string ) => number = (a) => Math.random()) : draw_command[]{
	var worms = draw_jagged_rectangle(x, y, width,height,10,10,6, soil_color, generator);
	var rect :[number,number,number,number]= [x,y,x+width,y+height];
	var centers = evenly_spread_points(rect, worms_x, worms_y,true);  
	var i=0; 
	for(var center of centers){
		// choose 3 points in the circle,  
		var points: point[] = [] ;  
		for(var j=0; j<3; j++){
			points.push(point_in_circle(center[0], center[1], worms_radius, (a : string | number) => generator("worm circle " + i + " " + j + " " + a)))
		}
		for(var j=0; j<3; j++){
			move_point_inside(points[j], rect); 
		}
		worms.push({type:"drawBezierCurve", "color":worms_color, "p1x":points[0][0], "p1y" : points[0][1],"p2x":points[1][0], "p2y": points[1][1],"p3x":points[2][0], "p3y": points[2][1] , "x" : center[0], y : center[1],width:worms_thickness})
		i++;
	}

	return worms;
}

function flatten<T>(lst : T[][]) : T[] {
	var x  : T[] = [];
	for(var item of lst){
		for(var item2 of item){
			x.push(item2);
		}
	}
	return x;
}

function point_to_bezier(x : point) : bezier{
	return [x[0], x[1], x[0], x[1], x[0], x[1]]
}
function point3_to_bezier(x : point, y : point, z : point): bezier{
	return [x[0], x[1], y[0], y[1], z[0], z[1]];
}
// WARNING : drawing lots of Bezier curves is VERY slow

function draw_flower_bed(x : number, y : number, width : number, height : number, amount_x : number, amount_y : number, jiggle_amount : number ,  flower_width : number, flower_height : number, generator : (a : number | string ) => number = (a) => Math.random(), color_generator : (a : number | string ) => string = (a) => { return ["#ff4444","#ffff44","#44ff44","#4444ff","#44ffff"][Math.floor(Math.random()*5) ]}, size_generator : (a : number | string  ) => number = (a) => Math.random() * 5 + 20 , petals_generator : (a : number | string  ) => number = (a) => Math.floor(Math.random()* 3)+6   ) : draw_command[]{
	var points = evenly_spread_points([x,y,x+width,y+height], amount_x, amount_y,true);
	jiggle_points(points, jiggle_amount,jiggle_amount,(x)=>   generator(x.toString() + " flower jiggle"));
	var flowergen=0;
	return flatten(points.map(function(point){
		flowergen++;
		var stem_points :point[] = [[0,0]];
		// flip a coin, if heads, move left, if tails, move right
		// move amount in each iteration is [0,flower_width/6], flower_height/3
		var coinflip = generator("coin flip " + flowergen) < 0.5;
		var point_c = [0,0];
		for(var i=0; i<3; i++){
			var dx = (coinflip ? 1 : -1)*generator("move flower " + flowergen + " " + i)*flower_width/6;
			var dy = flower_height/3;
			point_c[0] += dx;
			point_c[1] += dy;
			stem_points.push([point_c[0], point_c[1]]);
		}
		var size = size_generator(flowergen + " size gen");
		var color1 = color_generator(flowergen + " color gens ");
		var color2 = "";
		while(color2 == "" || color2 == color1){
			color2 = color_generator(flowergen + " color gens2 ")
		}
 		var flower = draw_flower(point[0], point[1]-flower_height, stem_points as [point,point,point,point], "green",[size, petals_generator(flowergen + " petals gen"), 0],color1,size/3.5, color2 )
		return flower
	}));
}



function draw_grass(x : number, y : number, width : number, height : number, spread : number ) : drawBezierShape_command {
    var points1  : point[] = [[-width/2, 0], [-width/2 * 2/3, -height* 1/3], [-width/2 * 1/3, -height * 2/3], [0, -height]]
    var points2 : point[] =  [[width/2, 0], [width/2 * 2/3, -height* 1/3], [width/2 * 1/3, -height * 2/3], [0, -height]]
    var qf = [(Math.random() * 2 - 1) * spread,(Math.random() * 2 - 1) * spread]
    for(var i=1; i != 3; i++){
        points1[i][0] += qf[0]*i/3 * i/3 + qf[1] * i/3;
        points2[i][0] += qf[0]*i/3 * i/3 + qf[1] * i/3;
    }

    var c1 : drawBezierShape_command = {"type": "drawBezierShape", "color": "green","width": 1, "curves" : [[points1[1][0], points1[1][1], points1[2][0], points1[2][1], points1[3][0], points1[3][1]], [points2[2][0], points2[2][1],points2[1][0], points2[1][1],points2[0][0], points2[0][1]]] , "x" : points1[0][0], y : points1[0][1]}
    c1 = displace_command(c1, [x,y]) as drawBezierShape_command;
    return c1
}

function get_color(c : point3d){
    return `rgb(${Math.floor(c[0])},${Math.floor(c[1])},${Math.floor(c[2])})`
}
