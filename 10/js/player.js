class Player {
    constructor(){
        this.stateMachine = new StateMachine();
        this.stateMachine.init(new PlayerIdleState(this.stateMachine));
    }
    update(deltaTime){
        this.stateMachine.currentState.update();
    }
    draw(context){
      
    }
    
    onGround(){
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }
    
}