class Player {
    constructor(game){
        this.game = game;
        this.animationPlayer = new AnimationPlayer();
        this.stateMachine = new StateMachine(this);

        this.scale = 2;//图片缩放倍数     
        this.size = new Vector2(69,44); //单帧图片大小

        this.anchor = new Vector2(0.4, 0.6).mul(this.scale).mul(this.size);//锚点相对位置
        this.initGlobalPosition = new Vector2(200, 40).add(this.anchor);//角色全局初始坐标
        this.globalPosition = this.initGlobalPosition.clone();//角色全局坐标
        this.fallMaxDistance = 600;//掉落的最大距离

        this.velocity = new Vector2(0, 0); //角色速度向量
        this.moveSpeed = 250;//角色x轴移动速度
        this.jumpSpeed = 6;//角色跳跃速度
        this.wallSpeed = 3;//角色下滑速度
        this.gravity = game.gravity; // 游戏重力
        
        this.attackVelocity = [new Vector2(3, 0.5), new Vector2(0, 0), new Vector2(5, 1)];//角色攻击速度向量
        this.attackVelocityDuration = 0.1;//角色攻击初速度持续时间
        this.comboResetTime = 1;//角色连击重置时间

        this.inAirMoveMultiplier = 0.7;//角色离地在空中的时候，水平移动速度会乘上这个系数
        this.wallSlideSlowMultiplier = 0.2;//角色在爬墙的时候，移动系数 

        this.dashDuration = 0.3; //冲刺时间
        this.dashSpeed = 600;//冲刺速度
        this.dashCooldown = 0.1;//冲刺冷却时间

        this.facingRight = true; //角色初始是否朝右
        this.facingDir = 1;      //朝向

        this.groundDetected = false; //地面检测
        this.wallDetected = false;  //墙壁检测

        this.sprites = new Map(); // 角色精灵图集
        this.#initSprites("player");  //根据image id=player 初始化全部的sprite

        this.#initAnimation(); //根据图片sprite初始化全部的动画

        //角色状态
        this.idleState = new PlayerIdleState(this.stateMachine);
        this.runState = new PlayerRunState(this.stateMachine);
        this.jumpState = new PlayerJumpState(this.stateMachine);
        this.fallState = new PlayerFallState(this.stateMachine);
        this.dashState = new PlayerDashState(this.stateMachine);
        this.basicAttackState = new PlayerBasicAttackState(this.stateMachine);
        this.wallSlideState = new PlayerWallSlideState(this.stateMachine);

        this.stateMachine.init(this.idleState);//初始化状态机

        
        // this.collider = new CapsuleCollider(
        //     this.globalPosition.sub(this.colliderSize.x * 0.5, this.colliderSize.y),
        //     this.colliderSize,this);

        this.colliderSize = new Vector2(26, 64);//碰撞体大小

        //设置碰撞体
        this.collider = new Collider(
            this.globalPosition.sub(this.colliderSize.x * 0.5, -this.colliderSize.y),
            this.colliderSize, this);
        this.collider.setType(CollisionType.Player);
    }

