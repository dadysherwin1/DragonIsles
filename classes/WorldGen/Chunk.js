import * as THREE from '../../modules/three.module.js';
import {Tree} from './Tree.js';
import {FlowerBed} from './FlowerBed.js';
import {Perlin} from './Perlin.js';

class Chunk{

    // configs
    static size = 300;
    static subd = 70;
    static islandFreq = .3; // [0, 1]
    static maxHeight = 35;
    static avgIslandSize = 235; // this is opposite

    static grassUVStretchMult = 4
    static rockUVStretchMult = 4

    // dont touch
    static killHeight = 1 - (Chunk.islandFreq * 2);

    constructor(pos)
    {
        this.pos = pos;
        this.perlin = new Perlin(Chunk.avgIslandSize);
        this.perlinFlower = new Perlin(Chunk.avgIslandSize);
        this.model = new THREE.Object3D();
        this.highestPoint = this.CreateIslands(this.pos);
        this.model.position.set(this.pos.x, this.pos.y, this.pos.z);
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

        function AddVertex(object, x, y) {
            var vertice = new THREE.Vector3(x, 0, y);
            var perlinHeight = object.GetPerlin(x,y);
            var rockHeight = 0

            // make island edges y=0, so it connects with the rocky underside
            if (object.GetPerlin(x-1, y) < Chunk.killHeight) {
                perlinHeight = Chunk.killHeight;
            }
            else if (object.GetPerlin(x+1, y) < Chunk.killHeight) {
                perlinHeight = Chunk.killHeight;
            }
            else if (object.GetPerlin(x, y-1) < Chunk.killHeight) {
                perlinHeight = Chunk.killHeight;
            }
            else if (object.GetPerlin(x, y+1) < Chunk.killHeight) {
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

            if (vertice.y > highestPoint.y) {
                highestPoint = vertice;
            }

            vertices.push(vertice.x, vertice.y, vertice.z);
            rockVertices.push(vertice.x, rockHeight,vertice.z)

            // set UV
            const u = x / Chunk.grassUVStretchMult;
            const v = y / Chunk.grassUVStretchMult;
            uvs.push(u,v);
        }

        // function VertexExists(x,y) {

        // }

        function getNeighbours(x, y) {
            var neighbours = [];
            neighbours.push(x-1,y);
            neighbours.push(x,y-1);
            neighbours.push(x+1,y);
            neighbours.push(x,y+1);
        }

        for (var x = 0; x < Chunk.subd; x++) {
            for (var y = 0; y < Chunk.subd; y++) {
                if (this.GetPerlin(x,y) < Chunk.killHeight) continue;

                // start breadth first search
                AddVertex(this, x,y);
                // const neighbours = []
                // neighbours.add()

                // break;
            }
        }
        

        // Randomly place tree and checks if tree would be on the edge of a chunk
        for (var i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i+1];
            const z = vertices[i+2];
            const pos = new THREE.Vector3(x,y,z);
            var perlinHeightFlo = this.perlinFlower.noise(x/Chunk.subd*Chunk.size, z/Chunk.subd*Chunk.size);
            if(Math.random() < (1/Chunk.subd) && y > 5)                
            {                                               
                this.model.add(new Tree(pos).model);  //Adds tree to chunk  
                // this.model.add(new FlowerBed(pos).model);
            }

            
            if (perlinHeightFlo < -0.5 && y > 0) {
                this.model.add(new FlowerBed(pos).model);
            }

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

        // material
        const grassMaterial = new THREE.MeshPhongMaterial(
        {
            // color: new THREE.Color(0,100/255,0),
            map : texture,
            normalMap : textureNormal,
            specularMap : textureSpecular,
            aoMap : textureAo
        }
        );
        const rockMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(50/255,50/255,50/255)});
        grassMaterial.side = THREE.FrontSide;
        rockMaterial.side = THREE.BackSide;
        
        // geometry
        grass.setIndex(indices);
        rock.setIndex(indices);
        grass.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        grass.setAttribute('uv', new THREE.Float32BufferAttribute(uvs,2));
        rock.setAttribute('uv', new THREE.Float32BufferAttribute(uvs,2));
        rock.setAttribute('position', new THREE.Float32BufferAttribute(rockVertices, 3));
        grass.computeVertexNormals();
        rock.computeVertexNormals();

        var grassMesh = new THREE.Mesh(grass, grassMaterial);
        var rockMesh = new THREE.Mesh(rock, rockMaterial); 
        this.model.add(grassMesh);
        this.model.add(rockMesh);

        highestPoint.add(pos);
        return highestPoint;
    }

}

export { Chunk };