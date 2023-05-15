import * as THREE from "../modules/three.module.js";
import { OrbitControls }  from "../modules/OrbitControls.js";
import { FirstPersonControls } from "../modules/FirstPersonControls.js";
import { Dragon } from "../classes/Dragon.js";
import { World } from "../classes/WorldGen/World.js";
import { Tree } from '../classes/WorldGen/Tree.js';

// initialization
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var scene = new THREE.Scene();
var width = window.innerWidth;
var height = window.innerHeight;
const camera = new THREE.PerspectiveCamera( 45, width / height, 1, 10000 );
scene.add( camera );
camera.position.set(600,0,0);
var Dir = new THREE.Vector3(0,0,0);
camera.lookAt(Dir.x,Dir.y,Dir.z);

// ambient
const light = new THREE.AmbientLight( 0xFFFFFF , .6); // soft white light
scene.add( light );

// fly controls
// const controls = new OrbitControls(camera, renderer.domElement);
const controls = new FirstPersonControls(camera, renderer.domElement);
controls.lookSpeed = 0.001;

//Placeholder tree
var pos = new THREE.Vector3( camera.position.x, camera.position.y, camera.position.z );
var thing = new Tree(pos).model;
camera.add(thing);
thing.position.set(0, -30, -100);

// dragon
const dragon = new Dragon(scene);

// world
const world = new World(scene);

// Update
function OnUpdate()
{
  world.Update();
  controls.update(2);
  renderer.render(scene, camera);
  requestAnimationFrame(OnUpdate);
}
requestAnimationFrame(OnUpdate);

renderer.render(scene, camera);