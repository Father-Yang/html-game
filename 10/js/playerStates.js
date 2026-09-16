//状态机
class StateMachine{
    constructor(player){
        this.player = player;
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

//状态基类
class State{
    constructor(stateMachine, stateName){   
        this.stateMachine = stateMachine;
        this.player = stateMachine.player;
        this.stateName = stateName;

        this.triggerCalled = false;//动画触发器状态
        this.dashCooldownTimer = this.player.dashCooldown;//冲刺冷却计数器
    }
    enter(){
        console.log(this.stateName + ":enter");  
    }
    update(deltaTime){
        // console.log(this.stateName + ":update"); 

        this.dashCooldownTimer -=  deltaTime;
        if(this.dashCooldownTimer < 0){//重置冲刺冷却 TODO 冲刺感觉卡手
            this.dashCooldownTimer = this.player.dashCooldown;
        }
        if(Input.isKeyDown("KeyQ") && this.canDash()) {
        // if(Input.isKeyDown("ShiftLeft") && this.canDash()) {
            this.stateMachine.change(this.player.dashState);
        }
    }

    exit(){
        console.log(this.stateName + ":exit");
        this.triggerCalled = false  
    }

    callAnimationTrigger(){
        this.triggerCalled = true;
    }

    canDash(){
        // if (this.player.wallDetected)
        //     return false;
        if(this.dashCooldownTimer < this.player.dashCooldown){
            return false;
        }
        if (this.stateMachine.currentState == this.player.dashState)
            return false;
        return true;
    }
}   

//地面状态
class PlayerGroundState extends State{
    constructor(stateMachine, name){
        super(stateMachine, "Ground->" + name);
    }
    enter(){    
        super.enter();
    }
    update(deltaTime){
        super.update(deltaTime);

        //this.player.velocity.y< 0 防止动画切换跳帧
        if (this.player.velocity.y <= 0 && this.player.groundDetected == false)
            this.stateMachine.change(this.player.fallState);

        if(Input.isKeyDown("Space")){
            this.stateMachine.change(this.player.jumpState);
        }
        if(Input.isMouseDown()){
            this.stateMachine.change(this.player.basicAttackState);
        }
    }
    exit(){
        super.exit();
    }
}

//空中状态
class PlayerAiredState extends State{
    constructor(stateMachine, name){
        super(stateMachine, "Air->" + name);
    }
    enter(){    
        super.enter();
    }
    update(deltaTime){
        super.update(deltaTime);
  
        this.player.setVelocity(new Vector2(
                this.player.velocity.x * Math.pow(this.player.inAirMoveMultiplier, deltaTime) , //空中速度横向衰减 
                this.player.velocity.y + this.player.gravity * deltaTime));
            
    }
    exit(){
        super.exit();
    }
}

//攻击基类
class PlayerBasicAttackState extends State{

    #attackVelocityTimer = 0;//攻击计时器
    #comboIndex = 1;//攻击动画索引
    #combolimit = 3;//最大连击数
    #lastTimeAttack = 0;//上次连击的时间

    #comboAttackQueued = false;
    #attackDir = 1;//攻击方向

    constructor(stateMachine){
        super(stateMachine, "BasicAttack");
        if(this.#combolimit !== this.player.attackVelocity.length){
            this.#combolimit = this.player.attackVelocity.length;//数据安全检查
        }
    }
    enter(){    
        super.enter();
        this.#comboAttackQueued = false;
        //连击技能索引
        if(this.#comboIndex > this.#combolimit 
            || (this.#lastTimeAttack + this.player.comboResetTime * 1000) < performance.now()){//上次退出的时间+间隔时间小于现在时间
            this.#comboIndex = 1;
        } 

        //根据控制按键更新攻击方向
        this.#attackDir = (Input.getAxisX() !== 0)?Input.getAxisX():this.player.facingDir;

        //设置攻击初始速度向量
        this.player.setVelocity(
            new Vector2(this.player.attackVelocity[this.#comboIndex - 1].x * this.#attackDir, 
                       -this.player.attackVelocity[this.#comboIndex - 1].y));
        //初始攻击速度保持时间   
        this.#attackVelocityTimer = this.player.attackVelocityDuration;

        this.player.animationPlayer.play("Attack_" + this.#comboIndex);
    }
    update(deltaTime){
        super.update(deltaTime);
        this.player.animationPlayer.update(deltaTime);

        //初始攻击持续时间结束 水平速度设置为0
        this.#attackVelocityTimer -= deltaTime;
        if(this.#attackVelocityTimer < 0)
            this.player.setVelocity(new Vector2(0, this.player.velocity.y + this.player.gravity * deltaTime));


        //根据攻击键和是否最后一次连招 判断设置连击 最后一次连击后一定会进入到idle状态
        if(Input.isMouseDown() && (this.#comboIndex < this.#combolimit)){
            this.#comboAttackQueued = true;
        }   
        if(this.triggerCalled){//动画结束触发
            if(this.#comboAttackQueued){
                //TODO ？？？？？？？？？？？？？？？？？？？？？？？？？？？
                //设置当前动画帧false
                //设置延时进入下一帧切换状态
                this.stateMachine.change(this.player.basicAttackState);
            }
            else{
                this.stateMachine.change(this.player.idleState);
            }   
        }
    }
    exit(){
        super.exit();
        this.#comboIndex ++; //退出的时候索引递增
        this.#lastTimeAttack = performance.now();
    }
}

//空闲状态 继承 地面状态
class PlayerIdleState extends PlayerGroundState{
    constructor(stateMachine){
        super(stateMachine, "Idle");
    }
    enter(){    
        super.enter();
        this.player.setVelocity(new Vector2(0, 0));
        this.player.animationPlayer.play("Idle");
    }
    update(deltaTime){
        super.update(deltaTime);
        this.player.animationPlayer.update(deltaTime);

        if(Input.getAxisX() === this.player.facingDir && this.player.wallDetected){
            return;
        }
        if(Input.getAxisX() !== 0){
            this.player.flip();
            this.stateMachine.change(this.player.runState);
        }
    }
    exit(){
        super.exit();
    }

}

//奔跑状态 继承 地面状态
class PlayerRunState extends PlayerGroundState{
    constructor(stateMachine){
        super(stateMachine, "Run");
    }
    enter(){    
        super.enter();
        console.log("enter==",this.player.globalPosition);
        this.player.animationPlayer.play("Run");
    }
    update(deltaTime){
        super.update(deltaTime);
        this.player.animationPlayer.update(deltaTime);
        const direction = Input.getAxisX();
        if(direction === 0 || this.player.wallDetected){
            this.stateMachine.change(this.player.idleState);
            return;
        }
        this.player.setVelocity(new Vector2(
            direction * this.player.moveSpeed * deltaTime, 
            this.player.velocity.y));    
    }
    exit(){
        super.exit();
        console.log("exit==",this.player.globalPosition);
    }
}

//跳跃状态 继承 空中状态
class PlayerJumpState extends PlayerAiredState{
    constructor(stateMachine){
        super(stateMachine, "Jump");
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

//下落状态 继承 空中状态
class PlayerFallState extends PlayerAiredState{
    constructor(stateMachine){
        super(stateMachine, "Fall");
    }
    enter(){    
        super.enter();
        this.player.animationPlayer.play("Fall");
    }
    update(deltaTime){
        super.update(deltaTime);
        this.player.animationPlayer.update(deltaTime);

        if (this.player.groundDetected){
            this.stateMachine.change(this.player.idleState); 
        }
        if (this.player.wallDetected){
            this.stateMachine.change(this.player.wallSlideState); 
        }
    }
    exit(){
        super.exit();
    }
}

//冲刺状态 继承 状态基类TODO
class PlayerDashState extends State{
    #dashDir = 1;
    #stateTimer = 1;
    constructor(stateMachine){
        super(stateMachine, "Dash");
    }
    enter(){    
        super.enter();
        this.stateTimer = this.player.dashDuration;
        //根据控制按键更新冲刺方向
        this.#dashDir = (Input.getAxisX() !== 0)?Input.getAxisX():this.player.facingDir;
        this.player.animationPlayer.play("Dash");
    }
    update(deltaTime){
        super.update(deltaTime);
        this.player.animationPlayer.update(deltaTime);

        this.player.setVelocity(new Vector2(this.player.dashSpeed * this.#dashDir * deltaTime, 0));

        this.stateTimer -= deltaTime;
        if(this.stateTimer < 0){
            if(this.player.groundDetected){
                this.stateMachine.change(this.player.idleState);
            }
            else{
                this.stateMachine.change(this.player.fallState);   
            }
        }
    }
    exit(){
        super.exit();
        this.stateTimer = this.player.dashDuration;
        this.dashCooldownTimer = this.player.dashCooldown;//冲刺冷却计数器
        this.player.setVelocity(new Vector2(0, 0));
    }

    // TODO
    //  private void CancelDashIfNeeded()
    // {
    //     if (player.wallDetected)
    //     {
    //         if (player.groundDetected)
    //             stateMachine.ChangeState(player.idleState);
    //         else
    //             stateMachine.ChangeState(player.wallSlideState);
    //     }
    // }

}

//墙
class PlayerWallSlideState extends State{
    constructor(stateMachine){
        super(stateMachine, "Wall");
    }
    enter(){    
        super.enter();
        this.player.animationPlayer.play("Wall");
        console.log(this.player.velocity)
    }
    update(deltaTime){
        super.update(deltaTime);
        this.player.animationPlayer.update(deltaTime);

        // if (player.moveInput.y < 0)
        //     player.SetVelocity(player.moveInput.x, rb.linearVelocity.y);
        // else
        //     player.SetVelocity(player.moveInput.x, rb.linearVelocity.y * player.wallSlideSlowMultiplier);

        if (Input.getAxisY() > 0){
            this.player.setVelocity(new Vector2(Input.getAxisX(), this.player.wallSpeed));
        }
        else{
            this.player.setVelocity(new Vector2(Input.getAxisX(), this.player.velocity.y * Math.pow(this.player.wallSlideSlowMultiplier, deltaTime)));
            console.log(this.player.velocity)
        }
        if (this.player.wallDetected === false)
            this.stateMachine.change(this.player.fallState);
        if (this.player.groundDetected){       
            this.stateMachine.change(this.player.idleState);
            this.player.flip();
        }
    }
    exit(){
        super.exit();
    }

}
