export class Timer {
  /**
   *
   * @param {number} duration
   */
  constructor(duration) {
    this.duration = duration;
    this.time = 0;
  }

  /**
   *
   * @param {number} dt
   * @returns {boolean}
   */
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
