import { useEffect, useState } from "react";
import { createContext } from 'react';


var sound_obj : HTMLAudioElement = new Audio(undefined); 
var playing : string | undefined =  undefined;

var playing_sounds : HTMLAudioElement[]= [];
var muted : boolean = false; 

export function play(s : string){
    if(!muted){
        var sound = new Audio(s);
        sound.play();
        playing_sounds.push(sound);
    }    
}

export function toggleMute(){
    console.log(muted); 
    muted = !muted
    if(muted){
        for(var sound_it of playing_sounds){
            sound_it.pause(); 
        }
        sound_obj.pause();
    } else {
        sound_obj.play();
    }

}

export function change_music(s : string | undefined){
    sound_obj.pause(); 
    sound_obj = new Audio(s);
    sound_obj.loop = true;
    if(!muted){
        sound_obj.play();
    }
    playing = s;
}

export function get_music(){
    return playing;
}

export function getMuted(){
    return muted; 
}

