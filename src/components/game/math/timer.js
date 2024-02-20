export class Timer {
  constructor(duration) {
    this.duration = duration;
    this.time = 0;
  }

  advance(dt) {
    this.time += dt;

    if (this.time >= this.duration) {
      this.time = 0;
      return true;
    }

    return false;
  }

  /**
   * @returns {number}
   */
  normalize() {
    return this.time / this.duration;
  }
}
