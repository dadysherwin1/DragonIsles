import * as THREE from '../../modules/three.module.js';
// import { Perlin } from './Perlin.js';

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

        function IsPointInCircle(x,y,radius) {
            return Math.sqrt(Math.pow(x-radius,2) + Math.pow(y-radius,2)) <= radius;
        }

        // geometry
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const size = 100;
        const subd = 50;
        for (var x = 0; x < subd; x++) {
            for (var y = 0; y < subd; y++) {
                // if (Math.abs(x - 4.5) == 4.5 && Math.abs(y - 4.5) == 4.5) {
                //     continue;
                // }
                // if (x == 0 && y == 0) {
                //     continue;
                // }

                var vertice = new THREE.Vector3(x*size/subd, 0, y*size/subd);
                vertice.x -= size/2;
                vertice.z -= size/2;
                // if (IsPointInCircle(x,y,(subd-1)/2)) {
                //     // corner  vertice
                // }


                // if (IsPointInCircle(x-3, y-3,(subd)/3)) {
                    vertice.y = Math.random() * size/50 * yMultiplier; // inner vertice
                // }
                vertices.push(vertice.x, vertice.y, vertice.z);
            }
        }
        for (var x = 0; x < subd-1; x++) {
            for (var y = 0; y < subd-1; y++) {
                if (!IsPointInCircle(x,y,(subd-2)/2,0,0)) {
                    continue;
                }
                // if (x == 0 && y == 0) {
                //     continue;
                // }

                var Idx0=AccessGrid(x,y,subd);
                var Idx1=AccessGrid(x+1,y,subd);
                var Idx2=AccessGrid(x+1,y+1,subd);
                var Idx3=AccessGrid(x,y+1,subd);
                
                indices.push(Idx1, Idx0, Idx2);
                indices.push(Idx2, Idx0, Idx3);
            }
        }
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        // material
        const material = new THREE.MeshBasicMaterial({color: color});
        material.side = (yMultiplier >= 0 ? THREE.FrontSide : THREE.BackSide);
        // material.side = THREE.BackSide;
        
        // mesh
        var surface = new THREE.Mesh( geometry, material );
        surface.position.x = pos.x;
        surface.position.y = pos.y;
        surface.position.z = pos.z;
        return surface;
    }

}

export { Island };