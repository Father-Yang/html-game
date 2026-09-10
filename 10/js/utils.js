class Vector2 {
    constructor(x = 0, y = 0) {
        if (x instanceof Vector2) {
            // 传入向量，拷贝
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = Number(x);
            this.y = Number(y);
        }
    }

    // set：支持 set(vec) / set(x,y) / set()归零
    set(x, y) {
        if (x instanceof Vector2) {
            this.x = x.x;
            this.y = x.y;
        } else if (y !== undefined) {
            this.x = Number(x);
            this.y = Number(y);
        } else {
            this.x = 0;
            this.y = 0;
        }
        return this;
    }

    // add：add(vec) / add(x,y) 返回新向量，不修改自身
    add(x, y) {
        if (x instanceof Vector2) {
            return new Vector2(this.x + x.x, this.y + x.y);
        } else if (y !== undefined) {
            return new Vector2(this.x + Number(x), this.y + Number(y));
        }
        return new Vector2(this.x, this.y);
    }

    // addEqual：原地相加，链式
    addEqual(x, y) {
        if (x instanceof Vector2) {
            this.x += x.x;
            this.y += x.y;
        } else if (y !== undefined) {
            this.x += Number(x);
            this.y += Number(y);
        }
        return this;
    }

    // sub：sub(vec) / sub(x,y) 返回新向量
    sub(x, y) {
        if (x instanceof Vector2) {
            return new Vector2(this.x - x.x, this.y - x.y);
        } else if (y !== undefined) {
            return new Vector2(this.x - Number(x), this.y - Number(y));
        }
        return new Vector2(this.x, this.y);
    }

    // subEqual：原地相减
    subEqual(x, y) {
        if (x instanceof Vector2) {
            this.x -= x.x;
            this.y -= x.y;
        } else if (y !== undefined) {
            this.x -= Number(x);
            this.y -= Number(y);
        }
        return this;
    }

    // mul：mul(vec)分量相乘 | mul(2)单数字缩放 | mul(x,y)分别乘
    mul(x, y) {
        if (x instanceof Vector2) {
            return new Vector2(this.x * x.x, this.y * x.y);
        } else if (y === undefined) {
            const s = Number(x);
            return new Vector2(this.x * s, this.y * s);
        } else {
            return new Vector2(this.x * Number(x), this.y * Number(y));
        }
    }

    // mulEqual：原地乘法/缩放
    mulEqual(x, y) {
        if (x instanceof Vector2) {
            this.x *= x.x;
            this.y *= x.y;
        } else if (y === undefined) {
            const s = Number(x);
            this.x *= s;
            this.y *= s;
        } else {
            this.x *= Number(x);
            this.y *= Number(y);
        }
        return this;
    }

    // 四舍五入，返回新向量
    round() {
        return new Vector2(Math.round(this.x), Math.round(this.y));
    }

    // ---------- 新增常用向量方法 ----------
    // 克隆向量
    clone() {
        return new Vector2(this.x, this.y);
    }

    // 获取向量模长（长度）
    len() {
        return Math.hypot(this.x, this.y);
    }

    // 获取长度平方（避免开根号，性能更好，比较距离时推荐）
    lenSq() {
        return this.x * this.x + this.y * this.y;
    }

    // 归一化，返回新单位向量
    normalize() {
        const l = this.len();
        if (l === 0) return new Vector2();
        return this.mul(1 / l);
    }

    // 原地归一化
    normalizeEqual() {
        const l = this.len();
        if (l !== 0) {
            this.mulEqual(1 / l);
        }
        return this;
    }

    // 点积
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    // 限制向量最大长度（常用于速度限制）
    limit(maxLen) {
        const sq = this.lenSq();
        const maxSq = maxLen * maxLen;
        if (sq > maxSq) {
            return this.mul(maxLen / Math.sqrt(sq));
        }
        return this.clone();
    }

    // 原地limit
    limitEqual(maxLen) {
        const sq = this.lenSq();
        const maxSq = maxLen * maxLen;
        if (sq > maxSq) {
            this.mulEqual(maxLen / Math.sqrt(sq));
        }
        return this;
    }

    // 取反，返回新向量 (-x,-y)
    negate() {
        return new Vector2(-this.x, -this.y);
    }

    // 原地取反
    negateEqual() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
}
