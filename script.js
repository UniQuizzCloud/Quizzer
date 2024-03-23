document.getElementById("joinButton").addEventListener("click", function() {
    var roomCode = document.getElementById("roomInput").value;
    var playerName = document.getElementById("nameInput").value;

    if (playerName.trim() === '') {
        alert("Please enter your name.");
        return;
    }

    if (roomCode.length !== 7 || roomCode.indexOf('-') !== 3) {
        alert("Please enter a valid room code.");
        return;
    }

    // Here, you would typically make an API call to the server to check if the room exists
    // For now, let's assume it does and move to the room page

    document.getElementById("joinRoom").style.display = 'none';
    document.getElementById("roomPage").style.display = 'block';
    document.getElementById("roomCode").textContent = roomCode;

    var playerList = document.getElementById("playerList");
    var newPlayer = document.createElement("li");
    newPlayer.textContent = playerName;
    playerList.appendChild(newPlayer);

    // In real application, list of players should be fetched from the server
});

document.getElementById("roomInput").addEventListener("input", function(e) {
    var input = e.target.value;
    if (input.length === 3 && !input.includes('-')) {
        e.target.value = input + '-';
    }
});
