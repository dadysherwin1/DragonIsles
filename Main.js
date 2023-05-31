import * as THREE from "../modules/three.module.js";
import { OrbitControls }  from "../modules/OrbitControls.js";
import { FirstPersonControls } from "../modules/FirstPersonControls.js";
import { Dragon } from "../classes/Dragon.js";
import { World } from "../classes/WorldGen/World.js";
import { Tree } from '../classes/WorldGen/Tree.js';
import { FlowerBed } from '../classes/WorldGen/FlowerBed.js';
import { BillboardVegetation } from '../classes/WorldGen/BillboardVegetation.js';
import GUI from '../modules/lil-gui.module.min.js';

// initialization
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var scene = new THREE.Scene();
var width = window.innerWidth;
var height = window.innerHeight;
const camera = new THREE.PerspectiveCamera( 45, width / height, 1, 10000 );
scene.add( camera );
camera.position.set(0,0,0);
var Dir = new THREE.Vector3(0,0,0);
camera.lookAt(Dir.x,Dir.y,Dir.z);
var world;

// lil gui
const gui = new GUI();
var worldSettings = {
  worldSize: 600,
  numOfClusters: 10,
  regenIslands: function() { 
    world.Destroy(scene);
    world = new World(scene, worldSettings, chunkSettings);
  }
}
gui.add(worldSettings, 'worldSize', 100, 5000, 20); // min, max, step
gui.add(worldSettings, 'numOfClusters', 0, 25, 1);
gui.add(worldSettings, 'regenIslands');

const chunkFolder = gui.addFolder('Island Clusters')
var chunkSettings = {
  islandMaxHeight: 35,
  clusterSize: 300,
  vertexDensity: 70,
  landToAirRatio: 0.3,
  perlinFrequency: 235,
}
chunkFolder.add(chunkSettings, 'islandMaxHeight', 5, 100, 1);
chunkFolder.add(chunkSettings, 'clusterSize', 10, 1000, 5);
chunkFolder.add(chunkSettings, 'vertexDensity', 10, 200, 5);
chunkFolder.add(chunkSettings, 'landToAirRatio', 0, 0.75, 0.01);
chunkFolder.add(chunkSettings, 'perlinFrequency', 100, 300, 5);

// ambient
const light = new THREE.AmbientLight( 0xFFFFFF , .6); // soft white light
scene.add( light );

// point light
const light2 = new THREE.PointLight( 0xFFFFFF, 1.5, 0);
light2.position.set( 500,500,500);
scene.add( light2 );

// fly controls
// const controls = new OrbitControls(camera, renderer.domElement);
const controls = new FirstPersonControls(camera, renderer.domElement);
controls.lookSpeed = 0.001;
controls.movementSpeed = 0.8;

// //Placeholder tree
// var pos = new THREE.Vector3( camera.position.x, camera.position.y, camera.position.z );
// var thing = new Dragon(scene).head;
// camera.add(thing);
// thing.position.set(0, -5, -50);

// dragon
const dragon = new Dragon(scene);

// world
var world = new World(scene, worldSettings, chunkSettings);

// Update
function OnUpdate()
{
  world.Update();
  controls.update(2);

  // dragon moving
  dragon.head.position.copy(camera.position)
  dragon.head.rotation.copy(camera.rotation)
  dragon.head.updateMatrix();
  dragon.head.translateZ(-30)
  dragon.head.translateY(-5)

  dragon.OnUpdate();

  BillboardVegetation.OnUpdate(camera);

  renderer.render(scene, camera);
  requestAnimationFrame(OnUpdate);
}
requestAnimationFrame(OnUpdate);

renderer.render(scene, camera);