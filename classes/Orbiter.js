import * as THREE from '../modules/three.module.js';

class Orbiter {
    constructor(obj, origin, radius) {
        this.object = obj;          // THREE.Object3D
        this.originPos = origin;    // THREE.Vector3
        this.radius = radius;
        this.rotSpeed = 1;
        this.t = Math.random()*360;
        this.clock = new THREE.Clock();
    }

    onUpdate() {
        this.t += this.clock.getDelta();
        this.setObjectPos();
    }

    setObjectPos() {
        var a = this.t*this.rotSpeed;
        this.object.position.x = this.originPos.x + (Math.cos(a)*this.radius);
        this.object.position.z = this.originPos.z + (Math.sin(a)*this.radius);
        this.object.position.y = this.originPos.y;
        this.object.rotation.y = -a -90;
    }
}

export { Orbiter };