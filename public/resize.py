import cv2
import os
for path in "coach.png ringmaster.png instructor.png".split(" "):
    print(path)
    img = cv2.imread(path,cv2.IMREAD_UNCHANGED )
    
    if("ringmaster") in path:
        im2 = cv2.resize(img,None,fx= 0.7, fy=0.7)
    else:
        im2 = cv2.resize(img,None,fx= 0.5, fy=0.5)
    cv2.imwrite("out/" + path, im2)
