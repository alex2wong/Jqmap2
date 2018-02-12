navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;
if(navigator.getUserMedia) {
    navigator.getUserMedia({
        audio: true,
        video: { width: 800, height: 600 }
    },
        function(stream){
            // var rec = new SRecorder(stream);
            // recorder = rec;
            var video = document.querySelector('video');
            video.src = window.URL.createObjectURL(stream);
            video.onloadedmetadata = function(e) {
                video.play();
            };
        }, function(){
            console.error("errorCallbck");
        })
} else {
    document.write("UserMedia not supported");
}
