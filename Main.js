import * as THREE from "../modules/three.module.js";
import { FlyControls }  from "../modules/FlyControls.js";
import { Dragon } from "../classes/Dragon.js";
import { World } from "../classes/WorldGen/World.js";

// initialization
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var scene = new THREE.Scene();
var width = window.innerWidth;
var height = window.innerHeight;
const camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
scene.add( camera );
camera.position.set(0,0,25);

// fly controls
const controls = new FlyControls(camera, renderer.domElement);

// dragon
const dragon = new Dragon(scene);

// world
const world = new World();
world.Generate(scene);

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