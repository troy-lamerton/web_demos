(function () {

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();
    var selectedChannel = 0;
    var logi = 0;
    var effect = (function () {
        var node = audioContext.createScriptProcessor(0, 2, 2);
        console.log('audio node processor', node);

        node.addEventListener('audioprocess', function (e) {
            var input = e.inputBuffer.getChannelData(selectedChannel);
            var outputL = e.outputBuffer.getChannelData(0);
            var outputR = e.outputBuffer.getChannelData(1);
            if (logi++ % 120 == 0) {
                console.log('audioprocess the input samples', e);
            }
            for (var i = 0; i < outputR.length; i++) {
                outputL[i] = selectedChannel == 0 ? input[i] : 0.0;
                outputR[i] = selectedChannel == 1 ? input[i] : 0.0;
            }
        });

        return node;
    })();


    var streamAttached = false;

    function attachStream(video) {
        if (streamAttached) {
            return;
        }
        var source = audioContext.createMediaElementSource(video);
        source.connect(effect);
        effect.connect(audioContext.destination);
        console.log('stream was attached ' + !video.paused)
        streamAttached = true;
    }

    console.log();

    var needtouch = false;

    const vid = document.getElementById('vid');
    vid.addEventListener('play', function (e) {
        console.log('onplay lets attach', !e.currentTarget.paused);
        if (streamAttached) {
            console.log('resume')
            audioContext.resume()
        }
        attachStream(vid);

    });
    vid.addEventListener('pause', function (e) {
        console.log('suspend!!')
        audioContext.suspend()
    });

    vid.addEventListener('loadedmetadata', function () {
        // this.play();
        // this.volume=1.0;
        if (this && this.paused) {
            if (needtouch == false) {
                needtouch = true;
                console.log('need touch attach')
            }
        } else {
            console.log(this, 'should be working, its playing')
        }
    });
    window.panToRight = function () {
        console.log('panToRight')
        selectedChannel = 1;
    };
    window.panToLeft = function () {
        console.log('panToLeft')
        selectedChannel = 0;
    };

})();