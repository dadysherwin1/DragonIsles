import * as THREE from '../../modules/three.module.js';

class Tree{
    constructor(pos){
        this.model = new THREE.Object3D();
        this.CreateTree(pos);
    }
    CreateTree(pos){
        var treeBase = this.createTreeBase();
        var treeLeave = this.createLeaves();
        
        
        var tree = new THREE.Group();  //adds truck and leaves to a single group
        tree.add(treeBase);
        tree.add(treeLeave);
        tree.position.x = pos.x;
        tree.position.y = pos.y+= 4; //adjust tree pos.y so it isn't stuck too much into the ground
        tree.position.z = pos.z;
        this.model.add(tree);
    }


    createTreeBase(){ //Creates the tree trunk base
        var cylinderMat = new THREE.MeshLambertMaterial();
        cylinderMat.color = new THREE.Color(0xce6900);
        var cyliderGeo = new THREE.CylinderGeometry(1, 2, 10);
        var base = new THREE.Mesh(cyliderGeo, cylinderMat);
        base.castShadow = true; 
        base.receiveShadow = true; 
        return base;
    }

    createLeaves(){ //Creates a few cones of vary sizes as the leaves of the tree (numbers are currently hardcoded)
        var leavesList = new THREE.Object3D();
        var coneMat = new THREE.MeshLambertMaterial();
        coneMat.color = new THREE.Color(0x8fce00);
        for(let i = 1; i < 4; i++){
            var coneGeo = new THREE.ConeGeometry(6-i, 6);
            var newCone = new THREE.Mesh(coneGeo, coneMat);
            newCone.position.y += 3*i;
            newCone.castShadow = true; 
            newCone.receiveShadow = true; 
            leavesList.add(newCone);
        }
        return leavesList;
    }
}

export {Tree};