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
    update(){
        this.currentState.update();
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
    update(){
        console.log(this.stateName + ":update");  
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
    update(){
        super.update();
        this.player.animationPlayer.update();
        const v = Input.getVector();
        if(v.x !== 0)
            this.stateMachine.change(this.player.runState);
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
    }
    update(){
        super.update();
        const v = Input.getVector();
        if(v.x === 0)
            this.stateMachine.change(this.player.idleState);
    }
    exit(){
        super.exit();
    }

}
