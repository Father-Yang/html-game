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
        //console.log(this.stateName + ":enter");  
    }
    update(deltaTime){
        //console.log(this.stateName + ":update");  
        if(Input.isKeyDown("q")) {
            this.stateMachine.change(this.player.dashState);
        }
    }
    exit(){
        //console.log(this.stateName + ":exit");  
    }
}   

class PlayerGroundState extends State{
    constructor(player, stateMachine){
        super(player, stateMachine, "Ground");
    }
    enter(){    
        super.enter();
    }
    update(deltaTime){
        super.update(deltaTime);  
        if(Input.isKeyDown(" ")){
            this.stateMachine.change(this.player.jumpState);
        }
    }
    exit(){
        super.exit();
    }
}


class PlayerAiredState extends State{
    constructor(player, stateMachine){
        super(player, stateMachine, "Air");
    }
    enter(){    
        super.enter();
    }
    update(deltaTime){
        super.update(deltaTime);
        // console.log("PlayerAiredState:",this.player.velocity, this.player.game.gravity);

        // this.player.setVelocity(new Vector2(
        //         this.player.velocity.x * (this.player.moveSpeed * this.player.inAirMoveMultiplier) * deltaTime, 
        //         (this.player.velocity.y - this.player.game.gravity) * deltaTime));
        this.player.setVelocity(new Vector2(
                this.player.velocity.x, 
                this.player.velocity.y + this.player.game.gravity * deltaTime));
            
    }
    exit(){
        super.exit();
    }
}

class PlayerIdleState extends PlayerGroundState{
    constructor(player, stateMachine){
        super(player, stateMachine, "Idle");
    }
    enter(){    
        super.enter();
        this.player.setVelocity(new Vector2(0, 0));
        this.player.animationPlayer.play("Idle");
    }
    update(deltaTime){
        super.update(deltaTime);
        this.player.animationPlayer.update(deltaTime);
        if(Input.getAxis() !== 0){
            this.stateMachine.change(this.player.runState);
        }
    }
    exit(){
        super.exit();
    }

}

class PlayerRunState extends PlayerGroundState{
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
        const direction = Input.getAxis();
        if(direction === 0){
            this.stateMachine.change(this.player.idleState);
        }
        this.player.setVelocity(new Vector2(
            direction * this.player.moveSpeed * deltaTime, 
            this.player.velocity.y));    
    }
    exit(){
        super.exit();
    }
}

class PlayerJumpState extends PlayerAiredState{
    constructor(player, stateMachine){
        super(player, stateMachine, "Jump");
    }
    enter(){    
        super.enter();
        this.player.setVelocity(new Vector2(this.player.velocity.x, -this.player.jumpSpeed));
        this.player.animationPlayer.play("Jump");
    }
    update(deltaTime){
        super.update(deltaTime);
        this.player.animationPlayer.update(deltaTime);
        // console.log("PlayerJumpState:",this.player.velocity, this.player.game.gravity);
        // if (this.player.velocity.y >= 0 && this.stateMachine.currentState != this.player.jumpAttackState){
        if (this.player.velocity.y >= 0){
            this.stateMachine.change(this.player.fallState);
        }
    }
    exit(){
        super.exit();
    }
}


class PlayerFallState extends PlayerAiredState{
    constructor(player, stateMachine){
        super(player, stateMachine, "Fall");
    }
    enter(){    
        super.enter();
        this.player.animationPlayer.play("Fall");
    }
    update(deltaTime){
        super.update(deltaTime);
        this.player.animationPlayer.update(deltaTime);

        if (this.player.onGround()){
            // console.log("this.player.onGround()")
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
        this.stateTimer = 0.5;
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
        this.stateTimer = 0.5;
    }

}
