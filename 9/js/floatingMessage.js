export class FloatingMessage{
    constructor(value, x, y, targetX, targetY){
        this.value = value;
        this.x = x;
        this.y = y;
        this.targetX = 100;
        this.targetY = 50;
        this.markedForDeletion = false;
        this.timer = 0;
    }
    update(deltaTime){
        this.x += (this.targetX - this.x) * 0.3;
        this.y += (this.targetY - this.y) * 0.3;
        this.timer++;
        if(this.timer > 10) this.markedForDeletion = true;
    }
    draw(context){
        context.save();

        context.font = "30px SuperHistories";
        context.fillStyle = "white";
        context.fillText(this.value, this.x, this.y);
        context.fillStyle = "black";
        context.fillText(this.value, this.x + 2, this.y + 2);

        context.restore();
    }
}