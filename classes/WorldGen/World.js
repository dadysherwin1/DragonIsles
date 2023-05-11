import * as THREE from '../../modules/three.module.js';
import { Dragon } from "../../classes/Dragon.js";
import { Chunk } from "./Chunk.js";

var areaLength = 800;
var numOfChunks = 10;

class World {

    constructor(scene) {
        this.scene = scene;
        this.dragons = [];

        for (var i = 0; i < numOfChunks; i++) {
            var posX = Math.random() * areaLength - areaLength / 2;
            var posY = Math.random() * areaLength - areaLength / 2;
            var posZ = Math.random() * areaLength - areaLength / 2;
            var pos = new THREE.Vector3(posX, posY, posZ);

            const chunk = this.CreateChunk(pos);
            scene.add(chunk.model);

            pos.add(chunk.highestPoint);
            
            var d = new Dragon(scene, pos, 10 + (Math.random()*10));
            this.dragons.push(d);
        }
    }

    CreateChunk(pos) {
        return new Chunk(pos);
    }

    Update() {
        this.dragons.forEach(dragon => {
            dragon.OnUpdate(this.scene);
        });
    }
}

export { World };