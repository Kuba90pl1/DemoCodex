export class InputSystem {
  constructor(domElement) {
    this.domElement = domElement;
    this.keys = new Set();
    this.mouseDelta = { x: 0, y: 0 };
    this.listeners = new Map();

    this.domElement.addEventListener('click', () => this.lock());
    document.addEventListener('pointerlockchange', () => {
      if (!this.isLocked()) {
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
      }
    });

    window.addEventListener('keydown', (event) => this.handleKey(event, true));
    window.addEventListener('keyup', (event) => this.handleKey(event, false));
    window.addEventListener('mousemove', (event) => this.handleMouse(event));
    window.addEventListener('mousedown', (event) => this.handleMouseDown(event));
  }

  lock() {
    this.domElement.requestPointerLock();
  }

  isLocked() {
    return document.pointerLockElement === this.domElement;
  }

  on(action, callback) {
    this.listeners.set(action, callback);
  }

  emit(action) {
    const callback = this.listeners.get(action);
    if (callback) {
      callback();
    }
  }

  handleKey(event, isDown) {
    const key = event.key.toLowerCase();
    if (isDown) {
      this.keys.add(key);
    } else {
      this.keys.delete(key);
    }

    if (!isDown) {
      return;
    }
    if (key === 'v') {
      this.emit('toggleView');
    }
    if (key === 'e') {
      this.emit('interact');
    }
    if (key === 'i') {
      this.emit('inventory');
    }
    if (key === 'escape') {
      this.emit('closeUI');
    }
  }

  handleMouse(event) {
    if (!this.isLocked()) {
      return;
    }
    this.mouseDelta.x += event.movementX;
    this.mouseDelta.y += event.movementY;
  }

  handleMouseDown(event) {
    if (event.button === 0) {
      this.emit('attack');
    }
  }

  getMoveVector() {
    const forward = (this.keys.has('w') ? 1 : 0) - (this.keys.has('s') ? 1 : 0);
    const right = (this.keys.has('d') ? 1 : 0) - (this.keys.has('a') ? 1 : 0);
    return { x: right, y: forward };
  }

  consumeMouseDelta() {
    const delta = { ...this.mouseDelta };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return delta;
  }
}
