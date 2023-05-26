//import necessary libraries
import * as THREE from '../modules/three.module.js';
import GUI from '../modules/lil-gui.module.min.js';

//create the GUI sliders
var gui = new GUI();

//old variables from before GUI was added
// var n = 10; //number of body segments (spread of wave)
// var s = 3; //spacing
// var h = 2; //heiht of wave
// var p = 20; //speed of wave/

//creates the parameters for the body segments
var creature = {
  n: 10,
  s: 2.5,
  h: 2,
  p: 20,
};
//adds the GUI parameters onto the side 
gui.add(creature, 'n', 3, 15, 1).name("Length:").listen();
gui.add(creature, 's', 1, 5 ).name("Spacing:").listen();
gui.add(creature, 'h', 1, 4 ).name("Height:").listen();
gui.add(creature, 'p', 5, 30).name("Speed:").listen();
// Adds in the colour picker parameter
const colorFormats = {
  //string: '#ffffff',
  //int: 0xffffff,
  //object: { r: 1, g: 1, b: 1 },
  body: [ 0.2, 0.9, 0.4],
  eyeColor: [0.5, 0.5, 0.5],
  spikeColor: [1, 0.5, 0.5],
  belly: [1, 1, 1]

};
gui.addColor( colorFormats, 'body' ).name("Body color:").listen();
gui.addColor( colorFormats, 'eyeColor' ).name("Eye color:").listen();
gui.addColor( colorFormats, 'spikeColor' ).name("Spike color:").listen();
gui.addColor( colorFormats, 'belly' ).name("Belly color:").listen();

//other parameters
var other = {
  randomise() {
    creature.n = getRndInteger(3,15);
    creature.s = getRnd(1,5);
    creature.h = getRnd(1,4);
    creature.p = getRnd(5,30);
    colorFormats.body = [Math.random(), Math.random(),Math.random() ]
    colorFormats.eyeColor = [Math.random(), Math.random(),Math.random() ]
    colorFormats.spikeColor = [Math.random(), Math.random(),Math.random() ]
    colorFormats.belly = [Math.random(), Math.random(),Math.random() ]
  
  }
}
gui.add(other, 'randomise').name("Randomise"); //adds the randomiser button

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function getRnd(min, max){
  return Math.random() * (max - min) + min;
}

//create the materials
var material_segments = new THREE.MeshMatcapMaterial();
var material_eyes = new THREE.MeshMatcapMaterial();
var material_spikes = new THREE.MeshMatcapMaterial();
var material_belly = new THREE.MeshMatcapMaterial();
//set the color of the materials to something default.
material_segments.color = new THREE.Color(1,1,1);
material_eyes.color = new THREE.Color(1,1,1);
material_spikes.color = new THREE.Color(1,1,1);
material_belly.color = new THREE.Color(1,1,1);

//create the meshes
var segment = new THREE.IcosahedronGeometry(2,0);
var eye = new THREE.IcosahedronGeometry(0.6,1);
var jawObject = new THREE.CylinderGeometry(1,1.8,4,6);
var spike = new THREE.ConeGeometry(1,4,5);

//variables for some bodyparts (SHERWIN ADDED THIS)
var bodySegments = [];
var head;


//var subFrames = 10;
var currFrame=0;

function UpdateColors(){ //updates the colors so that it automatically changes when you edit the colors in the GUI
  material_segments.color = new THREE.Color(colorFormats.body[0],colorFormats.body[1],colorFormats.body[2]);
  material_eyes.color = new THREE.Color(colorFormats.eyeColor[0],colorFormats.eyeColor[1],colorFormats.eyeColor[2]);
  material_spikes.color = new THREE.Color(colorFormats.spikeColor[0],colorFormats.spikeColor[1],colorFormats.spikeColor[2]);
  material_belly.color = new THREE.Color(colorFormats.belly[0],colorFormats.belly[1],colorFormats.belly[2]);
}

