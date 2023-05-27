import * as THREE from '../../modules/three.module.js';

class FlowerBed{
    static startingTime = Date.now();
    static material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            swaySpeed: { value: 0.0014 },
            texturee: { type: "t", value: new THREE.TextureLoader().load("../../assets/grass/vegetation.png") }, // not a typo
        },
        vertexShader: document.getElementById('vertexShaderBillboard').textContent,
        fragmentShader: document.getElementById('fragmentShaderBillboard').textContent,
        transparent: true,
    });

    constructor(pos){
        this.model = new THREE.Object3D();

        var geometry = new THREE.PlaneGeometry( 3,4 );
        var obj = new THREE.Mesh( geometry, FlowerBed.material );
        obj.position.x = pos.x;
        obj.position.y = pos.y + 1.5;//same pos
        obj.position.z = pos.z;
        this.model.add(obj);
    }

    static OnUpdate() {
        // for swaying
        FlowerBed.material.needsUpdate = true;
        FlowerBed.material.uniforms.time.value = Date.now() - FlowerBed.startingTime;
    }
}

export {FlowerBed};