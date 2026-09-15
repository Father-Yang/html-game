class Camera {
    // #margin = {
    //     left: 0.4,   
    //     right: 0.4,   
    //     top: 0.2,     
    //     bottom: 0.3  
    // };

    #margin = {
        left: 0,   
        right: 0,   
        top: 0,     
        bottom: 0  
    };

    constructor(game) {
        this.globalPosition = new Vector2(0, 0);
        this.target = null;

        this.leftLimit = game.width * this.#margin.left;
        this.rightLimit = game.width * (1 - this.#margin.right);
        this.topLimit = game.height * this.#margin.top;
        this.bottomLimit = game.height * (1 - this.#margin.bottom);

        this.width = game.width;
        this.height = game.height;
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
        const screenX = this.target.globalPosition.x;
        const screenY = this.target.globalPosition.y;

        if (screenX < this.leftLimit) {
            this.globalPosition.x = this.target.globalPosition.x - this.leftLimit;
        } else if (screenX > this.rightLimit) {
            this.globalPosition.x = this.target.globalPosition.x - this.rightLimit;
        }

        if (screenY < this.topLimit) {
            this.globalPosition.y = this.target.globalPosition.y - this.topLimit;
        } else if (screenY > this.bottomLimit) {
            this.globalPosition.y = this.target.globalPosition.y - this.bottomLimit;
        }
    }

    apply(context) {
        context.save();
        context.translate(-this.globalPosition.x, -this.globalPosition.y);
    }

    restore(context) {
        context.restore();
    }
}