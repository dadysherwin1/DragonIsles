import * as THREE from '../../modules/three.module.js';

class Island {

    constructor(pos)
    {
        const geometry = new THREE.BoxGeometry( 50, 50, 50 );
        const material = new THREE.MeshMatcapMaterial();

        this.model = new THREE.Mesh( geometry, material );
        this.model.position.x = pos.x;
        this.model.position.y = pos.y;
        this.model.position.z = pos.z;
    }  

    GetIsland() 
    {
        return this.model;
    }

}

export { Island };