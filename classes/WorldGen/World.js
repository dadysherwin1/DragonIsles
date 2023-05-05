import * as THREE from '../../modules/three.module.js';
import { Chunk } from "./Chunk.js";

var areaLength = 800;
var numOfChunks = 10;

class World {

    constructor(scene) {
        for (var i = 0; i < numOfChunks; i++) {
            var posX = Math.random() * areaLength - areaLength / 2;
            var posY = Math.random() * areaLength - areaLength / 2;
            var posZ = Math.random() * areaLength - areaLength / 2;
            var pos = new THREE.Vector3(posX, posY, posZ);

            const chunk = this.CreateChunk(pos);
            scene.add(chunk.model);
        }
    }

    CreateChunk(pos) {
        return new Chunk(pos);
    }
}

export { World };