// add_controls.js

var chatInput = document.querySelector("#chatInput");
var chatOutput = document.querySelector("#chatOutput");
chatInput.addEventListener('keyup',handleChat);

function handleChat(evt){
    if (evt.keyCode == 13 && chatInput.value.trim() != "") {
        chatOutput.innerHTML += drone.name + ": " + chatInput.value.trim() + '\n';
        chatOutput.scrollTop = chatOutput.scrollHeight;
        drone.message = chatInput.value.trim();
        socket.send(drone);

        drone.message = null;
        chatInput.value = "";
    }
}

var help = true;

var helpBtn = document.querySelector("#help-btn");
var helpDiv = document.querySelector("#help");
var helpClose = document.querySelector("#close");

// close help
helpClose.addEventListener("click", function(){
    helpDiv.style.display = "none";
    help = false;
});

// toggle help
helpBtn.addEventListener("click", function() {
    if (help) {
        helpDiv.style.display = "none";
        help = false;
    } else {
        helpDiv.style.display = "block";
        help = true;
    }
})
