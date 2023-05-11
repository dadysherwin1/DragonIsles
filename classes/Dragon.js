//import necessary libraries
import * as THREE from '../modules/three.module.js';
import { Orbiter } from '../classes/Orbiter.js';

//constructor
class Dragon {
  constructor(scene, pos, r)
  {
    this.bodySegments = [];

    this.updateRate = 10;
    this.headXPos = [];
    this.headYPos = [];
    this.headZPos = [];
    this.headXRot = [];
    this.headYRot = [];
    this.headZRot = [];

    this.segmentSpacing = 2;
    this.dragonLength = 10;


    //UpdateColors();
    var materials = this.generateDragonMaterials();
    var meshes = this.generateMeshes();
    this.head = this.DrawHead(scene, this.DrawSkull(materials, meshes), this.DrawJaw(materials, meshes), this.DrawEyes(materials, meshes));
    this.updateHeadPositions(this.head, this.updateRate);
    this.DrawBodySegments(scene, materials, meshes);  

    this.orbiter = new Orbiter(this.head, pos, r)
  }  

  OnUpdate(scene)
  {
    this.orbiter.onUpdate()
    this.updateHeadPositions(this.head, this.updateRate);
    this.updateHeadRotations(this.head, this.updateRate);
    this.positionBodySegments();
    this.rotateHead(this.head); 
  }

  generateMeshes(){
    var meshes = [];
  
    var segment = new THREE.IcosahedronGeometry(2,0);
    meshes.push(segment);
      
    var eye = new THREE.IcosahedronGeometry(0.6,1);
    meshes.push(eye);
  
    var spike = new THREE.ConeGeometry(1,4,5);
    meshes.push(spike);
  
    var jawObject = new THREE.CylinderGeometry(1,1.8,4,6);
    meshes.push(jawObject);
  
    return meshes;
  }
  
  generateDragonMaterials(){ //0-body, 1-eyes, 2-spikes, 3-belly
    var materials = [];
  
    var material_segments = new THREE.MeshMatcapMaterial();
    material_segments.color = new THREE.Color(1,1,1);
    material_segments.color = new THREE.Color(Math.random(), Math.random(),Math.random() );
    materials.push(material_segments);
  
    var material_eyes = new THREE.MeshMatcapMaterial();
    material_eyes.color = new THREE.Color(1,1,1);
    material_eyes.color = new THREE.Color(Math.random(), Math.random(),Math.random() );
    materials.push(material_eyes);
  
    var material_spikes = new THREE.MeshMatcapMaterial();
    material_spikes.color = new THREE.Color(1,1,1);
    material_spikes.color = new THREE.Color(Math.random(), Math.random(),Math.random() );
    materials.push(material_spikes);
  
    var material_belly = new THREE.MeshMatcapMaterial();
    material_belly.color = new THREE.Color(1,1,1);
    material_belly.color = new THREE.Color(Math.random(), Math.random(),Math.random() );
    materials.push(material_belly);
  
    return materials;
  }
  
  UpdateColors(){ //updates the colors so that it automatically changes when you edit the colors in the GUI
    
  }
  
  DrawSkull(materials, meshes){ //creates the circular skull
    var skull = new THREE.Mesh(meshes[0],materials[0]);
    return skull;
  }
  
  DrawEyes(materials, meshes){ //creates the two eyes
    var eyes = [];
  
    var eye1 = new THREE.Mesh(meshes[1],materials[1]);
    var eye2 = new THREE.Mesh(meshes[1],materials[1]);
  
    //moves the eyes up vertically
    var traEY = new THREE.Matrix4();
    traEY.makeTranslation(0, 1, 0);
    eye1.applyMatrix4(traEY);
    eye2.applyMatrix4(traEY);
  
    //moves the eyes to correct z axis
    var traE = new THREE.Matrix4();
    var traE2 = new THREE.Matrix4();
    traE.makeTranslation(0, 0, 1);
    traE2.makeTranslation(0, 0, -1);
    eye1.applyMatrix4(traE);
    eye2.applyMatrix4(traE2);
  
    //adds the two eye meshes to the array
    eyes[0] = eye1;
    eyes[1] = eye2;
  
    return eyes;
  }
  
  DrawJaw(materials, meshes){ //creates the jaw/mouth
    var jaw = new THREE.Mesh(meshes[3], materials[0]);
  
    //rotate the jaw 90 degrees
    var rotateJaw = new THREE.Matrix4();
    rotateJaw.makeRotationZ (-Math.PI/2);
    jaw.applyMatrix4(rotateJaw);
  
    //moves the jaw forward a little bit
    var traJ = new THREE.Matrix4();
    traJ.makeTranslation( (1.5), (0), (0) );
    jaw.applyMatrix4(traJ);
  
    return jaw;
  }
  
  //this function takes the inputted skull, jaw and eyes objects and adds them to a Object3D called head
  //this makes all the pieces CHILD objects of the head, meaning if we move and rotate the head, the child objects follow
  DrawHead(scene, skull, jaw, eyes){ 
    var head = new THREE.Object3D();
  
    head.add(skull);
    head.add(jaw);
    head.add(eyes[0]);
    head.add(eyes[1]);
  
    scene.add(head); //adds the entire head to the scene
    return head;
  }
  
