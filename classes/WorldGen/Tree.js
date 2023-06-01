import * as THREE from '../../modules/three.module.js';

class Tree{

    static color;
    static minHeight;
    static maxHeight;
    static minWidth;
    static maxWidth;
    static coneAmount;


    static SetTreeSettings(vegetationSettings) { // fired when something changes in lil gui
        Tree.minHeight = vegetationSettings.treeMinHeight;
        Tree.maxHeight = vegetationSettings.treeMaxHeight;
        Tree.minWidth = vegetationSettings.treeMinWidth;
        Tree.maxWidth = vegetationSettings.treeMaxWidth;
        Tree.coneAmount = vegetationSettings.treeConeAmount;
        
        var colour = vegetationSettings.treeColor;
        Tree.color = new THREE.Color(colour[0], colour[1], colour[2]);
      }

    constructor(pos){
        this.model = new THREE.Object3D();
        this.trunkLength = Tree.minHeight + Math.ceil(Math.random() * (Tree.maxHeight - Tree.minHeight));
        this.coneWidth = Tree.minWidth + Math.ceil(Math.random() * (Tree.maxWidth - Tree.minWidth));
        this.CreateTree(pos);
    }

    CreateTree(pos){
        var treeBase = this.createTreeBase();
        var treeLeave = this.createLeaves();
        
        var tree = new THREE.Group();  //adds truck and leaves to a single group
        tree.add(treeBase);
        tree.add(treeLeave);
        tree.position.x = pos.x;
        tree.position.y = pos.y + 0.25*this.trunkLength; //adjust tree pos.y so it isn't stuck too much into the ground
        tree.position.z = pos.z;
        this.model.add(tree);
    }


    createTreeBase(){ //Creates the tree trunk base
        var cylinderMat = new THREE.MeshLambertMaterial();
        cylinderMat.color = new THREE.Color(0xce6900);
        var cyliderGeo = new THREE.CylinderGeometry(this.coneWidth/5, this.coneWidth/2.5, this.trunkLength);
        var base = new THREE.Mesh(cyliderGeo, cylinderMat);
        base.castShadow = true; 
        base.receiveShadow = true; 
        return base;
    }

    createLeaves(){ //Creates a few cones of vary sizes as the leaves of the tree (numbers are currently hardcoded)
        var leavesList = new THREE.Object3D();
        var coneMat = new THREE.MeshLambertMaterial();
        coneMat.color = Tree.color;
        var height = this.trunkLength/2;
        for(let i = 0; i < Tree.coneAmount; i++){
            var coneGeo = new THREE.ConeGeometry(this.coneWidth - this.coneWidth*(i/(Tree.coneAmount+1)), height);
            var newCone = new THREE.Mesh(coneGeo, coneMat);
            newCone.position.y += height + (i+1)*height/2;
            newCone.castShadow = true; 
            newCone.receiveShadow = true; 
            leavesList.add(newCone);
        }
        return leavesList;
    }
}

export {Tree};