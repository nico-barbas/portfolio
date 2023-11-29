import * as THREE from "three";
import { Vector3, Scene, Camera } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { quaternionFromToRotation } from "./math/math";

const ROTATION_SPEED = 10;

export class Player {
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
    this.pointerPos = new THREE.Vector2();
    this.previousPointerPos = new THREE.Vector2();
    this.dragging = false;

    this.worldRotationMat = new THREE.Matrix4();

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
        scene.add(this.plane);

        console.log(this.plane);
      },
      function (xhr) {
        console.log(xhr);
      }
    );
  }

  updateSelection() {
    // this.raycaster.setFromCamera(this.pointerPos, this.camera);
    // const hits = this.raycaster.intersectObjects(this.scene.children, false);

    // if (hits.length > 0) {
    //   console.log(hits);
    // }

    if (!this.plane) {
      return;
    }

    const planeForward = new Vector3(0, 0, -1)
      .applyQuaternion(this.plane.quaternion)
      .normalize();
    const newPos = this.plane.position
      .clone()
      .add(planeForward.clone().multiplyScalar(0.1));
    const gravityUp = newPos.clone().normalize();
    newPos.copy(gravityUp).multiplyScalar(11);
    this.plane.position.copy(newPos);

    const q = quaternionFromToRotation(new Vector3(0, 1, 0), gravityUp);
    this.plane.quaternion.copy(q);

    const p = this.plane.position.clone();
    p.add(planeForward.negate().multiplyScalar(4));
    this.camera.position.copy(p);
    this.camera.lookAt(this.plane.position);
  }
}
