class ParallaxBackground {
    constructor(game) {
        this.layers = [];
        [
            {image: "layer1", speed: 0.4, scale:2.5, loops:2, position:new Vector2(0,0)},      
            {image: "layer2", speed: 0.8, scale:1.5, loops:3, position:new Vector2(0,180)}    
        ].forEach(element => {
            this.layers.push({
                image: document.getElementById(element.image), 
                speed: element.speed,
                scale: element.scale,
                loops: element.loops,
                position: element.position,
                offsetX: 0
            } );
        });
        this.game = game;
    }

    update(deltaTime) {
       this.layers.forEach(layer => {
            layer.offsetX = this.game.camera.globalPosition.x * layer.speed;
       })
    }

    draw(context) {
        this.layers.forEach(layer => {
            for(let i=0;i<layer.loops;i++){
                const imgW = layer.image.width;
                const imgH = layer.image.height;
                console.log(layer.position.x + (i * imgW * layer.scale) - layer.offsetX);
                context.drawImage(layer.image, 
                    0, 0, imgW, imgH,
                    layer.position.x + Math.floor((i * imgW * layer.scale) - layer.offsetX), layer.position.y, imgW * layer.scale, imgH * layer.scale);

            }  
        });
    }
}