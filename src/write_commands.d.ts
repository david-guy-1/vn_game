type say_command = {
    type : "speaker"
    speaker  ?: string, // name to display at top, fg image moves up if speaker matches fg image's key
    icon_image ?: string, // icon image
    text : string,
}

type bg_command = { // replace background with this
    type : "bg", 
    img : string,
}

type fg_command = { // foreground image, replaces image in "key" with this one
    type : "fg",
    key : string,
    img ?: string,
    x : number,
    y : number
}
type music_command = {
    type : "music",
    path : string 
}
type write_command = say_command | bg_command | fg_command | music_command;
export default write_command;
