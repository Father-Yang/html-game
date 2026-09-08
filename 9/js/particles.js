class Particle {
    constructor(game){
        this.game = game;
        this.markedForDeletion = false;
    }
}

class Dust extends Particle{
    constructor(game, x, y){
        super(game);
        this.x = x;
        this.y = y;
        this.size = Math.random() * 10 + 1.5;
        this.speedX = -Math.random();
        this.speedY = -Math.random();
        this.color = "rgba(0, 0, 0, 0.3)";
    }
    update(){
        this.x += this.speedX - this.game.speed;
        this.y += this.speedY;
        this.size *= 0.95;
        if(this.size < 0.3) this.markedForDeletion = true;
    }
    draw(context){
        context.beginPath();
        context.arc(this.x + this.game.player.width * 0.6, this.y + this.game.player.height, this.size, 0, Math.PI * 2);
        context.color = this.color;
        context.fill();
    }
}

class Fire extends Particle{
    constructor(game, x, y){
        super(game);
        this.x = x;
        this.y = y;
        this.image = document.getElementById('fire');
        this.size = Math.random() * 100 + 50;
        this.speedX = 1;
        this.speedY = 1;

        this.angle = 0;
        this.va = Math.random() * 5;
    }
    update(){     
        this.size *= 0.95;
        if(this.size < 10) 
            this.markedForDeletion = true;
        else{
            this.x += this.speedX - this.game.speed;
            this.angle += this.va;
            this.x += Math.sin(this.angle * 10);
            this.y += this.speedY;
        }
    }
    draw(context){
        context.save();//保存状态，不做翻转
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.drawImage(this.image, -this.size * 0.7, -this.size * 0.7, this.size, this.size);
        context.restore();//恢复状态
    }
}

class Splash extends Particle{
     constructor(game, x, y){
        super(game);
        this.image = document.getElementById('fire');
        this.size = Math.random() * 100 + 50; // (100, 200)
        this.x = x - this.size * 0.4;
        this.y = y - this.size * 0.5;
        this.speedX = Math.random() * 6 - 3; // (-3, 3)
        this.speedY = Math.random() * 2 + 2; // (2, 4);

        this.gravity = 0;
    }
    update(){
        this.gravity += 0.1;
        this.y += this.gravity;
        this.x += this.speedX - this.game.speed;
        this.size *= 0.95;
        if(this.size < 5) this.markedForDeletion = true;
    }
    draw(context){
        context.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
}

