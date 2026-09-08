export class UI{
    constructor(game){
        this.game = game;
        this.fontSize = 30;
        this.fontFamily = "SuperHistories";
        this.livesImage = document.getElementById("lives");
    }
    draw(context){
        context.save();

        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = "white";
        context.shadowBlur = 0;

        context.font = this.fontSize + 'px ' + this.fontFamily;
        context.textAlign = "left";
        context.fillStyle = this.game.fontColor;
        //得分
        context.fillText("Score: " + this.game.score, 20, 50);

        context.font = this.fontSize * 0.8 + 'px ' + this.fontFamily;
        //计时
        context.fillText("Time: " + (this.game.time * 0.001).toFixed(1), 20, 80);

        for(let i=0; i< this.game.lives; i++){
            context.drawImage(this.livesImage, 20 * (i+1), 95, 25, 25);
        }

        if(this.game.gameOver){
            context.textAlign = "center";
            context.font = this.fontSize * 2 + 'px ' + this.fontFamily;
            if(this.game.score >= this.game.winScore){
                context.fillText("Boo-yah", this.game.width * 0.5, this.game.height * 0.5 - 30);

                context.font = this.fontSize * 0.7 + 'px ' + this.fontFamily;
                context.fillText("What are creatures of the night afraid of?", this.game.width * 0.5, this.game.height * 0.5);
            }
            else{
                context.fillText("Love at first bite?", this.game.width * 0.5, this.game.height * 0.5 - 30);

                context.font = this.fontSize * 0.7 + 'px ' + this.fontFamily;
                context.fillText("Noop. Better luck next time!", this.game.width * 0.5, this.game.height * 0.5);
            }    
        }

        context.restore();
    }
}