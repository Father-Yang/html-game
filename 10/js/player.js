class Player {
    constructor(game){
        this.game = game;
        this.animationPlayer = new AnimationPlayer();
        this.stateMachine = new StateMachine();

        this.velocity = new Vector2(0, 0); //角色速度向量
        this.moveSpeed = 200;//角色x轴移动速度
        this.jumpSpeed = 10;//角色跳跃速度
        this.game.gravity = 12; // 游戏重力
        this.inAirMoveMultiplier = 0.7;//角色离地在空中的时候，水平移动速度会乘上这个系数

        this.facingRight = true; //角色是否朝右

        this.scale = 1.5;//图片缩放倍数
        
        this.size = new Vector2(69,44); //单帧图片大小
        this.anchor = new Vector2(0.4, 1).mul(this.scale).mul(this.size);//锚点位置
        this.colliderSize = new Vector2(26, 48);//碰撞体大小

        this.globalPosition = new Vector2(100, 300); //角色全局坐标

        this.sprites = new Map(); // 角色精灵图集
        this.#initSprites("player"); 

        this.#initAnimation(); 
        // console.log(this.animationPlayer);

        //角色状态
        this.idleState = new PlayerIdleState(this, this.stateMachine);
        this.runState = new PlayerRunState(this, this.stateMachine);
        this.jumpState = new PlayerJumpState(this, this.stateMachine);
        this.fallState = new PlayerFallState(this, this.stateMachine);
        this.dashState = new PlayerDashState(this, this.stateMachine);

        this.stateMachine.init(this.idleState);//初始化状态机

        //设置碰撞体
        this.collider = new CapsuleCollider(this.globalPosition,this.colliderSize,this);

    }

    #initSprites(imageID){
        const image = document.getElementById(imageID);
        const sprites_config = [
            {"Idle":
                {startPos:{x:0, y:0},
                 endPos:{x:5, y:0}}},
            {"Run":
                {startPos:{x:0, y:1},
                 endPos:{x:1, y:2}}}, 
            {"Jump":
                {startPos:{x:5, y:6},
                 endPos:{x:2, y:7}}},    
            {"Fall":
                {startPos:{x:3, y:7},
                 endPos:{x:0, y:8}}},       
            {"Dash":
                {startPos:{x:3, y:11},
                 endPos:{x:0, y:12}}},
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
        this.animationPlayer.initAnimations(this.sprites);
    }

    onGround(){
        return this.globalPosition.y >= this.game.height - 44 - this.game.groundMargin;
    }

    // 下面的函数由状态机中的状态执行update时调用
    setVelocity(velocity){
        this.velocity = velocity;
        if ((velocity.x > 0 && this.facingRight === false) || (velocity.x < 0 && this.facingRight === true)){
            this.facingRight = !this.facingRight;
        }          
    }

    update(deltaTime){
        this.stateMachine.update(deltaTime);//状态机更新
        this.globalPosition.addEqual(this.velocity);//全局坐标更新
        // console.log("player:",this.globalPosition);
        this.collider.setPosition(this.globalPosition.sub(this.colliderSize.x * 0.5, this.colliderSize.y));

        const spriteFrames = this.sprites.get(this.animationPlayer.currentAnim.name);
        spriteFrames.forEach(sprite =>{
            sprite.facingRight = this.facingRight;
            sprite.globalPosition = this.globalPosition;
        })
        
    }

    draw(context){
        this.collider.draw(context);
        // console.log(this.animationPlayer.currentAnim);
        this.animationPlayer.draw(context);
    }
    
}