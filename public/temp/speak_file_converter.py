import sys
import os.path
import json

names = ['board games.txt', 'bowling.txt', 'circus.txt', 'dancing.txt', 'end.txt', 'escape room.txt', 'garden.txt', 'golf.txt', 'intro.txt', 'library.txt', 'movie.txt', 'museum.txt', 'painting.txt', 'park.txt', 'restaurant.txt', 'rock climbing.txt', 'scenery.txt', 'singing.txt', 'skating.txt', 'grocery store.txt', 'video games.txt', 'zoo.txt']

outobj = {}
for name in names:
    outlst = []
    current = ""
    if(not os.path.exists(name)):
        raise Exception("no file exists")

    with open(name, "r") as f:
        lines = f.read().splitlines()
        lines.append("--END")
        girl_state = None
        for line in lines:
            if(line == "--G" or line == "--N" or line == "--B" or line == "--END"):
                if(len(outlst) != 0):
                    #add to outobj
                    outobj[name.split(".")[0] + {"--G":" good", "--N":" neutral", "--B":" bad", "--END":"end---"}[current]] = outlst
                girl_state = None
                outlst = []                    
                current = line
                outlst += [{"type":"bg", "img":"small_scenes/car.png"}, {"type":"music", "path": "music/"+ "car.mp3"}]
                continue
            if(line[0:2] == "bg"):
                outlst.append({"type":"bg", "img":"small_scenes/"+line[3:]})
                outlst.append({"type":"music", "path":"music/" + line[3:].split(".")[0] + ".mp3"})
                continue
            if(line[0:2] == "fg"):
                key = line[3:].split("|")[0]
                img = line[3:].split("|")[1]
                if(len(img) != 0):
                    outlst.append({"type":"fg", "key":key, "img":img, "x":0, "y":0}) #adjust X and Y if needed.
                else:
                    outlst.append({"type":"fg", "key":key,"x":0, "y":0}) #adjust X and Y if needed.
                continue
            if(line[0:5] == "music"):
                outlst.append({"type":"music", "path":line[6:]})
                continue
            line = line.strip()
            if(len(line) == 0):
                continue
            bd = line.index(" ")
            p1 = line[0:bd]
            p2 = line[bd+1:]
            speaker = None
            if(len(p1) != 3):# someone else talking
                speaker = p1[2:]
                icon_image = p1[2:] + ".png"
            if(len(p1) == 3 and p1[2] != "G"): #player talking or thinking, player portrait 
                if(p1[0] == "N"):
                    icon_image = "neutral2.png"
                
                if(p1[0] == "H"):
                    icon_image = "happy2.png"
                
                if(p1[0] == "S"):
                    icon_image = "sad2.png"
                if(p1[0] == "X"):
                    icon_image = ""
                if(p1[2] == "P"):
                    speaker = "PLAYER_ONE"
                if(p1[2] == "X"):
                    speaker = "PLAYER_ONE (thinking/narrating)"
            if(len(p1) == 3 and p1[2] == "G"): #girl talking
                if(p1[1] == "X"):
                    raise Exception("girl talking but not on scene " + line)
                speaker = "Laura"
                icon_image = "" 
            #check girl state
            if(p1[1] == "X"):
                new_girl_state = None
            else:
                new_girl_state = p1[1]
            if(girl_state != new_girl_state):
                if(new_girl_state == None):
                    outlst.append({"type":"fg", "key":"Laura", "x":300, "y":-50})
                else:
                    img = {"H":"girl happy", "N": "girl neutral", "S" : "girl sad"}[new_girl_state]
                    if(p1[2] == "G"): #girl talking
                        img = img + " 2.png"
                    else:
                        img = img + ".png"
                    outlst.append({"type":"fg", "key":"Laura", "img" : img, "x":300, "y":-50})
            outlst.append({"type":"speaker", "icon_image" :icon_image, "text":p2})
            if(speaker != None):
                outlst[-1]["speaker"] = speaker
            girl_state = new_girl_state
if(".png.mp3" in json.dumps(outobj)):
    raise Exception("png mp3")
print(json.dumps(outobj))
input("")