function DrawBodySegments(scene){ //creates all the body segments
  for (var i = 0; i<(creature.n-1); i++){
    var tra = new THREE.Matrix4();
    var cubex = ((i*creature.s) - (creature.s*(creature.n/2)) ); //spreads segments out evenly
    var cubey = creature.h*Math.sin(i+currFrame/creature.p); //moves segments up and down
    tra.makeTranslation(cubex,cubey,0);  

    //rotates segments to make it look organic
    var rot = new THREE.Matrix4();
    rot.makeRotationZ (( (Math.cos(i+currFrame/creature.p)) /4 ) *creature.h); //using cos here because cos is the gradient function for sin.. 
                                                                                //this took me an embarassingly long time to figure out considering 
                                                                                //i did accelerated and three unit math for hsc

    bodySegments[i] = new THREE.Mesh(segment,material_segments); //adds a body segnemt to the i'th element in the bodySegments array
    scene.add(bodySegments[i]); //puts the body segment in the scene
    
    //adds belly colour
    var bellySegment = new THREE.Mesh(segment, material_belly);
    //moves the belly piece down a bit
    var transB = new THREE.Matrix4();
    transB.makeTranslation(0,-0.5,0);
    bellySegment.applyMatrix4(transB);
    //scales the belly segment down slightly
    var scaB = new THREE.Matrix4();
    scaB.makeScale(0.9,0.9,0.9);
    bellySegment.applyMatrix4(scaB);
    //adds the belly segment to the scene
    scene.add(bellySegment);
    //adds the belly segment as a child object to the current body segment so that any rotation done to the body effects the belly
    bodySegments[i].add(bellySegment);

    //adds back spikes to 2/3rds of the body
    if (i>(creature.n-1)/3){
      var backSpike = new THREE.Mesh(spike,material_spikes);
      scene.add(backSpike);
      //moves spike up a bit
      var traSpike = new THREE.Matrix4();
      traSpike.makeTranslation(0,1,0);
      backSpike.applyMatrix4(traSpike);

      //adds the spike as a child object to the current body segment so that any rotation done to the body effects the spike
      bodySegments[i].add(backSpike);
    }
    else{//scales a 3rd of the body for a tail
      var sca= new THREE.Matrix4();
      var scaled = 0.6 + i*0.1;
      sca.makeScale(scaled, scaled, scaled);
      bodySegments[i].applyMatrix4(sca); //applies scale
    }

    bodySegments[i].applyMatrix4(rot); //applies rotation to body (and belly / spikes)
    bodySegments[i].applyMatrix4(tra); //applies translation to body (and belly / spikes)
  }
}

function DrawSkull(){ //creates the circular skull
    var skull = new THREE.Mesh(segment,material_segments);
    return skull;
}

