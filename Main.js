import * as THREE from "../modules/three.module.js";
import { FlyControls}  from "../modules/FlyControls.js";
var scene = new THREE.Scene();
var width = window.innerWidth;
var height = window.innerHeight;

const camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
scene.add( camera );
camera.position.set(0,0,10);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new FlyControls(camera, renderer.domElement);

const geometry_cube = new THREE.BoxGeometry( 1, 1, 1 );
const material_cube = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
material_cube.color = new THREE.Color(150/255,1,1);
material_cube.wireframe = true;
const cubeMesh = new THREE.Mesh(geometry_cube, material_cube);
scene.add( cubeMesh );

var OnUpdate = function ()
{
  controls.update(0.1);

  renderer.render(scene, camera);
  requestAnimationFrame(OnUpdate);
};

requestAnimationFrame(OnUpdate);

renderer.render(scene, camera);