const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = innerWidth * devicePixelRatio
canvas.height = innerHeight * devicePixelRatio

const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {}

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
        // for all other players

        gsap.to(frontEndPlayers[id], {
          x: backEndPlayer.x,
          y: backEndPlayer.y,
          duration: 0.015,
          ease: 'linear'
        })
      }
    }
  }
  camera.followPlayer(frontEndPlayers[socket.id]);

  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      delete frontEndPlayers[id]
    }
  }
  document.getElementById("player-count").innerHTML = Object.keys(frontEndPlayers).length
})


const backgroundImage = new Image();
backgroundImage.src = '/asset/movement-control.png';
backgroundImage.onload = function () {
  animate(); // Start the animation loop after the image has loaded
};

const stars = [];

function generateStars() {
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvas.width / 2 * 5;
    const y = Math.random() * canvas.height / 2 * 5;
    const radius = Math.random() * 3;
    const color = '#ffffff';

    stars.push(new Star(x, y, radius, color));
  }
}


let animationId
function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = 'rgba(0, 0, 0, 0.1)';
  c.fillRect(0, 0, canvas.width, canvas.height);


  // Apply camera translation
  c.translate(-camera.x, -camera.y);
  // Draw stars
  stars.forEach((star) => {
    star.update();
  });
  c.drawImage(backgroundImage, 0, 0, 250, 100);

  for (const id in frontEndPlayers) {
    const frontEndPlayer = frontEndPlayers[id];
    frontEndPlayer.draw();
  }

  // Reset the translation
  c.translate(camera.x, camera.y);
}

generateStars()
animate()

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

const SPEED = 10
const playerInputs = []
let sequenceNumber = 0
setInterval(() => {
  if (keys.w.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED })
    frontEndPlayers[socket.id].y -= SPEED
    socket.emit('keydown', { keycode: 'KeyW', sequenceNumber })
  }

  if (keys.a.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 })
    frontEndPlayers[socket.id].x -= SPEED
    socket.emit('keydown', { keycode: 'KeyA', sequenceNumber })
  }

  if (keys.s.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED })
    frontEndPlayers[socket.id].y += SPEED
    socket.emit('keydown', { keycode: 'KeyS', sequenceNumber })
  }

  if (keys.d.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 })
    frontEndPlayers[socket.id].x += SPEED
    socket.emit('keydown', { keycode: 'KeyD', sequenceNumber })
  }
}, 15)

window.addEventListener('keydown', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = true
      break

    case 'KeyA':
      keys.a.pressed = true
      break

    case 'KeyS':
      keys.s.pressed = true
      break

    case 'KeyD':
      keys.d.pressed = true
      break
    case 'Space':
      UIkit.modal("#my-id").show();;
  }
})

window.addEventListener('keyup', (event) => {
  if (!frontEndPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = false
      break

    case 'KeyA':
      keys.a.pressed = false
      break

    case 'KeyS':
      keys.s.pressed = false
      break

    case 'KeyD':
      keys.d.pressed = false
      break
  }
})