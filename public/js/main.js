const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const userList = document.getElementById('users')
const roomName = document.getElementById('room-name')

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

console.log(username, room)

const socket = io()

//Join to the chatroom
socket.emit('joinRoom', {username, room})

//receiving a message from server
socket.on('message', msg => {
  appendingMessage(msg)
})

socket.on('roomUsers', ({room, users}) => {
  outputRoom(room)
  outputUsers(users)
})
 
socket.on('user message', msg => {
  appendingMessage(msg)

  chatMessages.scrollTop = chatMessages.scrollHeight
})

chatForm.addEventListener('submit', e => {
  e.preventDefault()

  const msg = e.target.elements.msg.value

  //sending message to the server
  socket.emit('chat message', msg)

  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()


})


function appendingMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p><p class="text">${message.text}</p>`
  document.querySelector('.chat-messages').appendChild(div)
  
}


function outputRoom(room) {
  roomName.innerHTML = room
}

function outputUsers(users) {
  userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join(' ')}`
}