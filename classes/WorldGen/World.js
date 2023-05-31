import * as THREE from '../../modules/three.module.js';
import { Dragon } from "../../classes/Dragon.js";
import { Chunk } from "./Chunk.js";

class World {

    constructor(scene, worldSettings, chunkSettings) {
        this.scene = scene;
        this.dragons = [];
        this.chunks = [];
        
        Chunk.ChangeSettings(chunkSettings);

        for (var i = 0; i < worldSettings.numOfClusters; i++) {
            var posX = Math.random() * worldSettings.worldSize - worldSettings.worldSize / 2;
            var posY = Math.random() * worldSettings.worldSize - worldSettings.worldSize / 2;
            var posZ = Math.random() * worldSettings.worldSize - worldSettings.worldSize / 2;
            var pos = new THREE.Vector3(posX, posY, posZ);

            const chunk = this.CreateChunk(pos);
            scene.add(chunk.model);
            this.chunks.push(chunk);
            
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

    Destroy(scene) {
        this.dragons.forEach(dragon => {
            dragon.ClearBodySegments(scene);
        });
        this.chunks.forEach(chunk => {
            chunk.Destroy(scene);
        });
    }
}

export { World };