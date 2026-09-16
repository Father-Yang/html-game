class Camera {
    #margin = {
        left: 0.3,   
        right: 0.3,   
        top: 0.4,     
        bottom: 0.2  
    };

    //TODO 摄像机要预留底部
    constructor(game) {
        this.globalPosition = new Vector2(0, 0);
        this.target = null;

        this.leftLimit = game.width * this.#margin.left;
        this.rightLimit = game.width * (1 - this.#margin.right);
        this.topLimit = game.height * this.#margin.top;
        this.bottomLimit = game.height * (1 - this.#margin.bottom);

        this.width = game.width;
        this.height = game.height;

        this.smoothSpeed = 5; //摄像机平滑移动
        this.threshold = 1;//摄像机临近阈值

        this.offset = new Vector2(0, 30);

        // console.log(this.leftLimit , this.rightLimit, this.topLimit, this.bottomLimit)
    }

    follow(target) {
        this.target = target;

        // // 初始位置
        // const centerX = this.width / 2;
        // const centerY = this.height / 2;
        // this.globalPosition = target.globalPosition.sub(
        //     new Vector2(centerX, centerY)
        // );
    }

    update(deltaTime) {
        if (!this.target) return;

        // 玩家在屏幕上的位置
        const targetX = this.target.globalPosition.x;
        const targetY = this.target.globalPosition.y;


        const diffLeft = (this.globalPosition.x + this.leftLimit) - targetX;
        const diffRight = targetX - (this.globalPosition.x + this.rightLimit);
        if (diffLeft > 0) {
            if (diffLeft <= this.threshold){
                this.globalPosition.x -= diffLeft;
            }
            else{
                this.globalPosition.x -= diffLeft * this.smoothSpeed * deltaTime;
            } 
        } else if (diffRight >= 0) {
            if (diffRight < this.threshold){
                this.globalPosition.x += diffRight;
            }
            else{
                this.globalPosition.x += diffRight * this.smoothSpeed * deltaTime;
            }     
        }


        const diffTop = (this.globalPosition.y + this.topLimit) - targetY;
        const diffBottom = targetY - (this.globalPosition.y + this.bottomLimit);

        if (diffTop > 0) {
            if(diffTop <= this.threshold){
                this.globalPosition.y -= diffTop;
            }
            else{
                this.globalPosition.y -= diffTop * this.smoothSpeed * deltaTime;
            }        
        } else if (diffBottom >= 0) {
            if(diffBottom < this.threshold){
                this.globalPosition.y += diffBottom;
            }
            else{
                this.globalPosition.y += diffBottom * this.smoothSpeed * deltaTime;
            }
        }
    }

    apply(context) {
        context.save();
        // context.translate(-this.globalPosition.x, -this.globalPosition.y);
         context.translate(-(this.globalPosition.x + this.offset.x),
                           -(this.globalPosition.y + this.offset.y));
    }

    restore(context) {
        context.restore();
    }
}