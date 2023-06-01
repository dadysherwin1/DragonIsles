import * as THREE from "../modules/three.module.js";
import { OrbitControls }  from "../modules/OrbitControls.js";
import { FirstPersonControls } from "../modules/FirstPersonControls.js";
import { Dragon } from "../classes/Dragon.js";
import { World } from "../classes/WorldGen/World.js";
import { Tree } from '../classes/WorldGen/Tree.js';
import { FlowerBed } from '../classes/WorldGen/FlowerBed.js';
import { BillboardVegetation } from '../classes/WorldGen/BillboardVegetation.js';

// initialization
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
document.body.appendChild(renderer.domElement);
var scene = new THREE.Scene();
var width = window.innerWidth;
var height = window.innerHeight;
const camera = new THREE.PerspectiveCamera( 45, width / height, 1, 10000 );
scene.add( camera );
camera.position.set(0,0,0);
var Dir = new THREE.Vector3(0,0,0);
camera.lookAt(Dir.x,Dir.y,Dir.z);

// ambient
const light = new THREE.AmbientLight( 0xFFFFFF , .6); // soft white light
scene.add( light );

// point light has been changed to direcitonal light. works better maaaaaybe????
const light2 = new THREE.PointLight( 0xFFFFFF, 1.5, 0);
// const light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.5, 0);
light2.position.set( 100,500,100);
light2.shadow.camera.near = 0.1; // default
light2.shadow.camera.far = 4000; // default
light2.castShadow = true;
var spheremat = new THREE.MeshBasicMaterial({color : 'yellow'});
var spherGeo = new THREE.SphereGeometry(15);
var sphere = new THREE.Mesh(spherGeo, spheremat);
sphere.position.set(100, 500, 100);
scene.add(sphere);  
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
const world = new World(scene);

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