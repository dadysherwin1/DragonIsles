
import * as THREE from '../../modules/three.module.js';

class FlowTextLoader{
    static loader = new THREE.TextureLoader().load();
    static material = new THREE.MeshBasicMaterial({
        transparent : true,
        side : THREE.DoubleSided,
        map: new THREE.TextureLoader().load('assets/Flower/Sunflower/Sunflower1.png')
    });
}

export {FlowTextLoader};