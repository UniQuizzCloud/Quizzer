document.getElementById("roomInput").addEventListener("input", function(e) {
    var input = e.target.value;
    // Automatically insert dash after three digits
    if (input.length === 3 && !input.includes('-')) {
        e.target.value = input + '-';
    }
});

document.getElementById("createButton").addEventListener("click", function() {
    var randomCode = Math.floor(100000 + Math.random() * 900000); // 6 digit random number
    var formattedCode = randomCode.toString().substring(0, 3) + "-" + randomCode.toString().substring(3);
    // Display room page
    document.getElementById("joinRoom").style.display = 'none';
    document.getElementById("roomPage").style.display = 'block';
    document.getElementById("roomCode").textContent = formattedCode;
    // Add player's name to the list
    var playerName = document.getElementById("nameInput").value;
    var playerList = document.getElementById("playerList");
    var newPlayer = document.createElement("li");
    newPlayer.textContent = playerName;
    playerList.appendChild(newPlayer);
});

// Implement join room logic similarly
