import * as THREE from "three";
import { randFloat } from "three/src/math/MathUtils";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { quaternionFromToRotation, toRadians } from "./math/math";
import { Vector3, Sphere, Quaternion } from "three";
import { Waypoint } from "./waypoint";

const CLOUD_COUNT = 10;
export const WORLD_RADIUS = 10;

/**
 * @typedef {Object} Cloud
 * @property {Vector3} position
 * @property {Vector3} positionOffset
 * @property {Vector3} rotation
 * @property {Vector3} scale
 * @property {Vector3} scaleOffset
 * @property {number} offset
 */

export class World {
  /** @type {Cloud[]} */
  clouds = [];

  /** @type {Waypoint[]} */
  waypoints = [];

  /** @type {THREE.Object3D} */
  dummy = new THREE.Object3D();

  constructor(scene, projects) {
    console.log(projects);

    this.position = new Vector3(0, 0, 0);
    this.cloudInstance = undefined;
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
        model.scale.set(WORLD_RADIUS, WORLD_RADIUS, WORLD_RADIUS);
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

        this.cloudInstance = new THREE.InstancedMesh(
          model.geometry,
          model.material,
          CLOUD_COUNT
        );
        this.cloudInstance.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

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

          this.cloudInstance.setMatrixAt(i, this.dummy.matrix);

          this.clouds.push({
            position: this.dummy.position.clone(),
            positionOffset: this.dummy.position.clone().normalize(),
            rotation: this.dummy.quaternion.clone(),
            scale: this.dummy.scale.clone(),
            scaleOffset: new Vector3(),
            offset: 0,
          });
        }
        scene.add(this.cloudInstance);

        console.log(this.cloudInstance);
      },
      function (xhr) {
        console.log(xhr);
      }
    );

    loader.load("models/flag.glb", (gltf) => {
      const globalUp = new Vector3(0, 1, 0);

      const s = gltf.scene;
      s.traverse((children) => {
        if (children.type === "Mesh") {
          const waypointInstances = new THREE.InstancedMesh(
            children.geometry,
            children.material,
            projects.length
          );
          waypointInstances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

          for (let i = 0; i < projects.length; i += 1) {
            const projectInfo = projects[i];

            this.dummy.position
              .set(projectInfo.x, projectInfo.y, projectInfo.z)
              .normalize()
              .multiplyScalar(WORLD_RADIUS);
            this.dummy.quaternion.setFromUnitVectors(
              globalUp,
              this.dummy.position.clone().normalize()
            );
            this.dummy.scale.set(1, 1, 1);
            this.dummy.updateMatrix();
            console.log(this.dummy);
            waypointInstances.setMatrixAt(i, this.dummy.matrix);
          }
          scene.add(waypointInstances);
        }
      });

      for (let i = 0; i < projects.length; i += 1) {
        const projectInfo = projects[i];

        const project = new Waypoint(
          projectInfo.id,
          projectInfo.x * WORLD_RADIUS,
          projectInfo.y * WORLD_RADIUS,
          projectInfo.z * WORLD_RADIUS
        );
        this.waypoints.push(project);
      }
    });
  }

  updateClouds() {
    if (!this.cloudInstance) {
      return;
    }

    const dt = 1 / 60;
    for (let i = 0; i < CLOUD_COUNT; i += 1) {
      const cloud = this.clouds[i];
      cloud.offset += dt;

      const t = (Math.sin(cloud.offset) + 1) / 2;

      cloud.positionOffset.normalize().multiplyScalar(t);
      cloud.scaleOffset.set(t * 0.1, t * 0.1, t * 0.1);

      this.dummy.position
        .set(0, 0, 0)
        .addVectors(cloud.position, cloud.positionOffset);
      this.dummy.quaternion.copy(cloud.rotation);
      this.dummy.scale.set(0, 0, 0).addVectors(cloud.scale, cloud.scaleOffset);
      this.dummy.updateMatrix();

      this.cloudInstance.setMatrixAt(i, this.dummy.matrix);
    }
    this.cloudInstance.instanceMatrix.needsUpdate = true;
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
