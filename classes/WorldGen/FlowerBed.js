import * as THREE from '../../modules/three.module.js';

class FlowerBed{
    constructor(pos){
        this.model = new THREE.Object3D();
        this.FlowerBed(pos);
    }

    FlowerBed(pos){
        
        var translation = new THREE.Matrix4();
        translation.makeTranslation(1, 0, 0);

        var rotation = new THREE.Matrix4();
        rotation.makeRotationY(2*Math.PI/3);

        var flower0 = this.createFlower();
        // flower0.applyMatrix4(translation);
        // var flower1 = this.createFlower();
        // flower1.applyMatrix4(translation);
        // flower1.applyMatrix4(rotation);
        // var flower2 = this.createFlower();
        // flower2.applyMatrix4(translation);
        // flower2.applyMatrix4(rotation);
        // flower2.applyMatrix4(rotation);

        var obj = new THREE.Group();  //adds 
        
        obj.add(flower0);
        // obj.add(flower1);
        // obj.add(flower2);
        obj.position.x = pos.x;
        obj.position.y = pos.y;//same pos
        obj.position.z = pos.z;
        this.model.add(obj);
    }

    createFlower(){
        var leaves = this.createLeaves();
        var stem = this.createStem();
        // var seeds = this.createSeed();
        var flower = new THREE.Group()
        flower.add(leaves);
        flower.add(stem);
        var scale = new THREE.Matrix4();
        scale.makeScale(0.3, 0.3, 0.3);
        flower.applyMatrix4(scale);
        flower.position.y +=2;
        
        return flower;
    }

    createLeaves(){
        var texture = new THREE.TextureLoader().load("../../assets/grass/Sunflower_Front_2.png");
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        // var texture = new THREE.TextureLoader().load("../../assets/grass/test_texture.jpeg");
        // texture.repeat = repeatNum;
        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;

        var sphereMat = new THREE.MeshLambertMaterial({
            map : texture,
            transparent: true
        });
        sphereMat.side = THREE.DoubleSide;
        // sphereMat.wireframe = true;
        sphereMat.color = new THREE.Color(0xfdf35e);
        var spherGeo = new THREE.PlaneGeometry(7,7);
        var sphere = new THREE.Mesh(spherGeo, sphereMat);
        sphere.rotateZ(Math.PI/2);
        sphere.rotateX(Math.PI/4);
        sphere.rotateY(Math.PI/6);
        sphere.position.y +=4;
        return sphere;
    }

    createStem(){
        var stemMat = new THREE.MeshLambertMaterial();
        stemMat.color = new THREE.Color(0x006000);
        var stemGeo = new THREE.CylinderGeometry(0, 0.5, 15, 3);
        var stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y -=4;
        
        return stem;
    }

    // createSeed(){
    //     var seedMat = new THREE.MeshLambertMaterial();
    //     seedMat.color = new THREE.Color(0x343434);
    //     var seedGeo = new THREE.SphereGeometry(1.5, 4, 4);
    //     var seed = new THREE.Mesh(seedGeo, seedMat);
    //     seed.position.x += 1.5;

    //     return seed;
    // }

}

export {FlowerBed};