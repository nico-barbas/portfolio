import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { quaternionFromToRotation } from "./math/math";
import { Vector3 } from "three";

export class World {
  constructor(scene) {
    this.position = new Vector3(0, 0, 0);
    this.clouds = [];
    this.cloud = undefined;
    this.cloudMatrix = new THREE.Matrix4();
    this.cloudMatrix.makeRotationZ(0.02);

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
        s.traverse((children) => {
          if (children.type === "Mesh") {
            this.cloud = children;
          }
        });

        this.cloud.position.set(0, 12, 0);
        scene.add(this.cloud);

        console.log(this.cloud);
      },
      function (xhr) {
        console.log(xhr);
      }
    );
  }

  updateClouds() {
    if (!this.cloud) {
      return;
    }
    this.cloud.position.applyMatrix4(this.cloudMatrix);

    const cloudUp = this.cloud.position.clone().normalize();
    const q = quaternionFromToRotation(new Vector3(0, 1, 0), cloudUp);
    this.cloud.quaternion.copy(q);
  }
}
