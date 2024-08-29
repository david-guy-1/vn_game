import cv2
import os
for path in os.listdir(os.getcwd()):
    try:
        print(path)
        img = cv2.imread(path,cv2.IMREAD_UNCHANGED )
        im2 = cv2.resize(img,None,fx= 0.5, fy=0.5)
        cv2.imwrite("out/" + path, im2)
    except cv2.error:
        pass
