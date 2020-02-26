window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

audioContext.addEventListener('statechange', e => {
    console.log('audio ctx . statechange:', e.currentTarget.state);
});

const vid = document.getElementById('vid');

let selectedChannel = 0;
let logi = 0;

const effect = (function () {
    var node = audioContext.createScriptProcessor(undefined, 2, 2);
    console.log('audio node processor', node);

    node.addEventListener('audioprocess', function (e) {
        // get input of the Left of Right channel
        var input = e.inputBuffer.getChannelData(selectedChannel);
        // we will put the input into one channel and silence the other with zeros
        var outputL = e.outputBuffer.getChannelData(0);
        var outputR = e.outputBuffer.getChannelData(1);

        if (logi++ % 80 == 0) {
            if (window.cosAudio) {
                window.cosAudio(input);
            }
        }

        for (var i = 0; i < outputR.length; i++) {
            outputL[i] = selectedChannel == 0 ? input[i] : 0.0;
            outputR[i] = selectedChannel == 1 ? input[i] : 0.0;
        }
    });

    return node;
})();


let streamAttached = false;

const source = audioContext.createMediaElementSource(vid);

const attachStream = () => {
    if (streamAttached) {
        return;
    }
    source.connect(effect);
    effect.connect(audioContext.destination);
    console.log('stream was attached ' + !vid.paused)
    streamAttached = true;
};

attachStream(vid);

// playback events
vid.addEventListener('loadedmetadata', function () {
    console.log(this, 'loadedmetadata')
});
vid.addEventListener('play', function (e) {
    console.log('onplay lets attach', !e.currentTarget.paused);
    if (streamAttached) {
        // console.log('resuming audioContext..')
        // audioContext.resume()
    }
});
vid.addEventListener('pause', function (e) {
    console.log('suspending audioContext..')
    audioContext.suspend()
});
vid.addEventListener('ended', function (e) {
    console.warn('video edned.')
    audioContext.suspend()
});

// controls
window.panToRight = function () {
    audioContext.resume();
    console.log('panToRight')
    selectedChannel = 1;
};
window.panToLeft = function () {
    console.log('panToLeft')
    selectedChannel = 0;
};
