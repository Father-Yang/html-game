class Player {
    constructor(game){
        this.game = game;
        this.animationPlayer = new AnimationPlayer("player");
        this.stateMachine = new StateMachine();
        this.idleState = new PlayerIdleState(this, this.stateMachine);
        this.runState = new PlayerRunState(this, this.stateMachine);
        this.stateMachine.init(this.idleState);
    }
    update(deltaTime){
        this.stateMachine.currentState.update();
    }
    draw(context){
        this.animationPlayer.draw(context);
    }
    
    onGround(){
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }
    
}