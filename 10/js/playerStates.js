//状态机
class StateMachine{
    constructor(){
        this.currentState;
    }
    init(state){
        this.currentState = state;
        this.currentState.enter();
    }
    change(state){
        this.currentState.exit();
        this.currentState = state;
        this.currentState.enter();
    }
    update(deltaTime){
        this.currentState.update(deltaTime);
    }
}
//状态
class State{
    constructor(player, stateMachine, stateName){
        this.player = player;
        this.stateMachine = stateMachine;
        this.stateName = stateName;
    }
    enter(){
        console.log(this.stateName + ":enter");  
    }
    update(deltaTime){
        console.log(this.stateName + ":update");  
        if(Input.isKeyDown("q")) {
            this.stateMachine.change(this.player.dashState);
        }
    }
    exit(){
        console.log(this.stateName + ":exit");  
    }
}   

class PlayerIdleState extends State{
    constructor(player, stateMachine){
        super(player, stateMachine, "Idle");
    }
    enter(){    
        super.enter();
        this.player.animationPlayer.play("Idle");
    }
    update(deltaTime){
        super.update(deltaTime);
        this.player.animationPlayer.update(deltaTime);
        if(Input.getVector().x !== 0){
            this.stateMachine.change(this.player.runState);
        }
    }
    exit(){
        super.exit();
    }

}

class PlayerRunState extends State{
    constructor(player, stateMachine){
        super(player, stateMachine, "Run");
    }
    enter(){    
        super.enter();
        this.player.animationPlayer.play("Run");
    }
    update(deltaTime){
        super.update(deltaTime);
        this.player.animationPlayer.update(deltaTime);
        if(Input.getVector().x === 0){
            this.stateMachine.change(this.player.idleState);
        }   
    }
    exit(){
        super.exit();
    }

}

class PlayerDashState extends State{
    constructor(player, stateMachine){
        super(player, stateMachine, "Dash");
    }
    enter(){    
        super.enter();
        this.stateTimer = 0.5 * 1000;
        this.player.animationPlayer.play("Dash");
    }
    update(deltaTime){
        super.update(deltaTime);
        this.player.animationPlayer.update(deltaTime);
        this.stateTimer -= deltaTime;
        if(this.stateTimer <= 0){
            this.stateMachine.change(this.player.idleState);
        }
    }
    exit(){
        super.exit();
        this.stateTimer = 0.5 * 1000;
    }

}
