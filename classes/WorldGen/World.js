import * as THREE from '../../modules/three.module.js';
import { Dragon } from "../../classes/Dragon.js";
import { Chunk } from "./Chunk.js";

var areaLength = 600;
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
            
            // var dragonPos = chunk.highestPoint.add(new THREE.Vector3(0,5,0));
            // var d = new Dragon(scene, dragonPos, 10 + (Math.random()*10), true);
            var d = new Dragon(scene, chunk.boundingSphere.center, chunk.boundingSphere.radius, true);
            this.dragons.push(d);
        }

        // skybox
        const loader = new THREE.CubeTextureLoader();
        loader.setPath('assets/skybox/');

        const textureCube = loader.load([
            'Daylight Box_Front.png',   'Daylight Box_Back.png',
            'Daylight Box_Top.png',     'Daylight Box_Bottom.png',
            'Daylight Box_Left.png',    'Daylight Box_Right.png'
        ])

        scene.background = textureCube;
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