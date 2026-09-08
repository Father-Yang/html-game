const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
// console.log(ctx);

const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;

const playerImage = new Image();
playerImage.src = 'shadow_dog.png';
const spriteWidth = 575;//sprite宽
const spriteHeight = 523;//sprite高

let playerState = "idle";
const dropdown = document.getElementById('animations');
dropdown.addEventListener('change', function(e){
    playerState = e.target.value;
})

let gameFrame = 0;
const staggerFrames = 10;//帧数控制变量

const animationStates = [
    {name:'idle',frames:'7'},
    {name:'jump',frames:'7'},
    {name:'fall',frames:'7'},
    {name:'run',frames:'9'},
    {name:'dizzy',frames:'11'},
    {name:'sit',frames:'5'},
    {name:'roll',frames:'7'},
    {name:'bite',frames:'7'},
    {name:'ko',frames:'12'},
    {name:'getHit',frames:'4'}
]

const spriteAnimations = []; //创建一个map，保存key-value,name:frames
//state 是数组中元素， index 是索引编号
animationStates.forEach((state, index)=>{
    let frames = {loc:[],}
    for(let j = 0;j< state.frames; j++){
        let positionX = j * spriteWidth;
        let positionY = index * spriteHeight;
        frames.loc.push({x:positionX, y:positionY})
    }
    spriteAnimations[state.name] = frames;
})

function animate(){
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // ctx.fillRect(50, 50, 100, 100);
    // ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    let position = Math.floor(gameFrame / staggerFrames) % spriteAnimations[playerState].loc.length;
    let frameX = spriteWidth * position;
    let frameY = spriteAnimations[playerState].loc[position].y;
    ctx.drawImage(playerImage, 
        frameX, frameY, spriteWidth, spriteHeight, 
        0, 0, spriteWidth, spriteHeight);
    
    // if (gameFrame % staggerFrames == 0){
    //     frameX++;
    //     if (frameX > 6) frameX = 0;
    // }
    gameFrame ++;
    requestAnimationFrame(animate);//调用一帧，循环
}

animate();