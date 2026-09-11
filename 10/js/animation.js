class Sprite{
    constructor(image, size, frameCoord, globalPosition = new Vector2(0,0)){
        this.image = image;
        this.size = size;
        this.frameCoord = frameCoord;
        this.globalPosition = globalPosition;
        this.scale = 1.5;
        this.facingRight = true;
        this.anchor = new Vector2(0.5, 1);
    }

    draw(context){

        context.save();
        // 把原点移到图片右侧
        context.translate(this.globalPosition.x, this.globalPosition.y);
        // X轴缩放-1，镜像
        context.scale(this.facingRight?1:-1, 1);
        // console.log(this.globalPosition);
        context.drawImage(this.image, 
            this.frameCoord.x , this.frameCoord.y, this.size.x, this.size.y, 
            -this.size.x * (this.facingRight?this.anchor.x:(1-this.anchor.x)), -this.size.y * this.anchor.y, this.size.x * this.scale, this.size.y * this.scale);
        if(debug){
            context.strokeRect(-this.size.x * (this.facingRight?this.anchor.x:(1-this.anchor.x)), -this.size.y * this.anchor.y, this.size.x * this.scale, this.size.y * this.scale);
        }
        context.restore();

        // this.flip = false;
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
                if(this.loop) this.currentFrame = 0;
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
    }
    initAnimations(sprites){
        sprites.forEach((frameList, animName) => {
            this.#addAnimation(animName, new Animation(animName, frameList));
        });
    }
    #addAnimation(name, animObj) {
        this.animations.set(name, animObj);
    }

    play(name) {
        const anim = this.animations.get(name);
        if (!anim) return;
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

