import * as THREE from "three";
import { Vector3, Quaternion, Scene, Camera } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { toRadians } from "./math/math";
import { World } from "./world";

const MAX_POINTS = 500;
const DEBUG_MODE = false;

export class Player {
  /** @type {number} */
  planeSpeed = 0;
  /** @type {number} */
  planeTurnAngle = 0;

  localRight = new Vector3();
  localUp = new Vector3();
  forward = new Vector3();

  /** @type {Waypoint | null} */
  currentWaypoint;
  lineGeometry;

  /**
   *
   * @param {Scene} scene
   * @param {Camera} camera
   * @param {World} camera
   */
  constructor(scene, camera, world) {
    this.scene = scene;
    this.camera = camera;
    this.world = world;

    if (DEBUG_MODE) {
      const dbgGeometry = new THREE.SphereGeometry(2);
      const dbgMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
      });
      this.dbgColliderMesh = new THREE.Mesh(dbgGeometry, dbgMaterial);
      this.scene.add(this.dbgColliderMesh);

      this.lineGeometry = new THREE.BufferGeometry();
      this.lineGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(3 * MAX_POINTS), 3)
      );
      this.lineGeometry.setDrawRange(0, 8);

      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xff0000,
        linewidth: 2,
      });
      const line = new THREE.Line(this.lineGeometry, lineMaterial);
      scene.add(line);
    }

    const loader = new GLTFLoader();

    loader.load(
      "models/plane.glb",
      (gltf) => {
        const s = gltf.scene;
        s.traverse((children) => {
          if (children.type === "Mesh") {
            this.plane = children;
          }
        });
        this.plane.position.set(0, 11, 0);
        this.plane.scale.set(0.5, 0.5, 0.5);
        scene.add(this.plane);
      },
      function (xhr) {
        console.log(xhr);
      }
    );

    window.addEventListener("keydown", this.beginPlaneMovement.bind(this));
    window.addEventListener("keyup", this.endPlaneMovement.bind(this));
    window.addEventListener("keyup", this.handleInteract.bind(this));
  }

  beginPlaneMovement(event) {
    if (event.key === "w") {
      this.planeSpeed = 1;
    } else if (event.key === "a") {
      this.planeTurnAngle = -1;
    } else if (event.key === "d") {
      this.planeTurnAngle = 1;
    }
  }

  endPlaneMovement(event) {
    if (event.key === "w") {
      this.planeSpeed = 0;
    } else if (event.key === "a") {
      this.planeTurnAngle = 0;
    } else if (event.key === "d") {
      this.planeTurnAngle = 0;
    }
  }

  handleInteract(event) {
    if (event.key === "e" && this.currentWaypoint) {
      this.currentWaypoint.openAssociatedProject();
    }
  }

  updateSelection() {
    if (!this.plane) {
      return;
    }

    this.updatePosition();
    this.currentWaypoint = this.world.getCurrentWaypoint(this.plane.position);
  }

  updatePosition() {
    const dt = 1 / 60;

    this.localRight
      .set(1, 0, 0)
      .applyQuaternion(this.plane.quaternion)
      .normalize();
    this.localUp.copy(this.plane.position).normalize();
    this.forward.copy(this.localRight).cross(this.localUp).normalize().negate();

    const newPos = this.plane.position
      .clone()
      .add(this.forward.clone().multiplyScalar(this.planeSpeed * dt * 5))
      .normalize()
      .multiplyScalar(11);
    this.plane.position.copy(newPos);

    const q = new Quaternion().setFromUnitVectors(
      this.localUp,
      newPos.normalize()
    );
    const rotQ = new Quaternion().setFromAxisAngle(
      this.localUp,
      toRadians(this.planeTurnAngle)
    );
    q.multiplyQuaternions(rotQ, q);
    this.plane.quaternion.multiplyQuaternions(q, this.plane.quaternion);

    const viewDistance = 6;
    const viewHeight = 6;
    const p = new Vector3(
      this.plane.position.x +
        -this.forward.x * viewDistance +
        this.localUp.x * viewHeight,
      this.plane.position.y +
        -this.forward.y * viewDistance +
        this.localUp.y * viewHeight,
      this.plane.position.z +
        -this.forward.z * viewDistance +
        this.localUp.z * viewHeight
    );
    this.camera.position.copy(p);

    const camRotQ = new Quaternion().setFromAxisAngle(
      this.localRight,
      toRadians(-60)
    );
    this.camera.quaternion.copy(camRotQ.multiply(this.plane.quaternion));
  }
}
