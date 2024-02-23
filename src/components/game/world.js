import * as THREE from "three";
import { randFloat } from "three/src/math/MathUtils";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { quaternionFromToRotation, toRadians } from "./math/math";
import { Vector3, Sphere, Quaternion } from "three";
import { Waypoint } from "./waypoint";
import { Timer } from "./math/timer";
import { particleSystem } from "./particules";

const CLOUD_COUNT = 10;
export const WORLD_RADIUS = 18;
export const FLY_HEIGHT = WORLD_RADIUS + 2;

/**
 * @typedef {Object} Cloud
 * @property {Vector3} position
 * @property {Vector3} positionOffset
 * @property {Vector3} rotation
 * @property {Vector3} scale
 * @property {Vector3} scaleOffset
 * @property {number} offset
 * @property {Sphere} collider
 * @property {boolean} dispersed
 * @property {Timer} collisionTimer
 */

export class World {
  /** @type {Cloud[]} */
  clouds = [];

  /** @type {Waypoint[]} */
  waypoints = [];

  /** @type {THREE.Object3D} */
  dummy = new THREE.Object3D();

  constructor(scene, projects) {
    this.position = new Vector3(0, 0, 0);
    this.cloudInstance = undefined;
    this.cloudMatrix = new THREE.Matrix4();
    this.cloudMatrix.makeRotationZ(0.02);

    const skyTexture = new THREE.TextureLoader().load("textures/sky.jpg");
    scene.background = skyTexture;

    const loader = new GLTFLoader();

    // loader.load(
    //   "models/planet/planet.glb",
    //   function (gltf) {
    //     const model = gltf.scene;
    //     model.scale.set(WORLD_RADIUS, WORLD_RADIUS, WORLD_RADIUS);
    //     model.receiveShadow = true;
    //     for (let child of model.children) {
    //       child.receiveShadow = true;
    //     }
    //     console.log(model);
    //     scene.add(model);
    //   },
    //   function (xhr) {
    //     console.log(xhr);
    //   }
    // );

    const sphereGeometry = new THREE.SphereGeometry(WORLD_RADIUS, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xd5dd68 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = false;
    sphere.receiveShadow = true;
    scene.add(sphere);

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
        this.cloudInstance.castShadow = true;
        this.cloudInstance.receiveShadow = false;

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
          this.dummy.position.multiplyScalar(FLY_HEIGHT);
          this.dummy.updateMatrix();

          this.cloudInstance.setMatrixAt(i, this.dummy.matrix);

          this.clouds.push({
            position: this.dummy.position.clone(),
            positionOffset: this.dummy.position.clone().normalize(),
            rotation: this.dummy.quaternion.clone(),
            scale: this.dummy.scale.clone(),
            scaleOffset: new Vector3(),
            offset: 0,
            collider: new Sphere(this.dummy.position.clone(), 0.5),
            collisionTimer: new Timer(1),
            dispersed: false,
          });
        }
        scene.add(this.cloudInstance);
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
          waypointInstances.instanceMatrix.setUsage(THREE.StaticDrawUsage);
          waypointInstances.castShadow = true;
          waypointInstances.receiveShadow = true;

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

        if (i > 0) {
          const previousProjectInfo = projects[i - 1];
          this.buildPath(
            scene,
            new Vector3(
              previousProjectInfo.x * WORLD_RADIUS,
              previousProjectInfo.y * WORLD_RADIUS,
              previousProjectInfo.z * WORLD_RADIUS
            ),
            new Vector3(
              projectInfo.x * WORLD_RADIUS,
              projectInfo.y * WORLD_RADIUS,
              projectInfo.z * WORLD_RADIUS
            )
          );
        }
      }
    });
  }

  /**
   *
   * @param {THREE.Scene} scene
   * @param {Vector3} from
   * @param {Vector3} to
   */
  buildPath(scene, from, to) {
    // the frequency and amplitude of the wave are based on distance
    const stepLength = 0.5;
    const waveAmplitude = 0.3;

    const dir = to.clone().sub(from).normalize();
    const steps = from.distanceTo(to) / stepLength;

    const geometry = new THREE.SphereGeometry(0.2, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    for (let i = 0; i < steps; i += 1) {
      const d = dir.clone().multiplyScalar(i * stepLength);

      const indicator = new THREE.Mesh(geometry, material);
      indicator.position.copy(from).add(d).normalize();

      const t = Math.sin((i / steps) * Math.PI * 2);
      const offset = dir
        .clone()
        .cross(indicator.position.clone())
        .normalize()
        .multiplyScalar(t * waveAmplitude);

      indicator.position.add(offset).normalize().multiplyScalar(WORLD_RADIUS);

      indicator.castShadow = true;
      indicator.receiveShadow = true;
      scene.add(indicator);
    }
  }

  /**
   *
   * @param {Vector3} planePosition
   * @returns
   */
  updateClouds(planePosition) {
    if (!this.cloudInstance) {
      return;
    }

    const planeCollider = new Sphere(planePosition, 1);

    const dt = 1 / 60;
    for (let i = 0; i < CLOUD_COUNT; i += 1) {
      const cloud = this.clouds[i];

      if (cloud.dispersed) {
        if (cloud.collisionTimer.advance(dt)) {
          cloud.dispersed = false;
        }
      } else {
        cloud.offset += dt;

        const t = (Math.sin(cloud.offset) + 1) / 2;

        cloud.positionOffset.normalize().multiplyScalar(t);
        cloud.scaleOffset.set(t * 0.1, t * 0.1, t * 0.1);

        this.dummy.position
          .set(0, 0, 0)
          .addVectors(cloud.position, cloud.positionOffset);
        this.dummy.quaternion.copy(cloud.rotation);

        this.dummy.scale.set(0, 0, 0);
        if (cloud.collider.intersectsSphere(planeCollider)) {
          cloud.dispersed = true;

          const u = cloud.position.clone().normalize();
          const f = new Vector3().subVectors(
            u.multiplyScalar(FLY_HEIGHT),
            planePosition.clone().normalize().multiplyScalar(FLY_HEIGHT)
          );
          u.normalize();
          const particleCount = Math.floor(Math.random() * 3 + 3);
          for (let i = 0; i < particleCount; i += 1) {
            const s = Math.random() * 0.1 + 0.1;
            const scale = new Vector3(s, s, s);

            const angle = Math.random() * 80 - 40;
            const q = new Quaternion().setFromAxisAngle(u, toRadians(angle));

            const velocity = f.clone().applyQuaternion(q).multiplyScalar(10);

            particleSystem.addParticle(
              cloud.position,
              velocity,
              scale,
              new THREE.Color(0xffffff),
              1
            );
          }
        } else {
          this.dummy.scale.addVectors(cloud.scale, cloud.scaleOffset);
        }

        this.dummy.updateMatrix();

        this.cloudInstance.setMatrixAt(i, this.dummy.matrix);
      }
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
