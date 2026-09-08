// import { Dust, Fire, Splash } from "./particles.js";

const states = {
    SITTING:0,
    RUNNING:1,
    JUMPING:2,
    FALLING:3,
    ROLLING:4,
    DIVING:5,
    HIT:6
}

class State{
    constructor(state, game){
        this.state = state;
        this.game = game;
    }
}

class Sitting extends State{
    constructor(game){
        super("SITTING",game);
    }
    enter(){    
        this.game.player.maxFrame = 4;
        this.game.player.frameX = 0;
        this.game.player.frameY = 5;
    }
    handleInput(keys){
        if(keys.includes('a') || keys.includes('d')){
            this.game.player.setState(states.RUNNING, 1);
        }else if(keys.includes(' ')){
            this.game.player.setState(states.ROLLING, 2);
        }
    }
}

class Running extends State{
    constructor(game){
        super("RUNNING",game);
    }
    enter(){
        this.game.player.maxFrame = 8;
        this.game.player.frameX = 0;
        this.game.player.frameY = 3;   
    }
    handleInput(keys){
        //running状态生成dust离子
        this.game.particles.unshift(new Dust(this.game, this.game.player.x, this.game.player.y));

        if(keys.includes('s')){
            this.game.player.setState(states.SITTING, 0);
        }
        else if(keys.includes('w')){
            this.game.player.setState(states.JUMPING, 1);
        }
        else if(keys.includes(' ')){
            this.game.player.setState(states.ROLLING, 2);
        }
    }
}

class Jumping extends State{
    constructor(game){
        super("JUMPING",game);
    }
    enter(){
        this.game.player.maxFrame = 6;
        this.game.player.frameX = 0;
        this.game.player.frameY = 1;
        if(this.game.player.onGround()) this.game.player.vy -= 25;
    }
    handleInput(keys){
        if(this.game.player.vy > this.game.gravity){
            this.game.player.setState(states.FALLING, 1);
        }
        else if(keys.includes(' ')){
            this.game.player.setState(states.ROLLING, 2);
        }
        else if(keys.includes('s')){
            this.game.player.setState(states.DIVING, 0);
        }
    }
}

class Falling extends State{
    constructor(game){
        super("FALLING",game);
    }
    enter(){
        this.game.player.maxFrame = 6;
        this.game.player.frameX = 0;
        this.game.player.frameY = 2;
    }
    handleInput(keys){
        if(this.game.player.onGround()){
            this.game.player.setState(states.RUNNING, 1);
        }
        else if(keys.includes('s')){
            this.game.player.setState(states.DIVING, 0);
        }
    }
}

class Rolling extends State{
    constructor(game){
        super("ROLLING",game);
    }
    enter(){
        this.game.player.maxFrame = 6;
        this.game.player.frameX = 0;
        this.game.player.frameY = 6;
    }
    handleInput(keys){
        //rolling状态生成fire离子
        //unshift 从前面插入数组
        this.game.particles.unshift(new Fire(this.game, 
            this.game.player.x + this.game.player.width * 0.5, 
            this.game.player.y + this.game.player.height * 0.5));
        if(!keys.includes(' ') && this.game.player.onGround()){
            this.game.player.setState(states.RUNNING, 1);
        }
        else if(!keys.includes(' ') && !this.game.player.onGround()){
            this.game.player.setState(states.FALLING, 1);
        }
        else if(this.game.player.onGround() && keys.includes(' ') && keys.includes('w')){
            this.game.player.vy -= 25;
        }
        else if(keys.includes('s') && !this.game.player.onGround()){
            this.game.player.setState(states.DIVING, 0);
        }
    }
}

class Diving extends State{
    constructor(game){
        super("DIVING",game);
    }
    enter(){
        this.game.player.maxFrame = 6;
        this.game.player.frameX = 0;
        this.game.player.frameY = 6;
        this.game.player.vy = 15;
    }
    handleInput(keys){
        //rolling状态生成fire离子
        //unshift 从前面插入数组
        this.game.particles.unshift(new Fire(this.game, 
            this.game.player.x + this.game.player.width * 0.5, 
            this.game.player.y + this.game.player.height * 0.5));
        if(this.game.player.onGround()){
            for(let i = 0; i < 30; i++){
                this.game.particles.unshift(new Splash(this.game, 
                    this.game.player.x + this.game.player.width * 0.5, 
                    this.game.player.y + this.game.player.height));
            }
            this.game.player.setState(states.RUNNING, 1);
        }
        else if(keys.includes(' ') && this.game.player.onGround()){
            this.game.player.setState(states.ROLLING, 2);
        }
    }
}

class Hit extends State{
    constructor(game){
        super("HIT",game);
    }
    enter(){
        this.game.player.maxFrame = 10;
        this.game.player.frameX = 0;
        this.game.player.frameY = 4;
    }
    handleInput(keys){
        //当动画结束时自动切换状态
        if(this.game.player.frameX >= this.game.player.maxFrame){
            if(this.game.player.onGround()){
                this.game.player.setState(states.RUNNING, 1);
            }
            else{
                this.game.player.setState(states.FALLING, 1);
            }
        }         
    }
}