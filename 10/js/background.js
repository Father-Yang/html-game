class ParallaxBackground {
    constructor(camera) {
        this.layers = [];
        [{image: "layer1", speed: 0.01, scale:2.5, position:new Vector2(0,-30)},      
         {image: "layer2", speed: 0.1, scale:2.5, position:new Vector2(0,80)}    
        ].forEach(element => {
            const image = document.getElementById(element.image);
            this.layers.push({
                image: image, 
                width: image.width,
                height:image.height,
                speed: element.speed,
                scale: element.scale,
                positions: [
                    new Vector2(Math.floor(element.position.x - image.width * element.scale), element.position.y),
                    new Vector2(element.position.x, element.position.y),
                    new Vector2(Math.floor(element.position.x + image.width * element.scale), element.position.y) 
                ],
            });
        });

        this.camera = camera;
        this.lastCameraPosition = camera.globalPosition.clone();
            
    }

    update(deltaTime) {      
        const distanceToMove = this.camera.globalPosition.sub(this.lastCameraPosition);
        
        if(distanceToMove.x === 0 && distanceToMove.y === 0) return;
        this.lastCameraPosition = this.camera.globalPosition.clone();

        const cameraLeftEdge = this.camera.globalPosition.x;
        const cameraRightEdge = this.camera.globalPosition.x + this.camera.width; 
        
        this.layers.forEach(layer => {
            const offset = new Vector2(distanceToMove.x * layer.speed, distanceToMove.y * layer.speed);
            layer.positions.forEach(p=>{
                p.subEqual(offset);
            })

            let imageRightEdge = layer.positions[2].x + 0.5 * layer.image.width * layer.scale;
            let imageLeftEdge = layer.positions[1].x - 0.5 * layer.image.width * layer.scale;  
            if(cameraRightEdge > imageRightEdge){
                layer.positions.push(new Vector2(
                    layer.positions[2].x + Math.floor(layer.image.width * layer.scale),
                    layer.positions[2].y));
            
                layer.positions.shift();
            }else if(cameraLeftEdge < imageLeftEdge){
                layer.positions.unshift(new Vector2(
                layer.positions[0].x - Math.floor(layer.image.width * layer.scale),
                layer.positions[0].y));

                layer.positions.pop();
            }
        });
    }

    draw(context) {
        this.layers.forEach(layer => {
            layer.positions.forEach(position => {
                
                context.drawImage(layer.image, 
                    0, 0, layer.width, layer.height,
                    position.x , position.y , layer.width * layer.scale, layer.height * layer.scale);
            })
            // console.log(layer.positions[0].x , layer.positions[1].x , layer.positions[2].x);
        });
    }
}