    #initSprites(imageID){
        const image = document.getElementById(imageID);
        const sprites_config = [
            {"Idle":{startPos:{x:0, y:0}, endPos:{x:5, y:0}}},
            {"Run": {startPos:{x:0, y:1}, endPos:{x:1, y:2}}}, 
            {"Jump":{startPos:{x:5, y:6},  endPos:{x:2, y:7}}},    
            {"Fall":{startPos:{x:3, y:7},endPos:{x:0, y:8}}},       
            {"Dash":{startPos:{x:3, y:11},endPos:{x:0, y:12}}},
            {"Attack_1":{startPos:{x:2, y:2},endPos:{x:3, y:3}}},
            {"Attack_2":{startPos:{x:4, y:3},endPos:{x:1, y:4}}},
            {"Attack_3":{startPos:{x:5, y:12},endPos:{x:5, y:13}}},
            {"Wall":{startPos:{x:0, y:10},endPos:{x:2, y:10}}},
        ];
        if(image){
            const hframe = image.width / this.size.x; 
            sprites_config.forEach(item => {
                const [name, info] = Object.entries(item)[0];
                const {startPos, endPos, anchor} = info;
                let frameNum = 0;

                if((endPos.y - startPos.y) === 0) {
                    frameNum = endPos.x - startPos.x + 1;
                }
                else if((endPos.y - startPos.y) === 1) {
                    frameNum = (hframe - startPos.x) + (endPos.x + 1) + (endPos.y - startPos.y - 1) * hframe;
                } 
                const frames = [];
                for(let i = 0; i < frameNum; i++){
                    let frameCoord = new Vector2((startPos.x + i) % hframe , startPos.y + Math.trunc((startPos.x + i) / hframe));
                    const sprite = new Sprite(image, this.size, frameCoord.mul(this.size), this.globalPosition);
                    sprite.facingRight = this.facingRight;
                    sprite.anchor = this.anchor;
                    sprite.scale = this.scale
                    frames.push(sprite);

                }
                this.sprites.set(name, frames);
            });
        }
    }
    
    #initAnimation(){
        this.animationPlayer.initAnimations(this);
    }

    // 下面的函数由状态机中的状态执行update时调用
    setVelocity(velocity){
        this.velocity = velocity;
        if ((velocity.x > 0 && this.facingRight === false) || (velocity.x < 0 && this.facingRight === true)){
            this.flip();
        }          
    }

    flip(){
        this.facingRight = !this.facingRight;
        this.facingDir = this.facingDir * -1;
    }

    //给动画回调使用的函数
    callAnimationTrigger(){
        this.stateMachine.currentState.callAnimationTrigger();
    }

    //每帧检测是否碰撞地面，是否碰撞墙壁
    handleCollisionDetection(){
        const h_length = this.colliderSize.y * 0.5;
        const ground = collisionManager.raycast(
            CollisionType.Ground, this.globalPosition, Vector2.DOWN, h_length, this.collider);

        if(ground){
            this.groundDetected = true;
            this.globalPosition = new Vector2(this.globalPosition.x, ground.y - h_length);
            this.velocity = new Vector2(this.velocity.x , 0);    
        }
        else{
            this.groundDetected = false;
        }

        const w_length = this.colliderSize.x * 0.5;
        //上检测线 锚点上1/4 碰撞体高
        const wall_1 = collisionManager.raycast(
            CollisionType.Wall,
            new Vector2(this.globalPosition.x, this.globalPosition.y - this.colliderSize.y * 0.25), 
            Vector2.RIGHT.mul(this.facingDir), 
            w_length, 
            this.collider);
        //下检测线 锚点下1/4 碰撞体高
        const wall_2 = collisionManager.raycast(
            CollisionType.Wall,
            new Vector2(this.globalPosition.x, this.globalPosition.y + this.colliderSize.y * 0.25), 
            Vector2.RIGHT.mul(this.facingDir), 
            w_length, 
            this.collider);
       
        if(wall_1 && wall_2){
            this.wallDetected = true;
            this.velocity = new Vector2(0 , this.velocity.y);
            // console.log(this.globalPosition ,  wall_1.x + wall_1.width + w_length)
            if(this.facingDir === 1){
                this.globalPosition = new Vector2(wall_1.x - w_length, this.globalPosition.y);
            }
            else if(this.facingDir === -1){
                this.globalPosition = new Vector2(wall_1.x + wall_1.width + w_length, this.globalPosition.y);
            }
            // console.log(this.globalPosition)
        }
        else{
            this.wallDetected = false;
        }  
    }

    update(deltaTime){
        // if(this.globalPosition.y > this.fallMaxDistance){ //TODO 重置初始位置有BUG 
        //     this.globalPosition = this.initGlobalPosition.clone();
        //     return;
        // }
        this.handleCollisionDetection(); //先做物理碰撞检测再更新状态机

        this.stateMachine.update(deltaTime);//状态机更新

        this.globalPosition.addEqual(this.velocity);//全局坐标更新
        this.collider.setPosition(this.globalPosition.sub(this.colliderSize.x * 0.5, this.colliderSize.y * 0.5));//碰撞体坐标更新

        //更新当前动画的全部图片位置及朝向
        const spriteFrames = this.sprites.get(this.animationPlayer.currentAnim.name);
        spriteFrames.forEach(sprite =>{
            sprite.facingDir = this.facingDir;
            sprite.globalPosition = this.globalPosition;
        })   
    }

    draw(context){
        if(debug){
            this.collider.draw(context); 

            context.font = "10px Segoe UI";
            context.fillStyle = 'rgba(255, 255, 255, 0.5)'; 
            context.fillText(("("+this.globalPosition.x.toFixed(1) + "," + this.globalPosition.y.toFixed(1) +")"), this.globalPosition.x + 20, this.globalPosition.y);        
        }
        this.animationPlayer.draw(context);
    }
    
}