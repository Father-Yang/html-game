/** @type {HTMLCanvasElement} */ // 类型注解，VSCode识别为HTMLCanvasElement
const canvas = document.getElementById('canvas1');

console.log(navigator.gpu);

// const ctx = canvas.getContext('2d');
// CANVAS_WIDTH = canvas.width = 500;
// CANVAS_HEIGHT = canvas.height = 700;

// const explosions = [];

// class Explosion{
//     constructor(x, y){
//         this.x = x;
//         this.y = y;
//         this.scale = 0.5;
//         this.spriteWidth = 200;
//         this.spriteHeight = 179;
//         this.width = this.spriteWidth * this.scale;
//         this.height = this.spriteHeight * this.scale;
//         this.image = new Image();
//         this.image.src = "boom.png";

//         this.frame = 0;
//     }

//     update(){
//         this.frame ++;
//     }

//     draw(){
//         ctx.drawImage(this.image, 
//             0, 0, this.width,this.height,
//             this.x, this.y, this.width,this.height);
//     }
// }

// const e1 = new Explosion(9,9);
// console.log(e1);
// e1.draw();