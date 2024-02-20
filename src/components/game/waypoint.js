import { Sphere, Vector3 } from "three";

export class Waypoint {
  projectId = 0;
  collider;
  previouslyHit = false;
  hit = false;

  /**
   * @returns {Boolean}
   */
  get justHit() {
    return !this.previouslyHit && this.hit;
  }

  /**
   *
   * @param {Number} id
   * @param {Vector3} position
   */
  constructor(id, x, y, z) {
    this.projectId = id;

    const origin = new Vector3(x, y, z);
    const up = origin.clone().normalize();

    this.collider = new Sphere(origin.add(up.multiplyScalar(0.5)), 2);
  }

  /**
   *
   * @param {Sphere} other
   * @returns {Boolean}
   */
  isColliding(other) {
    this.previouslyHit = this.hit;
    this.hit = this.collider.intersectsSphere(other);
    return this.hit;
  }

  openAssociatedProject() {
    const event = new CustomEvent("projectopened", {
      detail: {
        id: this.projectId,
      },
    });
    window.dispatchEvent(event);
  }
}