function DrawEyes(){ //creates the two eyes
  var eyes = [];

  var eye1 = new THREE.Mesh(eye,material_eyes);
  var eye2 = new THREE.Mesh(eye,material_eyes);

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

function DrawJaw(){ //creates the jaw/mouth
  var jaw = new THREE.Mesh(jawObject, material_segments);

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
function DrawHead(scene, skull, jaw, eyes){ 
  head = new THREE.Object3D();

  head.add(skull);
  head.add(jaw);
  head.add(eyes[0]);
  head.add(eyes[1]);

  //rotates the whole head to make the animation movement look organic
  var rotHead = new THREE.Matrix4();
  
  rotHead.makeRotationZ ( ( (Math.cos((creature.n-1)+currFrame/creature.p)) /4 ) * creature.h); //using cos here because cos is the gradient function for sin.. 
  head.applyMatrix4(rotHead);                                                                   //this took me an embarassingly long time to figure out considering 
                                                                                                //i did accelerated and three unit math for hsc
  //moves entire head to front of the body
  var traHead = new THREE.Matrix4();
  traHead.makeTranslation( ((creature.n-1)*creature.s) - (creature.s*(creature.n/2)), (creature.h*Math.sin((creature.n-1)+currFrame/creature.p)), (0) );
  head.applyMatrix4(traHead);

  scene.add(head); //adds the entire head to the scene
}



 //NEW CODE FOR DRAWING A DRAGON MANS
 var headX = 0;
 var headY = 0;
 var headZ = 0;
 var head2;
 var headXPos = [0,0,0];
 var headYPos = [];
 var headZPos = [];

 var bodyS1;
 var bodyS2;


 //bodySegments[i].add(backSpike)

 function MovingHead(scene){
  head2 = new THREE.Mesh(segment,material_segments);
  var moveHead = new THREE.Matrix4();
  moveHead.makeTranslation(headX, headY, headZ);
  head2.applyMatrix4(moveHead);
  scene.add(head2);
  if (currFrame%10==0){ //update every 10 frames
    headXPos.unshift(head2.position.x);
    headXPos.pop();
    //console.log(headXPos);
    console.log("second position: " + headXPos[1]);
    console.log("third position: " + headXPos[2]);
    headX++;
  }
}

function createTrailingSegments(scene){
  bodyS1 = new THREE.Mesh(segment,material_segments);
  var moveBody = new THREE.Matrix4();
  moveBody.makeTranslation(headXPos[1], headY, headZ);
  bodyS1.applyMatrix4(moveBody);
  scene.add(bodyS1);

  bodyS2 = new THREE.Mesh(segment,material_segments);
  var moveBody2 = new THREE.Matrix4();
  moveBody2.makeTranslation(headXPos[2], headY, headZ);
  bodyS1.applyMatrix4(moveBody2);
  scene.add(bodyS2);
}

function CreateScene(scene)
{
  UpdateColors();
  //DrawBodySegments(scene);
  //DrawHead(scene, DrawSkull(), DrawJaw(), DrawEyes());

  createTrailingSegments(scene);
  MovingHead(scene);
  
}

//function to clear the scene
function ClearScene(scene)
{
  //scene.remove(head);
  scene.remove(head2);
  scene.remove(bodyS1);
  scene.remove(bodyS2);
  //for (var i = 0; i < bodySegments.length; i++) {
  //  scene.remove(bodySegments[i]);
  //}
  
}

//final update loop
class Dragon {
  constructor(scene)
  {
    CreateScene(scene);
  }  

  OnUpdate(scene)
  {
    ClearScene(scene);
    //currFrame = (currFrame + 1)%subFrames;
    currFrame = (currFrame + 1);
    CreateScene(scene);
  }
}

export { Dragon };




/**
 *     else {
      var i = 1;
      for (var segmentNo = 0; segmentNo<(this.bodySegments.length); segmentNo++){
        //console.log("calculating segment: " + segmentNo);
        
        var potentialPos = new THREE.Vector3(this.headXPos[i], this.headYPos[i], this.headZPos[i]);
        var relativePos = new THREE.Vector3(this.headXPos[0], this.headYPos[0], this.headZPos[0]);
        if (segmentNo > 0){
          relativePos = new THREE.Vector3(this.bodySegments[segmentNo - 1].position.x, this.bodySegments[segmentNo - 1].position.y, this.bodySegments[segmentNo - 1].position.z);      
        }
        var pathLength = 0;
        //
        while (pathLength <= this.idealSegmentDistance){
          i++;
          //console.log("checking position: " + i);
          potentialPos = new THREE.Vector3(this.headXPos[i], this.headYPos[i], this.headZPos[i]);
          // distance = potentialPos.distanceTo(relativePos);
          pathLength = pathLength + this.calculateAbsDistance(potentialPos, relativePos);
        }
        console.log("found at position: " + i);
        console.log("array length: " + this.arrayLength);
        this.bodySegments[segmentNo].position.x = potentialPos.x;
        this.bodySegments[segmentNo].position.y = potentialPos.y;
        this.bodySegments[segmentNo].position.z = potentialPos.z;
      }
    }
  }
 */