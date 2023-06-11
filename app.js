const express = require('express')
const http = require("http")
const { Server } = require("socket.io")

const port = 3000

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const players = {}

io.on(("connection"), (socket) => {
  console.log("user connected")
  players[socket.id] = {
    x: 100 * Math.random(),
    y: 100 * Math.random(),
    color: `hsl(${360 * Math.random()},100%, 50%)`
  }
  io.emit("updatePlayers", players)

  socket.on("disconnect", (reason) => {
    console.log(reason)
    delete players[socket.id]
    io.emit("updatePlayers", players)
  })

  socket.on("keydown", (keyCode) => {
    switch (keyCode) {
      case "KeyW":
        players[socket.id].y -= 30
        console.log("Key w pressed")
        break;
      case "KeyA":
        players[socket.id].x -= 30
        console.log("Key a pressed")
        break;
      case "KeyS":
        players[socket.id].y += 30
        console.log("Key s pressed")
        break;
      case "KeyD":
        players[socket.id].x += 30
        console.log("Key d pressed")
    }
  })
})

setInterval(() => {
  io.emit("updatePlayers", players)
}, 10)



server.listen(port, () => {
  console.log("hello")
})