const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')
const socket = io()

const devicePiexlRatio = window.devicePixelRatio || 1

canvas.width = innerWidth * devicePiexlRatio
canvas.height = innerHeight * devicePiexlRatio

const x = canvas.width / 2
const y = canvas.height / 2

const players = {}
const projectiles = []
const enemies = []
const particles = []

socket.on('updatePlayers', (backendPlayers) => {
  for (const id in backendPlayers) {
    const backendPlayer = backendPlayers[id]
    if (!players[id]) {
      players[id] = new Player({
        x: backendPlayer.x,
        y: backendPlayer.y,
        radius: 10,
        color: backendPlayer.color
      })
    } else {
      gsap.to(players[id], {
        x: backendPlayer.x,
        y: backendPlayer.y,
        duration: 0.015,
        ease: 'linear'
      })
    }
  }
  for (const id in players) {
    if (!backendPlayers[id]) {
      delete players[id]
    }
  }
  console.log(players)
})

let animationId
let score = 0
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for (const id in players) {
    const player = players[id]
    player.draw()
  }
}

animate()


window.addEventListener('keydown', (event) => {
  if (!players[socket.id]) return
  socket.emit("keydown", event.code)
})