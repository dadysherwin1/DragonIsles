//import necessary libraries
import * as THREE from '../modules/three.module.js';
import { Orbiter } from '../classes/Orbiter.js';

//constructor
class Dragon {

  // set by lil gui
  static minLength;
  static maxLength;
  static minSpeed;
  static maxSpeed;
  static overrideColor;
  static bodyColor;
  static bellyColor;
  static eyeColor;
  static spikeColor;

  static SetDragonSettings(dragonSettings) { // fired when something changes in lil gui
    Dragon.minLength = dragonSettings.minLength;
    Dragon.maxLength = dragonSettings.maxLength;
    Dragon.minSpeed = dragonSettings.minSpeed;
    Dragon.maxSpeed = dragonSettings.maxSpeed;
    Dragon.overrideColor = dragonSettings.overrideColor;
    Dragon.bodyColor = dragonSettings.bodyColor;
    Dragon.bellyColor = dragonSettings.bellyColor;
    Dragon.eyeColor = dragonSettings.eyeColor;
    Dragon.spikeColor = dragonSettings.spikeColor;
  }

  constructor(scene, pos, r, isOrbiting)
  {
    this.bodySegments = [];

    this.updateRate = 10;
    this.headXPos = [];
    this.headYPos = [];
    this.headZPos = [];
    this.headXRot = [];
    this.headYRot = [];
    this.headZRot = [];

    this.segmentSpacing = 1;
    this.dragonLength = Dragon.minLength + Math.ceil(Math.random() * (Dragon.maxLength - Dragon.minLength))
    this.counter = 0;
    this.idealSegmentDistance = 2;

    this.arrayLength = this.dragonLength * this.idealSegmentDistance * 20;

    //UpdateColors();
    this.materials = this.generateDragonMaterials();
    var meshes = this.generateMeshes();
    this.head = this.DrawHead(scene, this.DrawSkull(meshes), this.DrawJaw(meshes), this.DrawEyes(meshes));
    this.updateHeadPositions(this.head, this.updateRate);
    this.DrawBodySegments(scene, meshes);  

    if (isOrbiting) {
      this.orbiter = new Orbiter(this.head, pos, r)
    }
    else
    {
      this.orbiter = null;
    }
  }  

  OnUpdate(scene)
  {
    if (this.orbiter != null) {
      this.orbiter.onUpdate()
    }
    this.updateHeadPositions(this.head, this.updateRate);
    this.updateHeadRotations(this.head, this.updateRate);
    this.positionBodySegments();
    this.rotateHead(this.head); 

    this.counter++;
  }

  generateMeshes(){
    var meshes = [];
  
    var segment = new THREE.IcosahedronGeometry(2,0);
    segment.castShadow = true; 
    segment.receiveShadow = true; 
    meshes.push(segment);
      
    var eye = new THREE.IcosahedronGeometry(0.6,1);
    eye.castShadow = false; 
    eye.receiveShadow = true; 
    meshes.push(eye);
  
    var spike = new THREE.ConeGeometry(1,4,5);
    spike.castShadow = true; 
    spike.receiveShadow = true; 
    meshes.push(spike);
  
    var jawObject = new THREE.CylinderGeometry(1,1.8,4,6);
    jawObject.castShadow = true; 
    jawObject.receiveShadow = true; 
    meshes.push(jawObject);
  
    return meshes;
  }
  
