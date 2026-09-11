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
    constructor(name, image, size, startPos, endPos) {
        this.name = name;
        
        this.image = image;
        this.frameList = [];
        this.currentFrame = 0;

        this.size = size;
        this.startPos = startPos;
        this.endPos   = endPos;

        this.hframes = this.image.width / this.size.x;
        // this.vframes = this.image.height / this.size.y;

        if((this.endPos.y - this.startPos.y) === 0) {
            this.frames = this.endPos.x - this.startPos.x + 1;
            console.log("1:" + this.name + "==" + this.frames);
        }
        else if((this.endPos.y - this.startPos.y) === 1) {
            this.frames = (this.hframes - this.startPos.x) + (this.endPos.x + 1) + (this.endPos.y - this.startPos.y - 1) * this.hframes;
            console.log("2:" + this.name + "==" + this.frames);
        }     
        
        for(let i = 0; i < this.frames; i++){
            let position = new Vector2((startPos.x + i) % this.hframes , startPos.y + Math.trunc((startPos.x + i) / this.hframes));
            console.log(position.x, "====", position.y);
            this.frameList.push(new Sprite(image, size, position.mul(size)));
        }

        this.scale = 1;

        this.isPlaying = false;
        // 
        this.timer = 0;
        // 
        this.duration = 1000 / 10;
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
            if(this.currentFrame >= (this.frames-1)){
                if(this.loop) this.currentFrame = 0;
            }
            else{
                this.currentFrame ++;
            }
            this.frameList[this.currentFrame].globalPosition = new Vector2(110, 100);
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
    constructor(name) {
        this.animations = new Map();
        this.currentAnim = null;

        const image = document.getElementById(name);
        if(image){
            if(name === "player"){
                const idleAnim = new Animation("Idle",image, new Vector2(69,44), new Vector2(0,0), new Vector2(5,0));
                idleAnim.loop = true;
                this.addAnimation("Idle", idleAnim);

                const runAnim = new Animation("Run",image, new Vector2(69,44), new Vector2(0,1), new Vector2(1,2));
                runAnim.loop = true;
                this.addAnimation("Run", runAnim);

                const dashAnim = new Animation("Dash",image, new Vector2(69,44), new Vector2(3,11), new Vector2(0,12));
                dashAnim.loop = true;
                this.addAnimation("Dash", dashAnim);
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

