/**export default：把这个类作为模块的默认导出，别的文件可以 import 拿过来用。
导入使用（别的 js 文件）
import Player from './Player.js'

new 实例化
const p = new Player();
注意：default 导入的时候，名字可以随便写，不强制和原类名一样：*/
// import {Sitting, Running, Jumping, Falling, Rolling, Diving, Hit} from "./playerStates.js";
// import {CollisionAnimation} from "./collisionAnimation.js";
// import { FloatingMessage } from "./floatingMessage.js";

class Player {
    constructor(game){
        this.game = game;
        this.scale = 1;
        this.width = 100 * this.scale;
        this.height = 91.3 * this.scale;
        this.x = 0;
        //减去地面高度
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.image = document.getElementById('player');

        //帧率控制参数
        this.fps = 20;
        this.frameInterVal = 1000/this.fps;
        this.frameInterVal = 5;
        this.frameTimer = 0;//帧计时器

        //以下的动画循环帧，在各个state的enter方法中进行修改
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 5;

        this.speed = 0;
        this.maxSpeed = 10;
        this.vy = 0;

        this.states = [
            new Sitting(this.game), 
            new Running(this.game),
            new Jumping(this.game), 
            new Falling(this.game), 
            new Rolling(this.game),
            new Diving(this.game),
            new Hit(this.game)];

    }
    update(keys, deltaTime){
        this.checkCollision();
        //由当前状态处理控制输入
        //这样做的好处是在当前状态内只能对有限的key进行响应
        this.currentState.handleInput(keys);
        //横向移动
        this.x += this.speed;
        if(keys.includes('a') && this.currentState !== this.states[6] ) this.speed = -this.maxSpeed;
        else if (keys.includes('d') && this.currentState !== this.states[6]) this.speed = this.maxSpeed;
        else this.speed = 0;
        //横向边缘控制
        if(this.x < 0) this.x = 0;
        if(this.x > this.game.width - this.width) this.x = this.game.width - this.width;
        //纵向移动
        this.y += this.vy;
        if(!this.onGround()) this.vy += this.game.gravity;
        else this.vy = 0;
        //纵向边缘控制
        if(this.y > this.game.height - this.height - this.game.groundMargin) 
            this.y = this.game.height - this.height - this.game.groundMargin;
        //更新动画
        if(this.frameTimer >= this.frameInterVal){
            this.frameTimer = 0;
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        }
        else{
            this.frameTimer += deltaTime;
        }
    }
    draw(context){
        if(this.game.debug){
            context.strokeRect(this.x, this.y, this.width, this.height);

            context.font = '5 px';
            context.textAlign = "left";
            context.fillStyle = this.game.fontColor;
            context.fillText(this.currentState.state, this.x, this.y - 5);
        }
        context.drawImage(this.image, 
            this.frameX * this.width, this.frameY * this.height, this.width, this.height,
            this.x, this.y, this.width, this.height);
    }
    onGround(){
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }
    setState(state, speedScale){
        this.game.speed = speedScale * this.game.maxSpeed;
        this.currentState = this.states[state];
        this.currentState.enter();
    }
    //碰撞检测
    checkCollision(){
        this.game.enemies.forEach(enemy => {
            if(this.x + this.width > enemy.x 
            && this.x < enemy.x + enemy.width
            && this.y + this.height > enemy.y
            && this.y < enemy.y + enemy.height
             ){
                enemy.markedForDeletion = true;
                this.game.collisions.push(new CollisionAnimation(this.game, 
                    enemy.x + enemy.width * 0.5, 
                    enemy.y + enemy.height * 0.5));
                if(this.currentState instanceof Rolling
                || this.currentState instanceof Diving
                ){
                    this.game.floatingMessages.push(new FloatingMessage("+1", enemy.x, enemy.y, 30, 30));
                    this.game.score++ ;   
                }
                else{
                    this.game.lives -= 1;
                    if(this.game.lives > 0){
                        this.setState(6, 0);//切换到hit状态
                    }
                    else{
                        this.game.gameOver = true;
                    }
                }   
            }
        });
    }
}