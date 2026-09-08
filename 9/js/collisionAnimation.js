class CollisionAnimation {
    constructor(game, x, y){
        this.game = game;

        this.image = document.getElementById("boom");
        this.spriteWidth = 100;
        this.spriteHeight = 100;
        this.sizeModifer = Math.random() + 0.5;
        this.width = this.spriteWidth * this.sizeModifer;
        this.height = this.spriteHeight * this.sizeModifer;

        this.x = x - this.width * 0.5;
        this.y = y - this.height * 0.5;

        this.frameX = 0;
        this.maxFrame = 4;
        this.markedForDeletion = false;

        this.fps = Math.random();
        this.frameInterval = 0;
        this.frameTimer = 0;
    }
    update(deltaTime){
        this.x -= this.game.speed;
        if(this.frameTimer >= this.frameInterval){
            this.frameTimer = 0;
            this.frameX ++ ;
        }
        else{
            this.frameTimer += deltaTime;
        }
        if(this.frameX > this.maxFrame) this.markedForDeletion = true;

    }
    draw(context){
        context.drawImage(this.image, 
            this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight,
            this.x, this.y, this.width, this.height);
    }
}