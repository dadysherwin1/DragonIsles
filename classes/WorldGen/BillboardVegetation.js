import * as THREE from '../../modules/three.module.js';

class BillboardVegetation {
    static startingTime = Date.now();
    static material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            swaySpeed: { value: 0.0014 },
            texturee: { type: "t", value: new THREE.TextureLoader().load("../../assets/grass/vegetation.png") }, // not a typo
            lightPercentage: { value: 0.0 },
        },
        vertexShader: document.getElementById('vertexShaderBillboard').textContent,
        fragmentShader: document.getElementById('fragmentShaderBillboard').textContent,
        transparent: true,
    });
    static swaySpeed;

    static SetVegetationSettings(vegetationSettings) {
        BillboardVegetation.swaySpeed = vegetationSettings.grassSwaySpeed
    }

    constructor(pos){
        this.model = new THREE.Object3D();
        const size = Math.random() * 2 + 2 
        var geometry = new THREE.PlaneGeometry( size, size*1.3 );
        var obj = new THREE.Mesh( geometry, BillboardVegetation.material );
        obj.position.x = pos.x;
        obj.position.y = pos.y + 1.5;//same pos
        obj.position.z = pos.z;
        this.model.castShadow = true;
        this.model.add(obj);
    }

    static OnUpdate(camera) {
        // for swaying
        BillboardVegetation.material.needsUpdate = true;
        BillboardVegetation.material.uniforms.time.value = (Date.now() - BillboardVegetation.startingTime) * BillboardVegetation.swaySpeed;

        var normal = new THREE.Vector3();
        camera.getWorldDirection(normal);
        normal = normal.multiplyScalar(-1);
        normal = new THREE.Vector2(normal.x, normal.z);
        normal.normalize();

        var lightPercentage = (normal.dot(new THREE.Vector2(.707,.707)) + 1.0) / 2.0;
        lightPercentage += 0.5;
        lightPercentage = Math.max(lightPercentage, 0.6);
        // lightPercentage = Math.min(lightPercentage, 1.2);
        // var lightPercentage = normal.dot(new THREE.Vector2(.707,.707)) + 1.3;
        // lightPercentage = Math.min(lightPercentage, 1.0);
        BillboardVegetation.material.uniforms.lightPercentage.value = lightPercentage;
    }
}

export { BillboardVegetation };