import cv2
import os
print(os.listdir())

break_ = False
cx=-1
cy=-1
icon_x = 303-216
icon_y = 272-205

def click(event,x,y,flags,param):
    global break_, cx, cy
    if(event== cv2.EVENT_LBUTTONUP):
        break_ = True
        cx=x
        cy=y
cv2.namedWindow('image')
cv2.setMouseCallback('image',click)

for item in os.listdir():
    print(item)
    if(".png" not in item):
        continue
    image = cv2.imread(item)
    cx=-1
    cy=-1
    cv2.imshow("image",image)
    break_ = False
    while(True):
        cv2.waitKey(1)
        if(break_):
            print(item, cx, cy)
            cropped = image[cy : cy + icon_y,cx : cx +icon_x]
            #crop(cx, cy, cx+icon_x, cy+icon_y)
            cv2.imwrite("icons/" + item,cropped)
            break
            
cv2.destroyAllWindows()
