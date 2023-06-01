import * as THREE from "../modules/three.module.js";
import { OrbitControls }  from "../modules/OrbitControls.js";
import { FirstPersonControls } from "../modules/FirstPersonControls.js";
import { Dragon } from "../classes/Dragon.js";
import { World } from "../classes/WorldGen/World.js";
import { Tree } from '../classes/WorldGen/Tree.js';
import { FlowerBed } from '../classes/WorldGen/FlowerBed.js';
import { BillboardVegetation } from '../classes/WorldGen/BillboardVegetation.js';
import GUI from '../modules/lil-gui.module.min.js';
import { EffectComposer } from './modules/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from './modules/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { ShaderPass } from './modules/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from './modules/examples/jsm/shaders/GammaCorrectionShader.js';

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
var world;

var composer = new EffectComposer( renderer );
			var params = { pixelSize: 1, normalEdgeStrength: 0.01, depthEdgeStrength: 0.01, pixelAlignedPanning: true };
      const renderPixelatedPass = new RenderPixelatedPass( 6, scene, camera, params );
      renderPixelatedPass.setPixelSize(1);
			composer.addPass( renderPixelatedPass );

			const outputPass = new ShaderPass( GammaCorrectionShader );
			composer.addPass( outputPass );

// lil gui
const gui = new GUI();

const dragonFolder = gui.addFolder('Dragons 🐉')
var dragonSettings = {
  minLength: 5,
  maxLength: 10,
  minSpeed: 5,
  maxSpeed: 20,

  overrideColor: false,
  bodyColor: [ 0.2, 0.9, 0.4 ],
  bellyColor: [1, 1, 1],
  eyeColor: [0.5, 0.5, 0.5],
  spikeColor: [1, 0.5, 0.5],

}
dragonFolder.add(dragonSettings, 'minLength', 3, 12, 1).listen().onChange(value => {
  if (value > dragonSettings.maxLength)
    dragonSettings.maxLength = value;
  Dragon.SetDragonSettings(dragonSettings);
  world.RespawnDragons(scene);
})
dragonFolder.add(dragonSettings, 'maxLength', 3, 12, 1).listen().onChange(value => {
  if (value < dragonSettings.minLength)
    dragonSettings.minLength = value;
  Dragon.SetDragonSettings(dragonSettings);
  world.RespawnDragons(scene);
})
dragonFolder.add(dragonSettings, 'minSpeed', 3, 100, 1).listen().onChange(value => {
  if (value > dragonSettings.maxSpeed)
    dragonSettings.maxSpeed = value;
  Dragon.SetDragonSettings(dragonSettings);
  world.UpdateDragonSpeed();
})
dragonFolder.add(dragonSettings, 'maxSpeed', 3, 100, 1).listen().onChange(value => {
  if (value < dragonSettings.minSpeed)
    dragonSettings.minSpeed = value;
  Dragon.SetDragonSettings(dragonSettings);
  world.UpdateDragonSpeed();
})
dragonFolder.add(dragonSettings, 'overrideColor').onChange(value => {
  Dragon.SetDragonSettings(dragonSettings);
  world.UpdateDragonColors();
  dragon.UpdateColors();
});
dragonFolder.addColor(dragonSettings, 'bodyColor').onChange(color => {
  Dragon.SetDragonSettings(dragonSettings);
  world.UpdateDragonColors();
  dragon.UpdateColors();
});
dragonFolder.addColor(dragonSettings, 'bellyColor').onChange(color => {
  Dragon.SetDragonSettings(dragonSettings);
  world.UpdateDragonColors();
  dragon.UpdateColors();
});
dragonFolder.addColor(dragonSettings, 'eyeColor').onChange(color => {
  Dragon.SetDragonSettings(dragonSettings);
  world.UpdateDragonColors();
  dragon.UpdateColors();
});
dragonFolder.addColor(dragonSettings, 'spikeColor').onChange(color => {
  Dragon.SetDragonSettings(dragonSettings);
  world.UpdateDragonColors();
  dragon.UpdateColors();
});
Dragon.SetDragonSettings(dragonSettings);

const chunkFolder = gui.addFolder('Islands 🏝️')
var chunkSettings = {
  maxHeight: 35,
  // clusterSize: 300,
  avgSize: 70,
  // landToAirRatio: 0.3,
  // perlinFrequency: 235,
  grassColor: 'rgb(0,100,0)',
  rockColor: 'rgb(100,100,100)',
}
chunkFolder.add(chunkSettings, 'maxHeight', 5, 100, 1);
// chunkFolder.add(chunkSettings, 'clusterSize', 10, 1000, 5);
chunkFolder.add(chunkSettings, 'avgSize', 10, 100, 5);
// chunkFolder.add(chunkSettings, 'landToAirRatio', 0, 0.75, 0.01);
// chunkFolder.add(chunkSettings, 'perlinFrequency', 100, 300, 5);
chunkFolder.addColor(chunkSettings, 'grassColor');
chunkFolder.addColor(chunkSettings, 'rockColor');

