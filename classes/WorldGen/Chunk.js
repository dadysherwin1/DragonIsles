import * as THREE from '../../modules/three.module.js';
import {Tree} from './Tree.js';
import {FlowerBed} from './FlowerBed.js';
import {BillboardVegetation} from './BillboardVegetation.js';
import {Perlin} from './Perlin.js';

class Chunk{

    // configs
    static size = 300;
    static subd = 70;
    static islandFreq = .3; // [0, 1]
    static maxHeight = 35;
    static avgIslandSize = 235; // this is opposite

    static grassColor;
    static rockColor;
    static treeFrequency;
    static flowerFrequency;
    static grassFrequency;

    static killHeight = 1 - (Chunk.islandFreq * 2);
    static perlinVegetation = new Perlin(Chunk.avgIslandSize);

    constructor(pos)
    {
        this.pos = pos;
        this.perlin = new Perlin(Chunk.avgIslandSize);
        this.perlinFlower = new Perlin(Chunk.avgIslandSize);
        this.model = new THREE.Object3D();
        this.highestPoint = this.CreateIslands(this.pos);
        this.model.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.boundingSphere; // use this for dragon orbits
    }

    static ChangeSettings(chunkSettings, vegetationSettings) {
        // Chunk.size = chunkSettings.clusterSize;
        Chunk.subd = chunkSettings.avgSize;
        // Chunk.islandFreq = chunkSettings.landToAirRatio;
        // Chunk.avgIslandSize = chunkSettings.perlinFrequency;
        Chunk.maxHeight = chunkSettings.maxHeight;
        // Chunk.killHeight = 1 - (Chunk.islandFreq * 2);
        Chunk.grassColor = chunkSettings.grassColor;
        Chunk.rockColor = chunkSettings.rockColor;

        Chunk.treeFrequency = vegetationSettings.treeFrequency;
        Chunk.flowerFrequency = vegetationSettings.flowerFrequency;
        Chunk.grassFrequency = vegetationSettings.grassFrequency;
    }

    GetPerlin(x, y) {
        return this.perlin.noise(x/Chunk.subd*Chunk.size, y/Chunk.subd*Chunk.size);
    }

