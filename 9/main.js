/** @type {HTMLCanvasElement} */ // 类型注解，VSCode识别为HTMLCanvasElement
// import {Player} from "./js/player.js";
// import { InputHandler } from "./js/input.js";
// import { Background } from "./js/background.js";
// import { FlyingEnemy,GroundEnemy,ClimbingEnemy } from "./js/enemies.js";
// import { UI } from "./js/ui.js";

window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');

    canvas.width = 900;
    canvas.height = 500;

    class Game {
        constructor(width, height){
            this.debug = false;

            this.gameOver = false;
            this.time = 0;
            this.maxTime = 1000 * 10;

            this.score = 0;
            this.winScore = 100;

            this.fontColor = "black";

            this.lives = 5;

            this.width = width;
            this.height = height;

            this.speed = 0;
            this.maxSpeed = 3;
            this.gravity = 1; // 游戏重力
            this.groundMargin = 80;

            this.background = new Background(this);
            this.ui = new UI(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);

            //保存生成敌人的数组
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 100;

            //生成的离子效果数组
            this.particles = []
            this.maxParticles = 150;

            //碰撞动画的数组
            this.collisions = [];

            //浮动消息数组
            this.floatingMessages = [];

            //这两行要等到player对象完全生成后再调用
            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
            
        }
        update(deltaTime){
            //计时
            this.time += deltaTime;
            if(this.time > this.maxTime) this.gameOver = true;

            this.background.update();
            //更新玩家状态
            this.player.update(this.input.keys, deltaTime);

            //生成敌人
            if (this.enemyTimer >= this.enemyInterval){
                this.enemyTimer = 0;
                this.addEnemy();
            }
            else{
                this.enemyTimer += deltaTime;
            }
            //更新敌人状态
            this.enemies.forEach(enemy => {
                enemy.update(deltaTime);
            });

            //更新浮动消息
            this.floatingMessages.forEach((message, index) => {
                message.update(deltaTime);
            });

            //更新离子状态
            if(this.particles.length > this.maxParticles) {
                this.particles.length = this.maxParticles; //限定离子个数
            } 
            this.particles.forEach((particle, index) => {
                particle.update();
            });  

            //更新碰撞动画
            this.collisions.forEach((collision, index) => {
                collision.update(deltaTime);
                if(collision.markedForDeletion) this.collisions.splice(index,1); 
            });
 

            this.enemies = this.enemies.filter(e => !e.markedForDeletion);
            this.floatingMessages = this.floatingMessages.filter(e => !e.markedForDeletion);
            this.particles = this.particles.filter(e => !e.markedForDeletion);
            this.collisions = this.collisions.filter(e => !e.markedForDeletion);
        }
        draw(context){
            this.background.draw(context);

            this.player.draw(context);

            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });

            this.particles.forEach(particle => {
                particle.draw(context);
            });

            this.collisions.forEach((collision) => {
                collision.draw(context);
            });

            this.floatingMessages.forEach((message) => {
                message.draw(context);
            });

            this.ui.draw(context);
        }
        addEnemy(){
            if (this.speed > 0 && Math.random() < 0.5)
                this.enemies.push(new GroundEnemy(this));
            else if(this.speed > 0)
                this.enemies.push(new ClimbingEnemy(this));
            this.enemies.push(new FlyingEnemy(this));  
        }
    }

    const game = new Game( canvas.width, canvas.height);

    let lastTime = 0;
    let timer = 0;
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        //console.log("deltaTime===:" + timer);   
        lastTime = timeStamp;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const fps = 1000 / 60.0;
        
        if(timer >= fps){   
            //console.log(timer);       
            game.update(timer);
            
            timer = 0;         
        }
        else{
            timer += deltaTime;
            //console.log("===:" + timer);   
        }
        game.draw(ctx);
        // 关闭像素平滑，需要每次刷新都设置
        //ctx.imageSmoothingEnabled = false;
        //ctx.mozImageSmoothingEnabled = false; //火狐兼容    
        if (!game.gameOver)
            requestAnimationFrame(animate);
    }
    animate(0);
});

