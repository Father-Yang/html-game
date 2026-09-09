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
    constructor(stateMachine, stateName){
        this.stateMachine = stateMachine;
        this.stateName = stateName;
    }
    enter(){

    }
    update(){

    }
    exit(){

    }
}

class PlayerIdleState extends State{
    constructor(stateMachine){
        super(stateMachine,"Idle");
    }
    enter(){    

    }

}