    CreateIslands(pos) {
        const grass = new THREE.BufferGeometry();
        const rock = new THREE.BufferGeometry();
        var vertices = [];
        var rockVertices = [];
        const indices = [];
        var highestPoint = new THREE.Vector3(0,0,0);
        var uvs = [];

        var minPos = new THREE.Vector3(999,0,999)
        var maxPos = new THREE.Vector3(-999,1,-999)
        function UpdateBoundingBox(x, z) {
            if (x < minPos.x) minPos.x = x;
            if (x > maxPos.x) maxPos.x = x;
            if (z < minPos.z) minPos.z = z;
            if (z > maxPos.z) maxPos.z = z;
        }

        // keep regening until there's good islands
        while (true) {
            var goodIslands = true;

            for (var x = 0; x < Chunk.subd; x++) {
                if (!goodIslands) {
                    break;
                }
                for (var z = 0; z < Chunk.subd; z++) {
                    var vertice = new THREE.Vector3(x*Chunk.size/Chunk.subd, 0, z*Chunk.size/Chunk.subd);
                    vertice.x -= Chunk.size/2;
                    vertice.z -= Chunk.size/2;
                    var perlinHeight = this.GetPerlin(x,z);
                    var rockHeight = 0
                    if (perlinHeight < Chunk.killHeight) {
                        // bad vertice
                        vertice.y = -1;
                    }
                    else if (x == 0 || z == 0 || x == Chunk.subd-1 || z == Chunk.subd-1) {
                        // a vertice is on the edge of the chunk, meaning an island got sliced!
                        // time to regen
                        goodIslands = false;
                        this.perlin = new Perlin(Chunk.avgIslandSize);
                        break;
                    }
                    else { 
                        // good vertice
                        UpdateBoundingBox(vertice.x,vertice.z);

                        // make island edges y=0, so it connects with the rocky underside
                        if (this.GetPerlin(x-1, z) < Chunk.killHeight) {
                            perlinHeight = Chunk.killHeight;
                        }
                        else if (this.GetPerlin(x+1, z) < Chunk.killHeight) {
                            perlinHeight = Chunk.killHeight;
                        }
                        else if (this.GetPerlin(x, z-1) < Chunk.killHeight) {
                            perlinHeight = Chunk.killHeight;
                        }
                        else if (this.GetPerlin(x, z+1) < Chunk.killHeight) {
                            perlinHeight = Chunk.killHeight;
                        }

                        // scale up vertices to maxHeight
                        vertice.y = perlinHeight - Chunk.killHeight; // 
                        vertice.y *= Chunk.maxHeight/(1-Chunk.killHeight); // [0, Chunk.maxHeight]

                        // set rock vertice position
                        if (vertice.y > 0) {
                            rockHeight = -vertice.y * 1.8; // flip grass
                            rockHeight *= Math.random() * .8 + 0.6; // add spikes
                            // rockHeight = -vertice.y * 1.8 + (Math.random() * 18 - 9);
                        }

                        
                    }

                    if (vertice.y > highestPoint.y) {
                        highestPoint = vertice;
                    }

                    vertices.push(vertice.x, vertice.y, vertice.z);
                    rockVertices.push(vertice.x, rockHeight,vertice.z)

                    // set UV
                    const u = x / 4;
                    const v = z / 4;
                    uvs.push(u,v);
                }
            }
        
            // if the islands are good, break the loop
            if (goodIslands) {
                break;
            }
            // otherwise, regen the islands
            else {
                highestPoint = new THREE.Vector3(0,0,0);
                vertices = [];
                rockVertices = [];
                uvs = [];
                minPos = new THREE.Vector3(999,0,999)
                maxPos = new THREE.Vector3(-999,1,-999)
            }
        }

        // Randomly place tree and checks if tree would be on the edge of a chunk
        for (var i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i+1];
            const z = vertices[i+2];
            const pos = new THREE.Vector3(x,y,z);
            var perlinHeightFlo = this.perlinFlower.noise(x/Chunk.subd*Chunk.size, z/Chunk.subd*Chunk.size);
            var perlinHeightVegetation = Chunk.perlinVegetation.noise(x/Chunk.subd*Chunk.size, z/Chunk.subd*Chunk.size);
            if(Math.random() < Chunk.treeFrequency * 70/Chunk.subd && y > 5)                                                          
                this.model.add(new Tree(pos).model);  //Adds tree to chunk  
            else if (perlinHeightVegetation < Chunk.grassFrequency*2-1  && y > 0)
            // else if(Math.random() < Chunk.grassFrequency * 70/Chunk.subd && y > 5) 
                this.model.add(new BillboardVegetation(pos).model);
            else if (perlinHeightFlo < Chunk.flowerFrequency*2-1 && y > 0)
            // else if(Math.random() < Chunk.flowerFrequency * 70/Chunk.subd && y > 5)   
                this.model.add(new FlowerBed(pos).model);

        }

        // set faces
        function AccessGrid(x,y,subd) {
            return x*subd+y;
        }
        function ValidateVertice(index) {
            return vertices[index*3+1] >= 0;
        }
        function ValidateTriangle(index1, index2, index3) {
            return vertices[index1*3+1] >= 0 && vertices[index2*3+1] >= 0 && vertices[index3*3+1] >= 0;
        }
        for (var x = 0; x < Chunk.subd-1; x++) {
            for (var y = 0; y < Chunk.subd-1; y++) {
                var Idx0=AccessGrid(x,y,Chunk.subd);
                var Idx1=AccessGrid(x+1,y,Chunk.subd);
                var Idx2=AccessGrid(x+1,y+1,Chunk.subd);
                var Idx3=AccessGrid(x,y+1,Chunk.subd);

                var totalVertices = 0;
                if (ValidateVertice(Idx0)) {totalVertices++;}
                if (ValidateVertice(Idx1)) {totalVertices++;}
                if (ValidateVertice(Idx2)) {totalVertices++;}
                if (ValidateVertice(Idx3)) {totalVertices++;}

                // add faces
                if (totalVertices == 4) {
                    // 2 triangles
                    indices.push(Idx1, Idx0, Idx2);
                    indices.push(Idx2, Idx0, Idx3);
                }
                else if (totalVertices == 3) {
                    // 1 triangle
                    if (ValidateTriangle(Idx0, Idx1, Idx2)) {
                        indices.push(Idx2, Idx1, Idx0);
                    }
                    if (ValidateTriangle(Idx1, Idx2, Idx3)) {
                        indices.push(Idx3, Idx2, Idx1);
                    }
                    if (ValidateTriangle(Idx2, Idx3, Idx0)) {
                        indices.push(Idx0, Idx3, Idx2);
                    }
                    if (ValidateTriangle(Idx3, Idx0, Idx1)) {
                        indices.push(Idx1, Idx0, Idx3);
                    }
                }

                // set UVs
                // const u = x % 2 / 4; // 0 or 1
                // const v = y % 2 / 4; // 0 or 1
                // const u = 
                // uvs.push(u,v);
            }
        }

