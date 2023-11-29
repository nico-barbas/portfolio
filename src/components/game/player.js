import * as THREE from "three";
import { Vector3, Quaternion, Scene, Camera } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { quaternionFromToRotation, toRadians } from "./math/math";

const ROTATION_SPEED = 10;

export class Player {
  planeSpeed = 0;
  planeTurnAngle = 0;
  planeTotalTurnAngle = 0;

  /**
   *
   * @param {Scene} scene
   * @param {Camera} camera
   * @param {*} targetRect
   */
  constructor(scene, camera, targetRect) {
    this.scene = scene;
    this.camera = camera;
    this.targetRect = targetRect;
    this.raycaster = new THREE.Raycaster();

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const cube1 = new THREE.Mesh(cubeGeometry, material);
    const cube2 = new THREE.Mesh(cubeGeometry, material);
    scene.add(cube1, cube2);
    cube1.position.set(0, 10, 0);
    cube2.position.set(0, -10, 0);

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
        this.updateCamera();
        console.log(this.plane);
      },
      function (xhr) {
        console.log(xhr);
      }
    );

    window.addEventListener("keydown", this.beginPlaneMovement.bind(this));
    window.addEventListener("keyup", this.endPlaneMovement.bind(this));
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

  updateSelection() {
    if (!this.plane) {
      return;
    }
    this.planeTotalTurnAngle += this.planeTurnAngle;
    this.updateCamera();
  }

  updateCamera() {
    const dt = 1 / 60;

    console.log(this.plane.up);

    const planeForward = new Vector3(0, 0, -1)
      .applyQuaternion(this.plane.quaternion)
      .normalize();
    const planeUp = new Vector3(0, 1, 0)
      .applyQuaternion(this.plane.quaternion)
      .normalize();

    const newPos = this.plane.position
      .clone()
      .add(planeForward.clone().multiplyScalar(this.planeSpeed * dt * 5));
    const gravityUp = newPos.clone().normalize();
    newPos.copy(gravityUp).multiplyScalar(11);
    this.plane.position.copy(newPos);

    const currentQ = new Quaternion();
    const turnQ = new Quaternion().setFromAxisAngle(
      gravityUp,
      this.planeTotalTurnAngle * dt * 2
    );
    currentQ.multiply(turnQ);
    const q = quaternionFromToRotation(this.plane.up, gravityUp);
    currentQ.multiply(q);
    this.plane.quaternion.copy(currentQ);

    const planeRight = new Vector3(1, 0, 0)
      .applyQuaternion(this.plane.quaternion)
      .normalize();

    const viewDistance = 6;
    const viewHeight = 6;
    const p = new Vector3(
      this.plane.position.x +
        -planeForward.x * viewDistance +
        planeUp.x * viewHeight,
      this.plane.position.y +
        -planeForward.y * viewDistance +
        planeUp.y * viewHeight,
      this.plane.position.z +
        -planeForward.z * viewDistance +
        planeUp.z * viewHeight
    );
    this.camera.position.copy(p);

    const camRotQ = new Quaternion().setFromAxisAngle(
      planeRight,
      toRadians(-60)
    );
    this.camera.quaternion.copy(camRotQ.multiply(currentQ));
  }
}
