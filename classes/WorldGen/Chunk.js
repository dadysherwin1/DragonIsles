import * as THREE from '../../modules/three.module.js';
import {Tree} from './Tree.js';
import {Perlin} from './Perlin.js';

class Chunk{

    size = 500;
    subd = 200;
    islandFrequency = .25; // [0, 1]
    maxHeight = 50;
    perlin = new Perlin();

    killHeight = 1 - (this.islandFrequency * 2);
    constructor(pos)
    {
        this.model = new THREE.Object3D();
        this.CreateIslands(pos);
    }

    CreateIslands(pos) {
        const grass = new THREE.BufferGeometry();
        const rock = new THREE.BufferGeometry();
        const vertices = [];
        const rockVertices = [];
        const indices = [];

        // set vertices
        for (var x = 0; x < this.subd; x++) {
            for (var y = 0; y < this.subd; y++) {
                var vertice = new THREE.Vector3(x/this.subd*this.size, 0, y/this.subd*this.size);
                vertice.x -= this.size/2;
                vertice.z -= this.size/2;
                var unscaledHeight = this.perlin.noise(x, y)
                var rockHeight = -Math.random()*50
                if (unscaledHeight < this.killHeight) {  // bad vertice
                    vertice.y = -1;
                }
                else {  // good vertice
                    // scale up vertices to maxHeight
                    vertice.y = (unscaledHeight - this.killHeight) * (this.maxHeight/this.killHeight)
                    if (unscaledHeight - 0.03 < this.killHeight) {
                        rockHeight = vertice.y - 0.1 //-vertice.y //- (unscaledHeight - this.killHeight) * 50;
                    }
                    //Randomly place tree and checks if tree would be on the edge of a chunk
                    else if(Math.random() < (1/this.subd) && unscaledHeight -0.06 > this.killHeight)                
                    {                                               
                        this.model.add(new Tree(vertice).model);  //Adds tree to chunk  
                    }

                }

                vertices.push(vertice.x, vertice.y, vertice.z);
                rockVertices.push(vertice.x, rockHeight,vertice.z)
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
        for (var x = 0; x < this.subd-1; x++) {
            for (var y = 0; y < this.subd-1; y++) {
                var Idx0=AccessGrid(x,y,this.subd);
                var Idx1=AccessGrid(x+1,y,this.subd);
                var Idx2=AccessGrid(x+1,y+1,this.subd);
                var Idx3=AccessGrid(x,y+1,this.subd);

                var totalVertices = 0;
                if (ValidateVertice(Idx0)) {totalVertices++;}
                if (ValidateVertice(Idx1)) {totalVertices++;}
                if (ValidateVertice(Idx2)) {totalVertices++;}
                if (ValidateVertice(Idx3)) {totalVertices++;}

                if (totalVertices == 4) {
                    indices.push(Idx1, Idx0, Idx2);
                    indices.push(Idx2, Idx0, Idx3);
                }
                else if (totalVertices == 3) {
                    if (ValidateTriangle(Idx0, Idx1, Idx2)) {
                        indices.push(Idx0, Idx1, Idx2);
                    }
                    if (ValidateTriangle(Idx1, Idx2, Idx3)) {
                        indices.push(Idx1, Idx2, Idx3);
                    }
                    if (ValidateTriangle(Idx2, Idx3, Idx0)) {
                        indices.push(Idx2, Idx3, Idx0);
                    }
                    if (ValidateTriangle(Idx3, Idx0, Idx1)) {
                        indices.push(Idx3, Idx0, Idx1);
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
        grassMesh.position.x = pos.x;
        grassMesh.position.y = pos.y;
        grassMesh.position.z = pos.z;
        var rockMesh = new THREE.Mesh(rock, rockMaterial);
        rockMesh.position.x = pos.x;
        rockMesh.position.y = pos.y;
        rockMesh.position.z = pos.z;

        this.model.add(grassMesh);
        this.model.add(rockMesh);
    }

}

export { Chunk };