        // load textures
        var repeatNum = new THREE.Vector2(5, 5);

        var texture = new THREE.TextureLoader().load("../../assets/grass/Grass_Texture_2_1K_Diff.jpg");
        // var texture = new THREE.TextureLoader().load("../../assets/grass/test_texture.jpeg");
        texture.repeat = repeatNum;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        var textureNormal = new THREE.TextureLoader().load("../../assets/grass/Grass_Texture_1K_Nrml.jpg");
        textureNormal.repeat = repeatNum;
        textureNormal.wrapS = THREE.RepeatWrapping;
        textureNormal.wrapT = THREE.RepeatWrapping;

        var textureSpecular = new THREE.TextureLoader().load("../../assets/grass/Grass_Texture_1K_Spec.jpg");
        textureSpecular.repeat = repeatNum;
        textureSpecular.wrapS = THREE.RepeatWrapping;
        textureSpecular.wrapT = THREE.RepeatWrapping;

        var textureAo = new THREE.TextureLoader().load("../../assets/grass/Grass_Texture_1K_AO.jpg");
        textureAo.repeat = repeatNum;
        textureAo.wrapS = THREE.RepeatWrapping;
        textureAo.wrapT = THREE.RepeatWrapping;

        //loads the gradiant maps for toonshader
        const threeTone = new THREE.TextureLoader().load('../../assets/gradientMaps/threeTone.jpg')
        threeTone.minFilter = THREE.NearestFilter
        threeTone.magFilter = THREE.NearestFilter

        const fourTone = new THREE.TextureLoader().load('../../assets/gradientMaps/fourTone.jpg')
        fourTone.minFilter = THREE.NearestFilter
        fourTone.magFilter = THREE.NearestFilter

        const fiveTone = new THREE.TextureLoader().load('../../assets/gradientMaps/fiveTone.jpg')
        fiveTone.minFilter = THREE.NearestFilter
        fiveTone.magFilter = THREE.NearestFilter


        // material
        const grassMaterial = new THREE.MeshToonMaterial(
        {
            color: Chunk.grassColor,

            // commented cause we want a cartoony art style
            // map : texture,
            // normalMap : textureNormal,
            // specularMap : textureSpecular,
            // aoMap : textureAo
        }
        );
        const rockMaterial = new THREE.MeshToonMaterial({color: Chunk.rockColor});
        grassMaterial.side = THREE.FrontSide;
        grassMaterial.gradientMap = fiveTone;
        rockMaterial.side = THREE.BackSide;
        rockMaterial.gradientMap = fiveTone;
        
        // geometry
        grass.setIndex(indices);
        rock.setIndex(indices);
        grass.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        grass.setAttribute('uv', new THREE.Float32BufferAttribute(uvs,2));
        rock.setAttribute('uv', new THREE.Float32BufferAttribute(uvs,2));
        rock.setAttribute('position', new THREE.Float32BufferAttribute(rockVertices, 3));
        grass.computeVertexNormals();
        rock.computeVertexNormals();

        // bounding sphere for dragon orbit
        this.boundingSphere = new THREE.Sphere();
        this.boundingSphere.setFromPoints([minPos, maxPos])
        this.boundingSphere.translate(pos);
        this.boundingSphere.translate(new THREE.Vector3(-highestPoint.y/2.0));
        // uncomment this to show the bounding sphere
        // var geometry = new THREE.SphereGeometry(this.boundingSphere.radius); 
        // var material = new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true } ); 
        // var sphere = new THREE.Mesh( geometry, material );
        // sphere.position.set(this.boundingSphere.center.x, this.boundingSphere.center.y, this.boundingSphere.center.z);
        // this.model.add(sphere);


        var grassMesh = new THREE.Mesh(grass, grassMaterial);
        var rockMesh = new THREE.Mesh(rock, rockMaterial); 
        grassMesh.castShadow = true; 
        grassMesh.receiveShadow = true; 
        rockMesh.castShadow = true; 
        rockMesh.receiveShadow = true; 
        this.model.add(grassMesh);
        this.model.add(rockMesh);

        highestPoint.add(pos);
        return highestPoint;
    }

    Destroy(scene) {
        scene.remove(this.model);
    }

}

export { Chunk };