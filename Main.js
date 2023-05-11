import * as THREE from "../modules/three.module.js";
import { OrbitControls }  from "../modules/OrbitControls.js";
import { FlyControls } from "../modules/FlyControls.js";
import { Dragon } from "../classes/Dragon.js";
import { World } from "../classes/WorldGen/World.js";
import {Tree} from '../classes/WorldGen/Tree.js';

// initialization
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var scene = new THREE.Scene();
var width = window.innerWidth;
var height = window.innerHeight;
const camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
camera.position.set(0,0,25);
scene.add( camera );
// fly controls
// const controls = new OrbitControls(camera, renderer.domElement);
const controls = new FlyControls(camera, renderer.domElement);
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
  dragon.OnUpdate(scene);
  controls.update(2);
  renderer.render(scene, camera);
  requestAnimationFrame(OnUpdate);
}
requestAnimationFrame(OnUpdate);

renderer.render(scene, camera);