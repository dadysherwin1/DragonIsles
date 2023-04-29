import * as THREE from '../../modules/three.module.js';
import { Chunk } from "./Chunk.js";

var areaLength = 500;
var frequency = 10; // the number of islands

class World {

    constructor(scene) {
        // for (var i = 0; i < frequency; i++) {
            const chunk = this.CreateChunk();
            scene.add(chunk.model);
        // }
    }

    CreateChunk() {
        var posX = Math.random() * areaLength - areaLength / 2;
        var posY = Math.random() * areaLength - areaLength / 2;
        var posZ = Math.random() * areaLength - areaLength / 2;
        var pos = new THREE.Vector3(0, 0, 0);
        return new Chunk(pos);
    }
}

export { World };