import * as THREE from '../../modules/three.module.js';
import {FlowerTextures  } from "./FlowerTextures.js";

class FlowerBed{

    static minHeight;
    static maxHeight;
    static headGeo = new THREE.PlaneGeometry(7,7);
    static stemMat = new THREE.MeshLambertMaterial({color : 0x006000});


    constructor(pos){
        this.model = new THREE.Object3D();
        this.stemHeight = FlowerBed.minHeight + Math.ceil(Math.random() * (FlowerBed.maxHeight - FlowerBed.minHeight));
        this.FlowerBed(pos);
    }

    static changeFlowerSettings(flowerSetting){
        FlowerBed.minHeight = flowerSetting.flowerMinHeight;
        FlowerBed.maxHeight = flowerSetting.flowerMaxHeight;
    }

    FlowerBed(pos){
        
        var translation = new THREE.Matrix4();
        translation.makeTranslation(1, 0, 0);

        var rotation = new THREE.Matrix4();
        rotation.makeRotationY(2*Math.PI/3);

        var flower0 = this.createFlower();

        var obj = new THREE.Group();
        
        obj.add(flower0);
        obj.position.x = pos.x;
        obj.position.y = pos.y;
        obj.position.z = pos.z;
        this.model.add(obj);
    }

    createFlower(){
        var leaves = this.createLeaves();
        var stem = this.createStem();
        var flower = new THREE.Group()
        flower.add(leaves);
        flower.add(stem);
        var scale = new THREE.Matrix4();
        scale.makeScale(0.3, 0.3, 0.3);
        flower.applyMatrix4(scale);
        flower.position.y += this.stemHeight/8;
        
        return flower;
    }

    createLeaves(){
        var sphere = new THREE.Mesh(FlowerBed.headGeo,  FlowerTextures.getFlowerHeadTexture());
        sphere.rotateZ(Math.PI/2);
        sphere.rotateX(Math.PI/4);
        sphere.rotateY(Math.PI/6);
        sphere.position.y += this.stemHeight/2;
        return sphere;
    }

    createStem(){
        var stemGeo = new THREE.CylinderGeometry(0, 0.5, this.stemHeight, 2);
        var stem = new THREE.Mesh(stemGeo, FlowerBed.stemMat);
        // stem.position.y -=4;
        return stem;
    }
}

export {FlowerBed};