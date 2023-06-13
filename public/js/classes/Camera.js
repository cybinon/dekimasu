class Camera {
  constructor(canvas, player, initialZoom) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.player = player;
    this.zoom = initialZoom;
  }

  // Set the camera zoom level
  setZoom(zoom) {
    this.zoom = zoom;
  }

  setPlayer(player) {
    this.player = player
  }
  // Update the camera position based on the player's position
  update() {
    // Calculate the camera position based on the player's position
    const canvasWidth = this.canvas.width / this.zoom;
    const canvasHeight = this.canvas.height / this.zoom;
    if (this.player) return;
    this.x = this.player.x - canvasWidth / 2;
    this.y = this.player.y - canvasHeight / 2;
  }

  // Clear the canvas and draw objects with camera transformations
  draw(objects) {
    const context = this.context;
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    context.save();

    // Apply camera transformations
    context.translate(this.canvas.width / 2, this.canvas.height / 2);
    context.scale(this.zoom, this.zoom);
    context.translate(-this.x, -this.y);

    // Draw objects
    objects.forEach(object => {
      // Draw the object relative to the camera position
      context.fillRect(object.x, object.y, object.width, object.height);
    });

    context.restore();
  }
}