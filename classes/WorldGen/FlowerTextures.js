import * as THREE from '../../modules/three.module.js';

class FlowerTextures{
    static texture = new THREE.TextureLoader().load("../../assets/grass/Sunflower_Front_2.png");
    static headMat = new THREE.MeshLambertMaterial();
    static load = false;

    static getFlowerHeadTexture(){
        if (FlowerTextures.load == false){
            FlowerTextures.texture.minFilter = THREE.NearestFilter;
            FlowerTextures.texture.magFilter = THREE.NearestFilter;
            FlowerTextures.headMat.map = FlowerTextures.texture;
            FlowerTextures.headMat.side = THREE.DoubleSide;
            FlowerTextures.headMat.color = new THREE.Color(0xfdf35e);
            FlowerTextures.headMat.transparent = true;              //Somehow making this transparent makes this thing slower
            FlowerTextures.load = true;
        }
        return FlowerTextures.headMat;
    }
}
export {FlowerTextures};