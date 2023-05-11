import * as THREE from "../modules/three.module.js";
import { OrbitControls }  from "../modules/OrbitControls.js";
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

// ambient
const light = new THREE.AmbientLight( 0xFFFFFF , .6); // soft white light
scene.add( light );

// point light
const light2 = new THREE.PointLight( 0xFFFFFF, 1.5, 0);
light2.position.set( 500,500,500);
scene.add( light2 );

// fly controls
const controls = new OrbitControls(camera, renderer.domElement);

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