// put this into get_type.py, enter "DONE" (no quotes).
export function noNaN(lst) {
    for (var f of lst) {
        if (typeof (f) == "number" && isNaN(f)) {
            throw "noNaN but is NaN";
        }
        if (Array.isArray(f)) {
            noNaN(f);
        }
    }
}
var imgStrings = {};
export function make_style(ctx, style) {
    if (typeof (style) == "string") {
        return style;
    }
    if (style.type == "fill_linear") {
        var x = ctx.createLinearGradient(style.x0, style.y0, style.x1, style.y1);
    }
    else if (style.type == "fill_radial") {
        var x = ctx.createRadialGradient(style.x0, style.y0, style.r0, style.x1, style.y1, style.r1);
    }
    else if (style.type == "fill_conic") {
        var x = ctx.createConicGradient(style.theta, style.x, style.y);
    }
    else {
        throw "1";
    }
    for (var item of style.colorstops) {
        x.addColorStop(item[0], item[1]);
    }
    return x;
}
export function drawImage(context, img, x, y) {
    if (imgStrings[img] == undefined) {
        return new Promise(function (r, s) {
            var im = new Image();
            im.src = img;
            im.onload = function () {
                if (context != undefined) {
                    context.drawImage(im, x, y);
                }
                imgStrings[img] = im;
                r("");
            };
        });
    }
    else {
        var im = imgStrings[img];
        context.drawImage(im, x, y);
        return new Promise((x, y) => x(""));
    }
}
export function drawLine(context, x0, y0, x1, y1, color = "black", width = 1) {
    noNaN(arguments);
    //	////console.log(x0, y0, x1, y1)
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.stroke();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
}
//draws a circle with the given coordinates (as center) and color
export function drawCircle(context, x, y, r, color = "black", width = 1, fill = false, transparency = 1, start = 0, end = 2 * Math.PI) {
    noNaN(arguments);
    //////console.log(x,y,r)
    context.lineWidth = width;
    context.beginPath();
    context.arc(x, y, r, start, end);
    if (fill) {
        context.globalAlpha = transparency;
        context.fillStyle = make_style(context, color);
        context.fill();
        context.globalAlpha = 1;
    }
    else {
        context.strokeStyle = make_style(context, color);
        context.stroke();
    }
}
export function drawPolygon(context, points_x, points_y, color = "black", width = 1, fill = false, transparency = 1) {
    noNaN(arguments);
    noNaN(points_x);
    noNaN(points_y);
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(points_x[0], points_y[0]);
    for (var i = 1; i < points_x.length; i++) {
        context.lineTo(points_x[i], points_y[i]);
    }
    context.closePath();
    if (fill) {
        context.globalAlpha = transparency;
        context.fillStyle = make_style(context, color);
        context.fill();
        context.globalAlpha = 1;
    }
    else {
        context.strokeStyle = make_style(context, color);
        context.stroke();
    }
}
//draws a rectangle with the given coordinates and color
export function drawRectangle(context, tlx, tly, brx, bry, color = "black", width = 1, fill = false, transparency = 1) {
    noNaN(arguments);
    if (fill) {
        context.globalAlpha = transparency;
        context.fillStyle = make_style(context, color);
        context.fillRect(tlx, tly, brx - tlx, bry - tly);
        context.globalAlpha = 1;
    }
    else {
        context.lineWidth = width;
        context.strokeStyle = make_style(context, color);
        context.beginPath();
        context.rect(tlx, tly, brx - tlx, bry - tly);
        context.stroke();
    }
}
// uses width and height instead of bottom right coordinates
export function drawRectangle2(context, tlx, tly, width, height, color = "black", widthA = 1, fill = false, transparency = 1) {
    noNaN(arguments);
    drawRectangle(context, tlx, tly, tlx + width, tly + height, color, widthA, fill, transparency);
}
// coords are bottom left of text
export function drawText(context, text_, x, y, width = undefined, color = "black", size = 20) {
    noNaN(arguments);
    context.font = size + "px Arial";
    context.fillStyle = color;
    if (width == undefined) {
        context.fillText(text_, x, y);
    }
    else {
        context.fillText(text_, x, y, width);
    }
}
// see drawRectangle
export function drawEllipse(context, posx, posy, brx, bry, color = "black", transparency = 1, rotate = 0, start = 0, end = 2 * Math.PI) {
    noNaN(arguments);
    drawEllipse2(context, posx, posy, brx - posx, bry - posy, color, transparency, rotate, start, end);
}
//draw ellipse with center and radii
export function drawEllipseCR(context, cx, cy, rx, ry, color = "black", transparency = 1, rotate = 0, start = 0, end = 2 * Math.PI) {
    noNaN(arguments);
    drawEllipse2(context, cx - rx, cy - ry, 2 * rx, 2 * ry, color, transparency, rotate, start, end);
}
export function drawEllipse2(context, posx, posy, width, height, color = "black", transparency = 1, rotate = 0, start = 0, end = 2 * Math.PI) {
    noNaN(arguments);
    context.beginPath();
    if (color != "none") {
        context.fillStyle = make_style(context, color);
    }
    context.globalAlpha = transparency;
    context.ellipse(posx + width / 2, posy + height / 2, width / 2, height / 2, rotate, start, end);
    if (color == "none") {
        context.stroke();
    }
    else {
        context.fill();
    }
    context.globalAlpha = 1;
}
export function drawBezierCurve(context, x, y, p1x, p1y, p2x, p2y, p3x, p3y, color = "black", width = 1) {
    noNaN(arguments);
    //	////console.log(x0, y0, x1, y1)
    context.strokeStyle = make_style(context, color);
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(p1x, p1y, p2x, p2y, p3x, p3y);
    context.stroke();
}
export function drawBezierShape(context, x, y, curves, color = "black", width = 1) {
    noNaN(arguments);
    for (var item of curves) {
        noNaN(item);
    }
    // curves are lists of 6 points 
    context.strokeStyle = make_style(context, color);
    context.beginPath();
    context.moveTo(x, y);
    for (let curve of curves) {
        let [a, b, c, d, e, f] = curve;
        context.bezierCurveTo(a, b, c, d, e, f);
    }
    context.closePath();
    context.fillStyle = make_style(context, color);
    context.fill();
}
export function drawRoundedRectangle(context, x0, y0, x1, y1, r1, r2, cap0 = false, cap1 = false, color = "black", width = 1, fill = false) {
    var perp_vector = [y1 - y0, x0 - x1];
    perp_vector = normalize(perp_vector, r1);
    var perp_vector2 = [y1 - y0, x0 - x1];
    perp_vector2 = normalize(perp_vector, r2);
    context.beginPath();
    context.moveTo(x0 + perp_vector[0], y0 + perp_vector[1]);
    context.lineTo(x1 + perp_vector2[0], y1 + perp_vector2[1]);
    var angle = Math.atan2(perp_vector[1], perp_vector[0]);
    // add pi/2 and see if it points in the same direction as p1 -> p0 
    var ccw = Math.cos(angle + Math.PI / 2) * (x0 - x1) + Math.sin(angle + Math.PI / 2) * (y0 - y1) > 0;
    if (cap0) {
        context.lineTo(x1 - perp_vector2[0], y1 - perp_vector2[1]);
    }
    else {
        context.arc(x1, y1, r2, angle, angle + Math.PI, ccw);
    }
    context.lineTo(x0 - perp_vector[0], y0 - perp_vector[1]);
    if (cap0) {
        context.arc(x0, y0, r1, Math.PI + angle, angle, ccw);
    }
    context.closePath();
    if (fill) {
        context.fillStyle = make_style(context, color);
        context.fill();
    }
    else {
        context.strokeStyle = make_style(context, color),
            context.lineWidth = width;
        context.stroke();
    }
}
