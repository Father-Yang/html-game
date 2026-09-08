const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 800;
const CANVAS_HEIGHT = canvas.height = 700;

let gameSpeed = 10;


const bgLayer1 = new Image();
bgLayer1.src = 'layer-1.png';
const bgLayer2 = new Image();
bgLayer2.src = 'layer-2.png';
const bgLayer3 = new Image();
bgLayer3.src = 'layer-3.png';
const bgLayer4 = new Image();
bgLayer4.src = 'layer-4.png';
const bgLayer5 = new Image();
bgLayer5.src = 'layer-5.png';

window.addEventListener('load',function(){

    const slider = document.getElementById('slider');
    slider.value = gameSpeed;
    const showGameSpeed = document.getElementById('showGameSpeed');
    showGameSpeed.innerHTML = gameSpeed;
    slider.addEventListener('change',(e)=>{
        showGameSpeed.innerHTML = gameSpeed = e.target.value;
    })

    //类
    class Layer {
        constructor(image, speedModifier){
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 700;
            
            this.image = image;
            this.speedModifier = speedModifier;
            this.speed = gameSpeed * this.speedModifier;
        }
        update(){
            this.speed = gameSpeed * this.speedModifier;
            if(this.x <= -this.width){
                this.x = 0;
            }

            this.x = Math.floor(this.x - this.speed);//Math.floor 向下取整
        }

        draw(){
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
        }
    }

    const layer1 = new Layer(bgLayer1, 0.2);
    const layer2 = new Layer(bgLayer2, 0.4);
    const layer3 = new Layer(bgLayer3, 0.6);
    const layer4 = new Layer(bgLayer4, 0.8);
    const layer5 = new Layer(bgLayer5, 1);

    const gameObjects = [layer1, layer2, layer3, layer4, layer5];

    function animate(){
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);//清除屏幕上的残留
        gameObjects.forEach(object => {
            object.update();
            object.draw();
        })
        requestAnimationFrame(animate);
    }

    animate();
})

