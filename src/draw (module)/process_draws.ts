import { drawImage, drawPolygon, drawBezierCurve, drawBezierShape, drawRoundedRectangle, drawLine, drawCircle, drawEllipse, drawEllipse2, drawEllipseCR, drawRectangle, drawRectangle2, drawText } from "./canvasDrawing";
import { draw_command } from "./draw_commands"; 

export function draw(lst : draw_command[], c: CanvasRenderingContext2D){
    for (let item of lst){
        switch(item.type){
            case "drawImage":
                drawImage(c, item.img,item.x,item.y);
            break;
            case "drawLine":
                drawLine(c, item.x0,item.y0,item.x1,item.y1,item.color,item.width);
            break;
            case "drawCircle":
                drawCircle(c, item.x,item.y,item.r,item.color,item.width,item.fill,item.transparency,item.start,item.end);
            break;
            case "drawPolygon":
                drawPolygon(c, item.points_x,item.points_y,item.color,item.width,item.fill,item.transparency);
            break;
            case "drawRectangle":
                drawRectangle(c, item.tlx,item.tly,item.brx,item.bry,item.color,item.width,item.fill,item.transparency);
            break;
            case "drawRectangle2":
                drawRectangle2(c, item.tlx,item.tly,item.width,item.height,item.color,item.widthA,item.fill,item.transparency);
            break;
            case "drawText":
                drawText(c, item.text_,item.x,item.y,item.width,item.color,item.size);
            break;
            case "drawEllipse":
                drawEllipse(c, item.posx,item.posy,item.brx,item.bry,item.color,item.transparency,item.rotate,item.start,item.end);
            break;
            case "drawEllipseCR":
                drawEllipseCR(c, item.cx,item.cy,item.rx,item.ry,item.color,item.transparency,item.rotate,item.start,item.end);
            break;
            case "drawEllipse2":
                drawEllipse2(c, item.posx,item.posy,item.width,item.height,item.color,item.transparency,item.rotate,item.start,item.end);
            break;
            case "drawBezierCurve":
                drawBezierCurve(c, item.x,item.y,item.p1x,item.p1y,item.p2x,item.p2y,item.p3x,item.p3y,item.color,item.width);
            break;
            case "drawBezierShape":
                drawBezierShape(c, item.x,item.y,item.curves,item.color,item.width);
            break;
            case "drawRoundedRectangle":

                drawRoundedRectangle(c, item.x0,item.y0,item.x1,item.y1,item.r1, item.r2,item.cap0, item.cap1, item.color,item.width,item.fill);
            break;

        }
    }
}