  generateDragonMaterials(){ //0-body, 1-eyes, 2-spikes, 3-belly

    const fiveTone = new THREE.TextureLoader().load('../assets/gradientMaps/fiveTone.jpg')
        fiveTone.minFilter = THREE.NearestFilter
        fiveTone.magFilter = THREE.NearestFilter


    var materials = [];
  
    var material_segments = new THREE.MeshToonMaterial();
    material_segments.color = new THREE.Color(1,1,1); // why do u set these twice? o_o
    material_segments.color = new THREE.Color(Math.random() / 2, Math.random() / 2, Math.random() / 2 );
    material_segments.gradientMap = fiveTone;
    materials.push(material_segments);
  
    var material_eyes = new THREE.MeshToonMaterial();
    material_eyes.color = new THREE.Color(1,1,1);
    material_eyes.color = new THREE.Color(Math.random() / 2 + .5, Math.random() / 2 + .5, Math.random() / 2 + .5 );
    material_eyes.gradientMap = fiveTone;
    materials.push(material_eyes);
  
    var material_spikes = new THREE.MeshToonMaterial();
    material_spikes.color = new THREE.Color(1,1,1);
    material_spikes.color = new THREE.Color(Math.random(), Math.random(),Math.random() );
    material_spikes.gradientMap = fiveTone;
    materials.push(material_spikes);
  
    var material_belly = new THREE.MeshToonMaterial();
    material_belly.color = new THREE.Color(1,1,1);
    material_belly.color = new THREE.Color(Math.random() / 2 + .5, Math.random() / 2 + .5, Math.random() / 2 + .5 );
    material_belly.gradientMap = fiveTone;
    materials.push(material_belly);
  
    return materials;
  }
  
  UpdateColors(){ //updates the colors so that it automatically changes when you edit the colors in the GUI
    if (Dragon.overrideColor) { // selected colors
      this.materials[0].color = new THREE.Color(Dragon.bodyColor[0],Dragon.bodyColor[1],Dragon.bodyColor[2]);
      this.materials[1].color = new THREE.Color(Dragon.eyeColor[0],Dragon.eyeColor[1],Dragon.eyeColor[2]);
      this.materials[2].color = new THREE.Color(Dragon.spikeColor[0],Dragon.spikeColor[1],Dragon.spikeColor[2]);
      this.materials[3].color = new THREE.Color(Dragon.bellyColor[0],Dragon.bellyColor[1],Dragon.bellyColor[2]);
    }
    else { // random colors
      var newMaterials = this.generateDragonMaterials();
      this.materials[0].color = newMaterials[0].color;
      this.materials[1].color = newMaterials[1].color;
      this.materials[2].color = newMaterials[2].color;
      this.materials[3].color = newMaterials[3].color;
    }
  }

  UpdateSpeed(){ //updates the speed so that it automatically changes when you edit the speed in the GUI
    this.orbiter.setSpeed(Dragon.minSpeed, Dragon.maxSpeed);
  }
  
  DrawSkull(meshes){ //creates the circular skull
    var skull = new THREE.Mesh(meshes[0],this.materials[0]);
    return skull;
  }
  
