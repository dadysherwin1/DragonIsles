import * as THREE from '../../modules/three.module.js';
import {Tree} from './Tree.js';
import {Perlin} from './Perlin.js';

class Chunk{

    // configs
    static size = 400;
    static subd = 100;
    static islandFreq = .3; // [0, 1]
    static maxHeight = 50;
    static avgIslandSize = 350;

    // dont touch
    static killHeight = 1 - (Chunk.islandFreq * 2);

    constructor(pos)
    {
        this.pos = pos;
        this.perlin = new Perlin(Chunk.avgIslandSize);

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

        // keep regening until there's good islands
        while (true) {
            var goodIslands = true;

            for (var x = 0; x < Chunk.subd; x++) {
                if (!goodIslands) {
                    break;
                }
                for (var y = 0; y < Chunk.subd; y++) {
                    var vertice = new THREE.Vector3(x/Chunk.subd*Chunk.size, 0, y/Chunk.subd*Chunk.size);
                    vertice.x -= Chunk.size/2;
                    vertice.z -= Chunk.size/2;
                    var perlinHeight = this.GetPerlin(x,y);
                    var rockHeight = 0
                    if (perlinHeight < Chunk.killHeight) {
                        // bad vertice
                        vertice.y = -1;
                    }
                    else if (x == 0 || y == 0 || x == Chunk.subd-1 || y == Chunk.subd-1) {
                        // a vertice is on the edge of the chunk, meaning an island got sliced!
                        // time to regen
                        goodIslands = false;
                        this.perlin = new Perlin(Chunk.avgIslandSize);
                        break;
                    }
                    else { 
                        // good vertice

                        // make island edges y=0, so it connects with the rocky underside
                        if (this.GetPerlin(x-1, y) < Chunk.killHeight) {
                            perlinHeight = Chunk.killHeight;
                        }
                        else if (this.GetPerlin(x+1, y) < Chunk.killHeight) {
                            perlinHeight = Chunk.killHeight;
                        }
                        else if (this.GetPerlin(x, y-1) < Chunk.killHeight) {
                            perlinHeight = Chunk.killHeight;
                        }
                        else if (this.GetPerlin(x, y+1) < Chunk.killHeight) {
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
                }
            }
        
            // if the islands are good, break the loop
            if (goodIslands) {
                break;
            }
            // otherwise, regen the islands
            else {
                vertices = [];
                rockVertices = [];
            }
        }

        // Randomly place tree and checks if tree would be on the edge of a chunk
        for (var i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i+1];
            const z = vertices[i+2];
            const pos = new THREE.Vector3(x,y,z);
            if(Math.random() < (1/Chunk.subd) && y > 5)                
            {                                               
                this.model.add(new Tree(pos).model);  //Adds tree to chunk  
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

                // 2 triangles
                if (totalVertices == 4) {
                    indices.push(Idx1, Idx0, Idx2);
                    indices.push(Idx2, Idx0, Idx3);
                }
                // 1 triangle
                else if (totalVertices == 3) {
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
            }
        }

        // material
        const grassMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color(0,100/255,0)});
        const rockMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color(50/255,50/255,50/255)});
        grassMaterial.side = THREE.FrontSide;
        rockMaterial.side = THREE.BackSide;
        
        // mesh
        grass.setIndex(indices);
        rock.setIndex(indices);
        grass.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        rock.setAttribute('position', new THREE.Float32BufferAttribute(rockVertices, 3));
        var grassMesh = new THREE.Mesh(grass, grassMaterial);
        var rockMesh = new THREE.Mesh(rock, rockMaterial);

        this.model.add(grassMesh);
        this.model.add(rockMesh);

        return highestPoint;
    }

}

export { Chunk };