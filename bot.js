const { createCanvas } = require("canvas")
const { io } = require("socket.io-client")

const canvas = createCanvas(1080, 1920)
const socket = io("http://localhost:3000")
const frontEndPlayers = {}


class Player {
  constructor({ x, y, radius, color }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    c.beginPath()
    c.arc(
      this.x,
      this.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    )
    c.fillStyle = this.color
    c.fill()
  }
}


const camera = {
  x: 0,
  y: 0,
  followPlayer: function (player) {
    const leftBound = this.x + canvas.width * 0.25;  // Left side of the viewport
    const rightBound = this.x + canvas.width * 0.75; // Right side of the viewport
    const topBound = this.y + canvas.height * 0.25;  // Top side of the viewport
    const bottomBound = this.y + canvas.height * 0.75; // Bottom side of the viewport

    if (player.x < leftBound) {
      this.x = player.x - canvas.width * 0.25;
    } else if (player.x > rightBound) {
      this.x = player.x - canvas.width * 0.75;
    }

    if (player.y < topBound) {
      this.y = player.y - canvas.height * 0.25;
    } else if (player.y > bottomBound) {
      this.y = player.y - canvas.height * 0.75;
    }
  }
};

socket.on('updatePlayers', (backEndPlayers) => {
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id]

    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: 10,
        color: backEndPlayer.color
      })
    } else {
      if (id === socket.id) {
        // if a player already exists
        frontEndPlayers[id].x = backEndPlayer.x
        frontEndPlayers[id].y = backEndPlayer.y

        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backEndPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1)

        playerInputs.forEach((input) => {
          frontEndPlayers[id].x += input.dx
          frontEndPlayers[id].y += input.dy
        })
      } else {
        // for all other player
      }
    }
  }
  camera.followPlayer(frontEndPlayers[socket.id]);

  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      delete frontEndPlayers[id]
    }
  }
})

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

const SPEED = 1
const playerInputs = []
let sequenceNumber = 0
setInterval(() => {
  if (keys.w.pressed) {
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED })
    frontEndPlayers[socket.id].y -= SPEED
    if (frontEndPlayers[socket.id].y > -300) socket.emit('keydown', { keycode: 'KeyW', sequenceNumber })
  }

  if (keys.a.pressed) {
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 })
    frontEndPlayers[socket.id].x -= SPEED
    if (frontEndPlayers[socket.id].x > -300) socket.emit('keydown', { keycode: 'KeyA', sequenceNumber })
  }

  if (keys.s.pressed) {
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED })
    frontEndPlayers[socket.id].y += SPEED
    if (frontEndPlayers[socket.id].y < 300) socket.emit('keydown', { keycode: 'KeyS', sequenceNumber })
  }

  if (keys.d.pressed) {
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 })
    frontEndPlayers[socket.id].x += SPEED
    if (frontEndPlayers[socket.id].x < 300) socket.emit('keydown', { keycode: 'KeyD', sequenceNumber })
  }
}, 15)

let isProcessing = false;
setInterval(() => {
  if (isProcessing) return;
  isProcessing = true;
  keys.w.pressed = !keys.w.pressed
  const keyList = Object.keys(keys);
  keyList.map(key => {
    keys[key].pressed = false;
  })
  const randButton = keyList[Math.floor(Math.random() * 3)];
  keys[randButton].pressed = true;
  return isProcessing = false;
}, 2000)
