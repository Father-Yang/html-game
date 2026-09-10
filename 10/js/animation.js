class Sprite{
    constructor(image, size, position, globalPosition){
        this.image = image;
        this.size = size;
        this.position = position;
        this.globalPosition = new Vector2(0, 0);
        this.scale = 2.0;
        this.flipH = false;
        
    }

    draw(context){
        context.save();
        // 把原点移到图片右侧
        //context.translate(this.size.x , 0);
        // X轴缩放-1，镜像
        context.scale(1, 1);
        context.drawImage(this.image, 
        this.position.x , this.position.y, this.size.x, this.size.y, 
        this.globalPosition.x , this.globalPosition.y, this.size.x * this.scale, this.size.y * this.scale);
        context.restore();
    }
}

class Animation {
    constructor(image) {

        this.image = image;
        this.frameList = [];
        this.currentFrame = 0;

        const size = new Vector2(69, 44);
        const start = new Vector2(0,0);
        const end   = new Vector2(5,0);

        this.hframes = this.image.width / size.x;
        this.vframes = this.image.height / size.y ;

        if((end.y - start.y) === 0) this.frames = end.x - start.x + 1;
        else if((end.y - start.y) === 1) this.frames = (this.hframes - start.x) + (this.hframes - end.x);
        else if((end.y - start.y) > 1) this.frames = (this.hframes - start.x) + (this.hframes - end.x) + (end.y - start.y - 1) * this.hframes;

        
        for(let i = 0; i < this.frames; i++){
            //let position = start.add(new Vector2(1,0));
            let position = new Vector2(i, 0).mul(size);
            this.frameList.push(new Sprite(image, size, position));
        }
        console.log(this.frameList)
        this.scale = 1;


        this.isPlaying = false;
        // 动画当前时间（单位：秒）
        this.time = 0;
        // 动画总时长，自己设置
        this.duration = 1.0;
        // 播放速度 1=正常，0.5=慢放，2=加速
        this.speed = 1;
        // 是否循环
        this.loop = false;
        // 每一帧的回调，用于更新位置/属性
        this.onUpdate = null;
        // 动画结束回调
        this.onComplete = null;
    }

    // 播放
    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
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

    // 核心更新函数：每一帧调用，deltaTime 是距离上一帧的时间（秒）
    update(deltaTime) {
        if(this.currentFrame >= 5){
            if(this.loop) this.currentFrame = 0;
        }
        else{
            this.currentFrame ++;
        }
        this.frameList[this.currentFrame].globalPosition = new Vector2(110, 100);
    }
    draw(context){
        this.frameList[this.currentFrame].draw(context);
    }
}

class AnimationPlayer {
    constructor(name) {
        this.animations = new Map();
        this.currentAnim = null;

        const image = document.getElementById(name);
        if(image){
            if(name === "player"){
                const idleAnim = new Animation(image);
                idleAnim.loop = true;
                this.addAnimation("Idle", idleAnim);
                this.addAnimation("Run", new Animation(image));
            }   
        }
    }
    addAnimation(name, animObj) {
        this.animations.set(name, animObj);
    }
    play(name) {
        const anim = this.animations.get(name);
        if (!anim) return;
        this.currentAnim = anim;
        anim.play();
    }
    update(deltaTime) {
        if (this.currentAnim) {
            this.currentAnim.update(deltaTime);
        }
    }
    draw(context){
        if (this.currentAnim) {
            this.currentAnim.draw(context);
        }
    }
}