  DrawBodySegments(scene, materials, meshes){ //creates all the body segments
    for (var i = 0; i<(this.dragonLength-1); i++){

      this.bodySegments[i] = new THREE.Mesh(meshes[0],materials[0]); //adds a body segnemt to the i'th element in the bodySegments array

      //adds belly colour
      var bellySegment = new THREE.Mesh(meshes[0], materials[3]);
      //moves the belly piece down a bit
      var transB = new THREE.Matrix4();
      transB.makeTranslation(0,-0.5,0);
      bellySegment.applyMatrix4(transB);
      //scales the belly segment down slightly
      var scaB = new THREE.Matrix4();
      scaB.makeScale(0.9,0.9,0.9);
      bellySegment.applyMatrix4(scaB);
      //adds the belly segment to the scene
      //scene.add(bellySegment);
      //adds the belly segment as a child object to the current body segment so that any rotation done to the body effects the belly
      this.bodySegments[i].add(bellySegment);
      /**
       *  BACK SPIKES/TAIL
       *///adds back spikes to 2/3rds of the body
      if (i<(this.dragonLength)/3){
        var backSpike = new THREE.Mesh(meshes[2],materials[2]);
        //scene.add(backSpike);
        //moves spike up a bit
        var traSpike = new THREE.Matrix4();
        traSpike.makeTranslation(0,1,0);
        backSpike.applyMatrix4(traSpike);
        //adds the spike as a child object to the current body segment so that any rotation done to the body effects the spike
        this.bodySegments[i].add(backSpike);
      }
      else{//scales a 3rd of the body for a tail
        var sca= new THREE.Matrix4();
        var scaled = 1-(i-this.dragonLength/3)*0.1;
        sca.makeScale(scaled, scaled, scaled);
        this.bodySegments[i].applyMatrix4(sca); //applies scale
      }
      
      var scaWhole = new THREE.Matrix4();
      scaWhole.makeScale(0.9,0.9,0.9);
      this.bodySegments[i].applyMatrix4(scaWhole);
      // bodySegments[i].applyMatrix4(rot); //applies rotation to body (and belly / spikes)
      // bodySegments[i].applyMatrix4(tra); //applies translation to body (and belly / spikes)
  
      scene.add(this.bodySegments[i]);
    }
    //scene.add(bodySegments);
    return this.bodySegments;
  }
  
  updateHeadPositions(head, updateRate){
    var arrayLength = this.dragonLength * this.segmentSpacing * updateRate;
    //if (currFrame % updateRate == 0){
      this.headXPos.unshift(head.position.x);
      this.headYPos.unshift(head.position.y);
      this.headZPos.unshift(head.position.z);
      this.checkArrayLength(this.headXPos, arrayLength);
      this.checkArrayLength(this.headYPos, arrayLength);
      this.checkArrayLength(this.headZPos, arrayLength);
  
  }
  
  updateHeadRotations(head, updateRate){
    var arrayLength = this.dragonLength * this.segmentSpacing * updateRate;
    var xrot = Math.atan2(this.headZPos[0]-this.headZPos[1],this.headYPos[0]-this.headYPos[1]) - Math.PI/2 ;
    var yrot = Math.atan2(this.headXPos[0]-this.headXPos[1],this.headZPos[0]-this.headZPos[1]) - Math.PI/2;
    var zrot = Math.atan2(this.headXPos[0]-this.headXPos[1], this.headYPos[0]-this.headYPos[1]) - Math.PI/2;
    this.headXRot.unshift(xrot);
    this.headYRot.unshift(yrot);
    this.headZRot.unshift(zrot);
    this.checkArrayLength(this.headXRot, arrayLength);
    this.checkArrayLength(this.headYRot, arrayLength);
    this.checkArrayLength(this.headZRot, arrayLength);
  }
  
  checkArrayLength(array, maxLength){
    while (array.length > maxLength){
      array.pop();
    }
  }
  
  positionBodySegments(){
    for (var i = 0; i<(this.bodySegments.length); i++){
      var offset = (i+1)*this.segmentSpacing* this.updateRate;
      this.bodySegments[i].position.x = this.headXPos[offset];
      this.bodySegments[i].position.y = this.headYPos[offset];
      this.bodySegments[i].position.z = this.headZPos[offset];
  
      //bodySegments[i].rotation.x = headXRot[offset];
      this.bodySegments[i].rotation.y = this.headYRot[offset];
      //bodySegments[i].rotation.z = headZPos[offset];
    }
  }
  
  rotateHead(head){
    //head.rotation.x = this.headXRot[0];
    head.rotation.y = this.headYRot[0];
    //head.rotation.z = this.headZRot[0];
  }
  
  //function to clear the scene
  ClearBodySegments(scene)
  {
    // scene.remove(head);
    for (var i = 0; i < this.bodySegments.length; i++) {
      scene.remove(this.bodySegments[i]);
    }
  }
}

export { Dragon };