const vegetationFolder = gui.addFolder('Vegetation 🌱')
var vegetationSettings = {
  treeFrequency: 0.015,
  treeMinHeight: 5,
  treeMaxHeight: 15,
  treeMinWidth: 3,
  treeMaxWidth: 6,
  treeConeAmount: 3,
  treeColor: [0, 0.12, 0],

  grassFrequency: 0.25,
  grassSwaySpeed: 1,

  flowerFrequency: 0.25,
  flowerMinHeight: 5,
  flowerMaxHeight: 15,
}
BillboardVegetation.SetVegetationSettings(vegetationSettings);
vegetationFolder.add(vegetationSettings, 'treeFrequency', 0, .25, 0.005);
vegetationFolder.add(vegetationSettings, 'treeMinHeight', 5, 30, 0.5).listen().onChange(value => {
  if (value > vegetationSettings.treeMaxHeight)
    vegetationSettings.treeMaxHeight = value;
})
vegetationFolder.add(vegetationSettings, 'treeMaxHeight', 5, 30, 0.5).listen().onChange(value => {
  if (value < vegetationSettings.treeMinHeight)
    vegetationSettings.treeMinHeight = value;
})
vegetationFolder.add(vegetationSettings, 'treeMinWidth', 0.1, 20, 0.1).listen().onChange(value => {
  if (value > vegetationSettings.treeMaxWidth)
    vegetationSettings.treeMaxWidth = value;
})
vegetationFolder.add(vegetationSettings, 'treeMaxWidth', 0.1, 20, 0.1).listen().onChange(value => {
  if (value < vegetationSettings.treeMinWidth)
    vegetationSettings.treeMinWidth = value;
})
vegetationFolder.add(vegetationSettings, 'treeConeAmount', 1, 10, 1);
vegetationFolder.addColor(vegetationSettings, 'treeColor');
vegetationFolder.add(vegetationSettings, 'grassSwaySpeed', 0, 4, 0.05).onChange(value => {
  BillboardVegetation.SetVegetationSettings(vegetationSettings);
})
vegetationFolder.add(vegetationSettings, 'grassFrequency', 0, 1, 0.01);
vegetationFolder.add(vegetationSettings, 'flowerFrequency', 0, 1, 0.01);

vegetationFolder.add(vegetationSettings, 'flowerMinHeight', 2, 30, 0.5).listen().onChange(value => {
  if (value > vegetationSettings.flowerMaxHeight)
    vegetationSettings.flowerMaxHeight = value;
})
vegetationFolder.add(vegetationSettings, 'flowerMaxHeight', 2, 30, 0.5).listen().onChange(value => {
  if (value < vegetationSettings.flowerMinHeight)
    vegetationSettings.flowerMinHeight = value;
})


const worldFolder = gui.addFolder('World 🌎')
var worldSettings = {
  worldSize: 700,
  numOfClusters: 10,
  regenIslands: function() { 
    world.Destroy(scene);
    world = new World(scene, worldSettings, chunkSettings, vegetationSettings);
  }
}
worldFolder.add(worldSettings, 'worldSize', 100, 5000, 20); // min, max, step
worldFolder.add(worldSettings, 'numOfClusters', 0, 25, 1);
worldFolder.add(worldSettings, 'regenIslands');

var pixelSettings = {
  pixelSize: 1,
}
gui.add(pixelSettings, "pixelSize", 1, 10, .2).onChange(value => {
  renderPixelatedPass.setPixelSize( pixelSettings.pixelSize );
});

// ambient
const light = new THREE.AmbientLight( 0xFFFFFF , .6); // soft white light
scene.add( light );

// point light has been changed to direcitonal light. works better maaaaaybe????
const light2 = new THREE.PointLight( 0xFFFFFF, 1, 0);
// const light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.5, 0);
light2.position.set( 100,500,100);
light2.shadow.mapSize.width = 2048;
light2.shadow.mapSize.height = 2048;
light2.shadow.camera.near = 0.1; // default
light2.shadow.camera.far = 1000; // default
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
var world = new World(scene, worldSettings, chunkSettings, vegetationSettings);

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
  composer.render();
}
requestAnimationFrame(OnUpdate);

renderer.render(scene, camera);