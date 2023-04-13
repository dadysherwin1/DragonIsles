import * as THREE from '../../modules/three.module.js';

class Island {

    constructor(pos)
    {
        this.top = this.MakeIslandSurface(new THREE.Color(0,100/255,0), pos, 2); // grass
        this.bottom = this.MakeIslandSurface(new THREE.Color(50/255,50/255,50/255), pos, -5); // rock
    }

    MakeIslandSurface(color, pos, yMultiplier) {

        function AccessGrid(x,y,subd)
        {
            return x*subd+y;
        }

        // geometry
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const size = 10;
        const subd = 10;
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                var vertice = new THREE.Vector3(i*size, 0, j*size);
                vertice.x -= size/2;
                vertice.z -= size/2;
                if (i != 0 && i != 9 && j != 0 && j != 9) {
                    vertice.y = Math.random() * size * yMultiplier;
                }
                vertices.push(vertice.x, vertice.y, vertice.z);
            }
        }
        for (var i = 0; i < 10-1; i++) {
            for (var j = 0; j < 10-1; j++) {
                var Idx0=AccessGrid(i,j,subd);
                var Idx1=AccessGrid(i+1,j,subd);
                var Idx2=AccessGrid(i+1,j+1,subd);
                var Idx3=AccessGrid(i,j+1,subd);
                
                indices.push(Idx1, Idx0, Idx2);
                indices.push(Idx2, Idx0, Idx3);
            }
        }
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        // material
        const material = new THREE.MeshBasicMaterial({color: color});
        material.side = (yMultiplier >= 0 ? THREE.FrontSide : THREE.BackSide);
        
        // mesh
        var surface = new THREE.Mesh( geometry, material );
        surface.position.x = pos.x;
        surface.position.y = pos.y;
        surface.position.z = pos.z;
        return surface;
    }

}

export { Island };