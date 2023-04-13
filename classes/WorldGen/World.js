import * as THREE from '../../modules/three.module.js';
import { Island } from "./Island.js";

var areaLength = 500;
var frequency = 10; // the number of islands

class World {

    constructor(scene) {
        for (var i = 0; i < frequency; i++) {
            const island = this.CreateIsland();
            scene.add(island.top); // grass
            scene.add(island.bottom); // rock
        }
    }

    CreateIsland() {
        var posX = Math.random() * areaLength - areaLength / 2;
        var posY = Math.random() * areaLength - areaLength / 2;
        var posZ = Math.random() * areaLength - areaLength / 2;
        var pos = new THREE.Vector3(posX, posY, posZ);
        return new Island(pos);
    }
}

export { World };