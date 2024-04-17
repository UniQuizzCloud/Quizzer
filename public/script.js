const socket = io();
let room = '';
let userName = '';
const userColors = {};

// Function to join a room
function joinRoom() {
    room = document.getElementById('room-name').value;
    userName = document.getElementById('user-name').value;
    if (room && userName) {
        const userId = generateUniqueId(userName);
        socket.emit('join room', { room, user: userName, id: userId });
        window.location.href = `room.html?room=${room}&name=${encodeURIComponent(userName)}&id=${encodeURIComponent(userId)}`;
    } else {
        alert('Please enter your name and room code.');
    }
}

// Function to create a room
function createRoom() {
    userName = document.getElementById('user-name').value;
    if (userName) {
        const userId = generateUniqueId(userName);
        room = Math.floor(100000 + Math.random() * 900000).toString();
        alert('Your room code is: ' + room);
        socket.emit('join room', { room, user: userName, id: userId });
        window.location.href = `room.html?room=${room}&name=${encodeURIComponent(userName)}&id=${encodeURIComponent(userId)}`;
        io.to(room).emit('system message', `Your room code is ${room}`);
    } else {
        alert('Please enter your name.');
    }
}

// Function to send a message
function sendMessage() {
    let message = document.getElementById('m').value;
    if (message.trim()) {
        const userId = decodeURIComponent(new URLSearchParams(window.location.search).get('id'));
        socket.emit('chat message', { room, msg: message, user: userName, id: userId });
        document.getElementById('m').value = '';
        scrollToBottom();
    }
}

// Receive and display a chat message
socket.on('chat message', (data) => {
    displayMessage(data);
    scrollToBottom();
});

// Load and display past messages
socket.on('load messages', (data) => {
    // Assuming 'data' includes both messages and user details
    data.messages.forEach((msg) => {
        displayMessage(msg);
    });
    data.users.forEach((user) => {
        createUserPills(user.name, '#ccc');  // Using default grey, replace with user.color if available
    });
    scrollToBottom();
});

// Add the username to the chat
function addUserName(userName, color) {
    const nameElement = document.createElement('div');
    nameElement.style.color = color;
    nameElement.textContent = userName.toUpperCase();
    nameElement.classList.add('user-name');
    document.getElementById('messages').appendChild(nameElement);
}

// Add a message to the chat
function addMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('message');
    document.getElementById('messages').appendChild(messageElement);
}

// Scroll the chat messages to the bottom
function scrollToBottom() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Helper function to display a message
function displayMessage(data) {
    // Adjust to check ID instead of just the user name
    if (lastUser !== data.id) {  // Now checking id instead of user
        addUserName(data.user, data.color);  // Display name is still the user's chosen name
        lastUser = data.id;  // Update lastUser to the unique id
    }
    addMessage(data.msg);
}

// Capture the 'Enter' key press to send a message
document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('m');
    inputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();  // Prevent the default action to stop from submitting the form
            sendMessage();
        }
    });
    
    

    // Parse the URL parameters to join the room with unique ID
    const urlParams = new URLSearchParams(window.location.search);
    room = urlParams.get('room');
    userName = decodeURIComponent(urlParams.get('name') || '');
    const userId = decodeURIComponent(urlParams.get('id') || '');
    if (room && userName && userId) {
        socket.emit('join room', { room, user: userName, id: userId });
    }
});

let lastUser = ''; // Keep track of the last user who sent a message

function generateUniqueId(userName) {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${userName}-${timestamp}-${randomNum}`;
}


function addSystemMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('system-message'); // Use the new CSS class
    document.getElementById('messages').appendChild(messageElement);
    scrollToBottom();
}

socket.on('system message', (message) => {
    addSystemMessage(message);
});


// Function to create user pills
function createUserPills(user, color) {
    const userPill = document.createElement('span');
    userPill.id = `pill-${user}`;
    userPill.textContent = user;
    userPill.className = 'user-pill';
    userPill.style.backgroundColor = '#ccc';  // Default grey color
    document.getElementById('user-pills').appendChild(userPill);
}

// Function to update the color of user pills
function updateUserPillColor(user, color) {
    const userPill = document.getElementById(`pill-${user}`);
    if (userPill) {
        userPill.style.backgroundColor = color;
    }
}

// Reset pill color to grey when user stops typing
function resetUserPillColor(user) {
    const userPill = document.getElementById(`pill-${user}`);
    if (userPill) {
        userPill.style.backgroundColor = '#ccc';
    }
}


// Function to send typing status
function sendTypingStatus() {
    socket.emit('typing', { room, user: userName });
}

// Add event listener to input field for typing
document.getElementById('m').addEventListener('input', sendTypingStatus);

// Receive typing status from server
socket.on('user typing', (data) => {
    updateUserPillColor(data.user, data.color);
});

// Reset typing indication after user stops typing
let typingTimeout;
document.getElementById('m').addEventListener('keyup', () => {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stop typing', { room, user: userName });
    }, 1000);  // Resets typing status after 1 second of no keyboard activity
});

socket.on('user stop typing', (data) => {
    resetUserPillColor(data.user);
});
