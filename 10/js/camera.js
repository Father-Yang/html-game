class Camera {
    constructor(game) {
        this.globalPosition = new Vector2(0, 0);
        this.target = null;

        this.viewW = game.width;
        this.viewH = game.height;

        this.margin = {
            left: 0.4,   
            right: 0.4,   
            top: 0.2,     
            bottom: 0.3   
        };
    }

    follow(target) {
        this.target = target;
        // 初始：玩家放屏幕中心
        this.globalPosition.x = target.globalPosition.x - this.viewW * this.margin.left;
        this.globalPosition.y = target.globalPosition.y - this.viewH * (1 - this.margin.bottom);
    }

    update(deltaTime) {
        if (!this.target) return;

        // 玩家在屏幕上的位置
        const screenX = this.target.globalPosition.x - this.globalPosition.x;
        const screenY = this.target.globalPosition.y - this.globalPosition.y;

        // ── 水平 ──
        const leftLimit = this.viewW * this.margin.left;
        const rightLimit = this.viewW * (1 - this.margin.right);

        if (screenX < leftLimit) {
            // 玩家偏左超出 → 摄像机左移
            this.globalPosition.x = this.target.globalPosition.x - leftLimit;
        } else if (screenX > rightLimit) {
            // 玩家偏右超出 → 摄像机右移
            this.globalPosition.x = this.target.globalPosition.x - rightLimit;
        }

        // ── 垂直 ──
        const topLimit = this.viewH * this.margin.top;
        const bottomLimit = this.viewH * (1 - this.margin.bottom);

        if (screenY < topLimit) {
            this.globalPosition.y = this.target.globalPosition.y - topLimit;
        } else if (screenY > bottomLimit) {
            this.globalPosition.y = this.target.globalPosition.y - bottomLimit;
        }
    }

    draw(context) {
        context.translate(-this.globalPosition.x, -this.globalPosition.y);
    }
}