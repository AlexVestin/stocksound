


const BASE_VALUE = (5*12) + 1 
export default class SoundPlayer {
    constructor(callback){
        this.context = new AudioContext();
        this.buffers = {}

        this.sample = "synth"
        this.play = this.play.bind(this)
        this.stop = this.stop.bind(this)

        this.cb = callback;
    }

    play(notes){
        this.buffers = []
        let uniques = unique(notes)
        let length = uniques.length, count = 0,fetched = false
        
        if(this.playTimer !== undefined)
            this.playTimer.playSounds = false
        
        this.playTimer = new PlayTimer(this.cb)
        uniques.forEach(note => {
            let val = BASE_VALUE+note
            if(!(val in this.buffers)){
                fetched = true
                fetch(this.sample+"s/"+val+".mp3").then((response) => { return response.blob() })
                .then(response => {
                    let fileReader = new FileReader();
                    fileReader.onloadend = () => {
                        this.context.decodeAudioData(fileReader.result, function(buffer) {
                            this.buffers[val] = buffer
                            if(++count === length)this.playTimer.play(notes, this.buffers, this.context)
                        }.bind(this))
                    }
                    fileReader.readAsArrayBuffer(response);
                })
            }
        })
        if(!fetched)this.playTimer.play(notes, this.buffers, this.context)
    }

    stop(){
        if(this.playTimer !== undefined)
            this.playTimer.playSounds = false
    }
}

function unique(arr) {
    var u = {}, a = [];
    for(var i = 0, l = arr.length; i < l; ++i){
        if(!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
}   

class PlayTimer {
    constructor(callback){
        this.playSounds = true
        this.i = 0
        this.cb = callback
        this.play = this.play.bind(this)
    }

    play(notes, buffers, ctx){
        if(this.playSounds){
            let val = BASE_VALUE+notes[this.i] 
            setTimeout(() => {
                if(this.i <= notes.length){
                    this.cb(this.i)
                    let source = ctx.createBufferSource();
                    source.buffer = buffers[val]
                    source.connect( ctx.destination );
                    source.start(0);
                    this.play(notes, buffers, ctx)
                }
            }, 60 + Math.floor(Math.random() * 200) + this.i++)
        }
    }
}
