import * as THREE from "three";

export class Player {
  constructor(scene, camera, targetRect) {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.normPointerPos = new THREE.Vector2();
    this.targetRect = targetRect;

    window.addEventListener("mousemove", this.onPointerMove.bind(this));
  }

  onPointerMove(event) {
    const x = event.clientX - this.targetRect.x;
    const y = event.clientY - this.targetRect.y;
    this.normPointerPos.x = (x / this.targetRect.width) * 2 - 1;
    this.normPointerPos.y = -(y / this.targetRect.height) * 2 + 1;
  }

  updateSelection() {
    this.raycaster.setFromCamera(this.normPointerPos, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, false);

    if (hits.length > 0) {
      console.log(hits);
    }
  }
}
