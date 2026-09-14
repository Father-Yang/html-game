class Player {
    constructor(game){
        this.game = game;
        this.animationPlayer = new AnimationPlayer();
        this.stateMachine = new StateMachine(this);

        this.velocity = new Vector2(0, 0); //角色速度向量
        this.moveSpeed = 200;//角色x轴移动速度
        this.jumpSpeed = 6;//角色跳跃速度
        this.game.gravity = 10; // 游戏重力
        this.inAirMoveMultiplier = 0.7;//角色离地在空中的时候，水平移动速度会乘上这个系数
        this.attackVelocity = [new Vector2(3, 1.5), new Vector2(1, 2.5), new Vector2(5, 1.75)];//角色攻击速度向量
        this.attackVelocityDuration = 0.1;//角色攻击初速度持续时间
        this.comboResetTime = 1;//角色连击重置时间

        this.dashDuration = 0.1; //冲刺时间
        this.dashSpeed = 600;//冲刺速度

        this.facingRight = true; //角色是否朝右
        this.facingDir = 1;

        this.scale = 2;//图片缩放倍数
        
        this.size = new Vector2(69,44); //单帧图片大小
        this.anchor = new Vector2(0.4, 1).mul(this.scale).mul(this.size);//锚点位置
        this.colliderSize = new Vector2(26, 64);//碰撞体大小

        this.globalPosition = new Vector2(100, 320); //角色全局坐标

        this.onGroundFlag = false;

        this.sprites = new Map(); // 角色精灵图集
        this.#initSprites("player"); 

        this.#initAnimation(); 
        // console.log(this.animationPlayer);

        //角色状态
        this.idleState = new PlayerIdleState(this.stateMachine);
        this.runState = new PlayerRunState(this.stateMachine);
        this.jumpState = new PlayerJumpState(this.stateMachine);
        this.fallState = new PlayerFallState(this.stateMachine);
        this.dashState = new PlayerDashState(this.stateMachine);
        this.basicAttackState = new PlayerBasicAttackState(this.stateMachine);

        this.stateMachine.init(this.idleState);//初始化状态机

        //设置碰撞体
        this.collider = new CapsuleCollider(
            this.globalPosition.sub(this.colliderSize.x * 0.5, this.colliderSize.y),
            this.colliderSize,this);

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
            {"Attack_1":
                {startPos:{x:2, y:2},
                 endPos:{x:3, y:3}}},
            {"Attack_2":
                {startPos:{x:4, y:3},
                 endPos:{x:1, y:4}}},
            {"Attack_3":
                {startPos:{x:5, y:12},
                 endPos:{x:5, y:13}}}
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

    onGround(){
        return this.globalPosition.y >= 320;
    }

    // 下面的函数由状态机中的状态执行update时调用
    setVelocity(velocity){
        this.velocity = velocity;
        if ((velocity.x > 0 && this.facingRight === false) || (velocity.x < 0 && this.facingRight === true)){
            this.facingRight = !this.facingRight;
            this.facingDir = this.facingDir * -1;
        }          
    }

    resolveCollision(deltaTime) {
        const map = this.game.tilemap;
        this.onGroundFlag = false;

        // ─── X 轴 ───
        this.globalPosition.x += this.velocity.x * deltaTime;
        this.collider.setPosition(
            this.globalPosition.x - this.colliderSize.x * 0.5,
            this.globalPosition.y - this.colliderSize.y
        );

        const solidTilesX = map.getSolidTilesInRect(this.collider);
        for (const tile of solidTilesX) {
            const overlap = this.collider.getOverlap(tile.collider);
            if (!overlap) continue;

            this.globalPosition.x += overlap.nx * overlap.depth;
            this.velocity.x = 0;
        }

        // ─── Y 轴 ───
        this.globalPosition.y += this.velocity.y * deltaTime;
        this.collider.setPosition(
            this.globalPosition.x - this.colliderSize.x * 0.5,
            this.globalPosition.y - this.colliderSize.y
        );

        const solidTilesY = map.getSolidTilesInRect(this.collider);
        for (const tile of solidTilesY) {
            const overlap = this.collider.getOverlap(tile.collider);
            if (!overlap) continue;

            this.globalPosition.y += overlap.ny * overlap.depth;

            // ny < 0 表示 tile 在 player 下方 → 踩在地面上
            if (overlap.ny < 0) {
                this.onGroundFlag = true;
                this.velocity.y = 0;
            } else if (overlap.ny > 0) {
                // 头顶撞到
                this.velocity.y = 0;
            }
        }

        // ─── 最终同步 ───
        this.collider.setPosition(
            this.globalPosition.x - this.colliderSize.x * 0.5,
            this.globalPosition.y - this.colliderSize.y
        );
    }

    callAnimationTrigger(){
        this.stateMachine.currentState.callAnimationTrigger();
    }

    update(deltaTime){
        this.stateMachine.update(deltaTime);//状态机更新
        this.globalPosition.addEqual(this.velocity);//全局坐标更新
        // console.log("player:",this.globalPosition);
        this.collider.setPosition(this.globalPosition.sub(this.colliderSize.x * 0.5, this.colliderSize.y));
        // this.resolveCollision(deltaTime);

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