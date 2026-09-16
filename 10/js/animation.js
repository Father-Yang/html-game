class Sprite{
    constructor(image, size, frameCoord, globalPosition = new Vector2(0,0), anchor = new Vector2(0,0), scale = 1){
        this.image = image;
        this.size = size;
        this.frameCoord = frameCoord;
        this.globalPosition = globalPosition;
        this.facingDir = 1;
        this.anchor = anchor;
        this.scale = scale;
    }

    draw(context){

        context.save();
        // 把原点移到图片右侧
        context.translate(this.globalPosition.x, this.globalPosition.y);
        // X轴缩放-1，镜像
        context.scale(this.facingDir, 1);
        // console.log(this.globalPosition);
        context.drawImage(
            this.image,
            this.frameCoord.x, this.frameCoord.y, this.size.x, this.size.y,
            -this.anchor.x, 
            -this.anchor.y,
            this.size.x * this.scale,
            this.size.y * this.scale
        );
        if(debug){
            context.strokeStyle = 'rgba(255, 255, 0, 0.3)';   
            context.strokeRect(
                -this.anchor.x, 
                -this.anchor.y,
                this.size.x * this.scale,
                this.size.y * this.scale);
             
            context.fillStyle = 'rgba(255, 0, 0, 1)'; 
            context.beginPath();
            context.arc(0, 0, 2, 0, Math.PI * 2); //圆点x, 圆点y， 半径r，开始角度，结束角度
            context.fill();
        }
        context.restore();
    }
}

class Animation {
    constructor(name, frameList) {
        this.name = name;
        
        this.frameList = frameList;
        this.currentFrame = 0;

        this.scale = 1;
        this.isPlaying = false;
        this.timer = 0;
        this.duration = 1 / 10;
        this.speed = 1;// 播放速度 1=正常，0.5=慢放，2=加速
        this.loop = true;// 是否循环
        this.onUpdate = null;// 每一帧的回调，用于更新位置/属性
        this.onComplete = null;// 动画结束回调
    }

    // 播放
    play(playFrame = 0) {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.currentFrame = playFrame;
    }

    // 暂停
    pause() {
        this.isPlaying = false;
    }

    // 停止，重置时间到0
    stop() {
        this.isPlaying = false;
        this.time = 0;
    }

    update(deltaTime) {
        if(this.timer >= this.duration){
            // console.log(this.timer, "---", this.duration);
            if(this.currentFrame >= (this.frameList.length-1)){
                if(this.loop) {//循环播放动画
                    this.currentFrame = 0;
                }
                else if(this.onComplete) {//动画不循环且需要回调
                    this.onComplete();
                }   
            }
            else{
                this.currentFrame ++;
            }

            this.timer = 0;
        }
        else{
            this.timer += deltaTime;
        }
    }

    draw(context){
        this.frameList[this.currentFrame].draw(context);
    }
}

class AnimationPlayer {
    constructor() {
        this.animations = new Map();
        this.currentAnim = null;
        this.entity = null;
    }
    initAnimations(entity){
        this.entity = entity;
        this.entity.sprites.forEach((frameList, animName) => {
            const anim = new Animation(animName, frameList);
            //TODO 设置动画循环状态
            if(animName === "Jump" || animName === "Fall" || animName.includes("Attack")){
                anim.loop = false;
            }
            if(animName.includes("Attack")){
                anim.onComplete = () => {
                    this.entity.callAnimationTrigger();
                };
            }
            anim.duration = 1 / frameList.length * 0.5;
            this.#addAnimation(animName, anim);
        });
    }
    #addAnimation(name, animObj) {
        this.animations.set(name, animObj);
    }

    play(name) {
        const anim = this.animations.get(name);
        if (!anim) return;
        if (this.currentAnim)
            this.currentAnim.currentFrame = 0;//如果是切换动画将前一个动画帧初始0
        this.currentAnim = anim;
        this.currentAnim.play();
    }

    update(deltaTime) {
        if (this.currentAnim) {
            this.currentAnim.update(deltaTime);
            // console.log(this.currentAnim.name)
        }
    }
    draw(context){
        if (this.currentAnim) {
            this.currentAnim.draw(context);
        }
    }
}