  DrawEyes(meshes){ //creates the two eyes
    var eyes = [];
  
    var eye1 = new THREE.Mesh(meshes[1],this.materials[1]);
    var eye2 = new THREE.Mesh(meshes[1],this.materials[1]);

    eye1.name = "eye"; // name it so we can color it later
    eye2.name = "eye";
  
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
  
  DrawJaw(meshes){ //creates the jaw/mouth
    var jaw = new THREE.Mesh(meshes[3], this.materials[0]);
  
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
  
  DrawBodySegments(scene, meshes){ //creates all the body segments
    for (var i = 0; i<(this.dragonLength-1); i++){

      this.bodySegments[i] = new THREE.Mesh(meshes[0],this.materials[0]); //adds a body segnemt to the i'th element in the bodySegments array

      //adds belly colour
      var bellySegment = new THREE.Mesh(meshes[0], this.materials[3]);
      bellySegment.name = "belly"; // name it so we can color it later
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
        var backSpike = new THREE.Mesh(meshes[2],this.materials[2]);
        backSpike.name = "spike"; // name it so we can color it later
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
    //var arrayLength = this.dragonLength * this.segmentSpacing * updateRate;
    if (this.isOrbiting){
      head.position.y = head.position.y + 2*Math.sin(0.05*this.counter);
    }
    //if (currFrame % updateRate == 0){
      
      this.headXPos.unshift(head.position.x);
      this.headYPos.unshift(head.position.y);
      this.headZPos.unshift(head.position.z);
      this.checkArrayLength(this.headXPos, this.arrayLength);
      this.checkArrayLength(this.headYPos, this.arrayLength);
      this.checkArrayLength(this.headZPos, this.arrayLength);

      // if (this.orbiter == null){

      //   console.log("headXPos: " + this.headXPos);
      //   console.log("headYPos: " + this.headYPos);
      //   console.log("headZPos: " + this.headZPos);
      // }
  
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
  //   if(this.orbiter != null){
  //     for (var i = 0; i<(this.bodySegments.length); i++){
  //       var offset = (i+1)*this.segmentSpacing* this.updateRate;
  //       this.bodySegments[i].position.x = this.headXPos[offset];
  //       this.bodySegments[i].position.y = this.headYPos[offset];
  //       this.bodySegments[i].position.z = this.headZPos[offset];
    
  //       //bodySegments[i].rotation.x = headXRot[offset];
  //       this.bodySegments[i].rotation.y = this.headYRot[offset];
  //       //bodySegments[i].rotation.z = headZPos[offset];
  //   }
  // }
  //   else {
      var i = 0;
      for (var segmentNo = 0; segmentNo<(this.bodySegments.length); segmentNo++){
        //console.log("calculating segment: " + segmentNo);
        
        var pos1 = new THREE.Vector3(this.headXPos[i], this.headYPos[i], this.headZPos[i]);
        var pos2 = new THREE.Vector3(this.headXPos[i+1], this.headYPos[i+1], this.headZPos[i+1]);
        var pathLength = 0;
        pathLength = pathLength + this.calculateAbsDistance(pos1, pos2);
        while (pathLength <= this.idealSegmentDistance){
          i++;
          //console.log("checking position: " + i);
          pos1 = new THREE.Vector3(this.headXPos[i], this.headYPos[i], this.headZPos[i]);
          pos2 = new THREE.Vector3(this.headXPos[i+1], this.headYPos[i+1], this.headZPos[i+1]);
          // distance = potentialPos.distanceTo(relativePos);
          pathLength = pathLength + this.calculateAbsDistance(pos1, pos2);
        }
        // if (segmentNo == this.bodySegments.length-1){
        //   console.log("segment number: " + segmentNo);
        //   console.log("found at position: " + i);
        //   console.log("array length: " + this.arrayLength);
        // }
        
        this.bodySegments[segmentNo].position.x = pos2.x;
        this.bodySegments[segmentNo].position.y = pos2.y;
        this.bodySegments[segmentNo].position.z = pos2.z;
      //}
    }
  }


  calculateAbsDistance(potentialPos, relativePos){
    //console.log("potentialPos: " + potentialPos.x + " " + potentialPos.y + " " + potentialPos.z);
    //console.log("relativePos: " + relativePos.x + " " + relativePos.y + " " + relativePos.z);
       
    var a = relativePos.x - potentialPos.x;
    var b = relativePos.y - potentialPos.y;
    var c = relativePos.z - potentialPos.z;
    
    var distance = Math.sqrt(a * a + b * b + c * c);
    //console.log("comparing " + potentialPos + " and " + relativePos + ": distance is " + distance);
    //console.log("distance: " + distance);
    return distance;
  }


  // setBodyPosition(segmentNo, position){
  //   this.bodySegments[segmentNo].position = position;
  // }

  // returnDistance(relativePos, potentialPos){ //relativepos = head/ previous body segment. potentialpos = a value in the array
  //   return potentialPos.distanceTo(relativePos);
  // }

  // findOffset(segmentNo){
  //   var i = 1;
  //   var potentialPos = (this.headXPos[i], this.headYPos[i], this.headZPos[i]);
  //   var relativePos = (this.headXPos[0], this.headYPos[0], this.headZPos[0]);
  //   if (segmentNo != 0){
  //     relativePos = (bodySegments[segmentNo - 1].position);
  //   }
  //   while (potentialPos.distanceTo(relativePos) < this.idealSegmentDistance){
  //     i++;
  //     var potentialPos = (this.headXPos[i], this.headYPos[i], this.headZPos[i]);
  //   }
  //   this.bodySegments[segmentNo].position = potentialPos;
  // }
  
  rotateHead(head){
    //head.rotation.x = this.headXRot[0];
    head.rotation.y = this.headYRot[0];
    //head.rotation.z = this.headZRot[0];
  }
  
  //function to clear the scene
  ClearBodySegments(scene)
  {
    scene.remove(this.head);
    for (var i = 0; i < this.bodySegments.length; i++) {
      scene.remove(this.bodySegments[i]);
    }
  }
}

export { Dragon };