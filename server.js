const express = require('express')
const http = require('http')
const app = express()
const path = require('path')
const server = http.createServer(app)
const io = require('socket.io')(server)
const PORT = process.env.PORT || 3000
const formatMessages = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')


app.use(express.static(path.join(__dirname, "public")))

const botAdmin = 'ChatUz botAdmin'



io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    socket.emit('message', formatMessages(botAdmin, `${user.username}, welcome to chat.uz`))

    socket.broadcast.to(user.room).emit('message', formatMessages(botAdmin, `${user.username} has joined to the chat`))


    //sending users and room list to client side
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })


    socket.on('disconnect', () => {
      const user = userLeave(socket.id)

      if (user) {
        io.to(user.room).emit('message', formatMessages(botAdmin, `${user.username} has left the chat`))
      }

      //sending users and room list to client side
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    })
  })


  //Listening for chat message from frontend
  socket.on('chat message', (msg) => {
    const user = getCurrentUser(socket.id)

    io.to(user.room).emit('user message', formatMessages(user.username, msg))
  })
})



server.listen(PORT, () => console.log(`Server running port on ${PORT}`))