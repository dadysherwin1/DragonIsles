import * as THREE from '../../modules/three.module.js';

class FlowerBed{
    static startingTime = Date.now();
    static material;

    static Init() {
        var texture = new THREE.TextureLoader().load("../../assets/grass/vegetation.png");
        // texture.minFilter = THREE.NearestFilter;
        // texture.magFilter = THREE.NearestFilter;

        FlowerBed.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                texturee: { type: "t", value: texture }, // not a typo
            },
            vertexShader: document.getElementById('vertexShaderBillboard').textContent,
            fragmentShader: document.getElementById('fragmentShaderBillboard').textContent,
            transparent: true,
        });
    }

    constructor(pos){
        this.model = new THREE.Object3D();
        this.FlowerBed(pos);
    }

    FlowerBed(pos){
        // var map = new THREE.TextureLoader().load("../../assets/grass/grassColor.png");
        // map.minFilter = THREE.NearestFilter;
        // map.magFilter = THREE.NearestFilter;
        // FlowerBed.material.map = map;
        // const geometry = new THREE.PlaneGeometry( 3,3 );
        // const material = new THREE.MeshBasicMaterial( {map: map, transparent: true, side: THREE.DoubleSide} );
        // const obj = new THREE.Mesh( geometry, material );
        // obj.position.x = pos.x;
        // obj.position.y = pos.y;//same pos
        // obj.position.z = pos.z;
        // this.model.add(obj);

        // const map = new THREE.TextureLoader().load( '../../assets/grass/grassColor.png' );
        // map.minFilter = THREE.NearestFilter;
        // map.magFilter = THREE.NearestFilter;
        // const material = new THREE.SpriteMaterial( { map: map } );
        // const sprite = new THREE.Sprite( material );
        // sprite.position.x = pos.x;
        // sprite.position.y = pos.y + 2.5;
        // sprite.position.z = pos.z;
        // sprite.scale.x = 5;
        // sprite.scale.y = 5;
        // // sprite.scale.z = 3;
        // this.model.add(sprite);

        

        var geometry = new THREE.PlaneGeometry( 3,4 );
        var obj = new THREE.Mesh( geometry, FlowerBed.material );
        obj.position.x = pos.x;
        obj.position.y = pos.y + 1.5;//same pos
        obj.position.z = pos.z;
        this.model.add(obj);

    }

    static OnUpdate() {
        FlowerBed.material.needsUpdate = true;
        FlowerBed.material.uniforms.time.value = Date.now() - FlowerBed.startingTime;
    }
}

export {FlowerBed};