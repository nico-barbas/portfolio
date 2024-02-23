import {
  Object3D,
  Vector3,
  InstancedMesh,
  SphereGeometry,
  MeshStandardMaterial,
  Color,
} from "three";

class ParticleSystem {
  /** @type {Particle[]} */
  particles = [];

  dummy = new Object3D();

  /**
   *
   * @param {number} count
   */
  init(count) {
    const spehere = new SphereGeometry(1, 8, 8);
    const material = new MeshStandardMaterial({ color: 0xffffff });
    this.instances = new InstancedMesh(spehere, material, count);

    for (let i = 0; i < count; i += 1) {
      this.dummy.position.set(0, 0, 0);
      this.dummy.scale.set(0, 0, 0);

      this.dummy.updateMatrix();
      this.instances.setMatrixAt(i, this.dummy.matrix);
    }
  }

  /**
   *
   * @param {number} dt
   */
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i];
      if (particle.advance(dt)) {
        this.dummy.position.set(0, 0, 0);
        this.dummy.scale.set(0, 0, 0);
        this.dummy.updateMatrix();

        this.instances.setMatrixAt(particle.instanceIndex, this.dummy.matrix);
        this.particles.splice(i, 1);
      } else {
        console.log(particle.position);
        this.dummy.position.copy(particle.position);
        this.dummy.scale.copy(particle.scale);
        this.dummy.updateMatrix();
        this.instances.setMatrixAt(particle.instanceIndex, this.dummy.matrix);
      }
    }

    this.instances.instanceMatrix.needsUpdate = true;
  }

  /**
   *
   * @param {Vector3} position
   * @param {Vector3} velocity
   * @param {Vector3} scale
   * @param {Color} color
   * @param {number} duration
   */
  addParticle(position, velocity, scale, color, duration) {
    const particle = new Particle(
      this.particles.length,
      position,
      velocity,
      scale,
      duration
    );
    this.particles.push(particle);
  }
}

class Particle {
  /**
   *
   * @param {number} instanceIndex
   * @param {Vector3} position
   * @param {Vector3} velocity
   * @param {Vector3} scale
   * @param {number} duration
   */
  constructor(instanceIndex, position, velocity, scale, duration) {
    this.time = 0;
    this.duration = duration;
    this.speed = velocity.length();
    this.velocity = velocity.clone();
    this.position = position.clone();
    this.scale = scale.clone();
    this.instanceIndex = instanceIndex;
  }

  /**
   *
   * @param {number} dt
   * @returns {boolean}
   */
  advance(dt) {
    this.time += dt;

    if (this.time >= this.duration) {
      return true;
    }

    this.velocity.multiplyScalar(this.speed * dt);
    this.position.add(this.velocity);
    this.velocity.normalize();

    return false;
  }
}

export const particleSystem = new ParticleSystem();
