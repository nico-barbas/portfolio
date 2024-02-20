import * as THREE from "three";
import { randFloat } from "three/src/math/MathUtils";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { quaternionFromToRotation, toRadians } from "./math/math";
import { Vector3, Sphere, Quaternion } from "three";
import { Waypoint } from "./waypoint";
import { Timer } from "./math/timer";

const CLOUD_COUNT = 10;

/**
 * @typedef {Object} Cloud
 * @property {Timer} timer
 * @property {Number} minScale
 * @property {Number} scaleT
 * @property {Number} positionT
 */

export class World {
  /** @type {Cloud} */
  clouds = [];

  /** @type {Waypoint[]} */
  waypoints = [];

  /** @type {THREE.Object3D} */
  dummy = new THREE.Object3D();

  constructor(scene) {
    this.position = new Vector3(0, 0, 0);
    this.cloud = undefined;
    this.cloudMatrix = new THREE.Matrix4();
    this.cloudMatrix.makeRotationZ(0.02);

    const skyTexture = new THREE.TextureLoader().load("textures/sky.jpg");
    console.log(skyTexture);
    scene.background = skyTexture;

    const loader = new GLTFLoader();

    loader.load(
      "models/planet/planet.glb",
      function (gltf) {
        const model = gltf.scene;
        model.scale.set(10, 10, 10);
        scene.add(model);
      },
      function (xhr) {
        console.log(xhr);
      }
    );

    loader.load(
      "models/planet/cloud.glb",
      (gltf) => {
        const s = gltf.scene;
        let model;
        s.traverse((children) => {
          if (children.type === "Mesh") {
            model = children;
          }
        });

        this.cloud = new THREE.InstancedMesh(
          model.geometry,
          model.material,
          CLOUD_COUNT
        );
        this.cloud.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        const up = new Vector3(0, 1, 0);
        for (let i = 0; i < CLOUD_COUNT; i += 1) {
          this.dummy.position
            .set(randFloat(-1, 1), randFloat(-1, 1), randFloat(-1, 1))
            .normalize();
          const q = new Quaternion()
            .setFromAxisAngle(this.dummy.position, toRadians(randFloat(0, 360)))
            .multiply(quaternionFromToRotation(up, this.dummy.position));
          this.dummy.quaternion.copy(q);

          const scale = randFloat(0, 0.3) + 0.7;
          this.dummy.scale.set(scale, scale, scale);
          this.dummy.position.multiplyScalar(12);
          this.dummy.updateMatrix();

          this.cloud.setMatrixAt(i, this.dummy.matrix);

          this.clouds.push({
            position: this.dummy.position.clone(),
            positionOffset: this.dummy.position.clone().normalize(),
            rotation: this.dummy.quaternion.clone(),
            scale: this.dummy.scale.clone(),
            minScale: scale,
            timer: new Timer(2),
            dir: 1,
            acc: 0,
          });
        }
        scene.add(this.cloud);

        console.log(this.cloud);
      },
      function (xhr) {
        console.log(xhr);
      }
    );

    loader.load("models/flag.glb", (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 10, 0);
      scene.add(model);

      const project = new Waypoint(1, 0, 10, 0);
      const origin = new Vector3(0, 10, 0);
      const min = origin.clone().set(origin.x - 1, origin.y - 1, origin.z - 1);
      const max = origin.clone().set(origin.x + 1, origin.y + 1, origin.z + 1);
      const waypoint = new THREE.Box3(min, max);
      // console.log(waypoint);
      this.waypoints.push(project);
    });
  }

  updateClouds() {
    if (!this.cloud) {
      return;
    }

    const dt = 1 / 60;
    for (let i = 0; i < CLOUD_COUNT; i += 1) {
      const cloud = this.clouds[i];
      if (cloud.timer.advance(dt)) {
        cloud.dir = -cloud.dir;
      }
      cloud.acc += dt;

      cloud.scale.addScalar(dt * 0.2 * cloud.dir);
      cloud.positionOffset.normalize().multiplyScalar(Math.cos(cloud.acc));
      cloud.position.add(cloud.positionOffset);

      // if (i === 0) {
      //   console.log(cloud.positionOffset);
      // }

      this.dummy.position.copy(cloud.position);
      this.dummy.quaternion.copy(cloud.rotation);
      this.dummy.scale.copy(cloud.scale);
      this.dummy.updateMatrix();

      this.cloud.setMatrixAt(i, this.dummy.matrix);
    }
    this.cloud.instanceMatrix.needsUpdate = true;
  }

  /**
   * @param {Vector3} planePosition
   * @returns {Waypoint | null}
   */
  getCurrentWaypoint(planePosition) {
    if (this.waypoints.length === 0) {
      return null;
    }

    const collider = new Sphere(planePosition, 1);
    for (let waypoint of this.waypoints) {
      const hit = waypoint.isColliding(collider);

      if (hit) {
        return waypoint;
      }
    }

    return null;
  }
}
