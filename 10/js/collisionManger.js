//碰撞类型 枚举状态类型 Object.freeze冻结不能修改
const CollisionType = Object.freeze({
    Default: 0, 
    Ground:  1, 
    Wall:    2,  
    Player:  3,
});

//碰撞管理器 初始化碰撞掩码表
class CollisionManager{

    static #instance = null;//全局唯一静态

    #colliders = [];  //全局碰撞体

    #layerMaskMap = new Map();//掩码列表
    constructor(){
        if (CollisionManager.#instance) {
            throw new Error("CollisionManager.getInstance()");
        }
        this.#init();
    }

    #init(){
        this.#addMapping(CollisionType.Ground, CollisionType.Player);
        this.#addMapping(CollisionType.Wall,   CollisionType.Player);
    }

    static getInstance() {
        if (!CollisionManager.#instance) {
            CollisionManager.#instance = new CollisionManager();
        }
        return CollisionManager.#instance;
    }

    /**
     * 判断掩码layerMask1 是否允许和 type2 碰撞
     * @param {number} layerMask1 掩码值
     * @param {number} type2 CollisionType层序号
     * @returns {boolean}
     */
    LayerMaskJudge(layerMask1, type2) {
        return (layerMask1 & (1 << type2)) !== 0;
    }

    /**
     * 获取指定碰撞类型的掩码
     * @param {number} type CollisionType序号
     * @returns {number} 掩码（uint8，找不到返回0）
     */
    findMapping(type){
         return this.#layerMaskMap.get(type) ?? 0;
    }

    #addMapping(type1, type2) {
        // 如果不存在type1，插入初始值0
        if (!this.#layerMaskMap.has(type1)) {
            this.#layerMaskMap.set(type1, 0);
        }
        // 如果不存在type2，插入初始值0
        if (!this.#layerMaskMap.has(type2)) {
            this.#layerMaskMap.set(type2, 0);
        }

        // 取出掩码，按位或，双向标记可碰撞
        let mask1 = this.#layerMaskMap.get(type1);
        mask1 |= (1 << type2);
        this.#layerMaskMap.set(type1, mask1);

        let mask2 = this.#layerMaskMap.get(type2);
        mask2 |= (1 << type1);
        this.#layerMaskMap.set(type2, mask2);
    }

    register(collider) {
        this.#colliders.push(collider);
    }

    unregister(collider) {
        const idx = this.#colliders.indexOf(collider);
        if (idx >= 0) {
            this.#colliders[idx] = this.#colliders[this.#colliders.length - 1];
            this.#colliders.pop();
        }
    }

    getColliders() {
        return this.#colliders;
    }

    raycast(origin, direction, dist, layerMask, ignore = null) {
        const len = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        const dx = direction.x / len;
        const dy = direction.y / len;

        for (const other of this.#colliders) {
            if (!other.isEnabled()) continue;
            if (other === ignore) continue;
            
            if (!ignore.canCollideWith(other)) continue;
            // if ((layerMask & (1 << other.getType())) === 0) continue;
            
            const minX = other.x;
            const maxX = other.x + other.width;
            const minY = other.y;
            const maxY = other.y + other.height;

            let tmin = 0;
            let tmax = dist;

            if (Math.abs(dx) > 1e-6) {
                const tx1 = (minX - origin.x) / dx;
                const tx2 = (maxX - origin.x) / dx;
                tmin = Math.max(tmin, Math.min(tx1, tx2));
                tmax = Math.min(tmax, Math.max(tx1, tx2));
            } else if (origin.x < minX || origin.x > maxX) {
                continue;
            }

            if (Math.abs(dy) > 1e-6) {
                const ty1 = (minY - origin.y) / dy;
                const ty2 = (maxY - origin.y) / dy;
                tmin = Math.max(tmin, Math.min(ty1, ty2));
                tmax = Math.min(tmax, Math.max(ty1, ty2));
            } else if (origin.y < minY || origin.y > maxY) {
                continue;
            }

            if (tmin <= tmax && tmin >= 0) return true;
        }

        return false;
    }
}
window.collisionManager = CollisionManager.getInstance();


class Collider {
    // ── 静态计数器，给每个碰撞体唯一 ID（调试/哈希用） ──
    static #idCounter = 0;

    // ── 实例字段 ──
    #id = 0;
    #type = CollisionType.Default;
    #layerMask = 1;
    #enabled = true;

    // 空间数据（由物理系统填充/读取）
    x = 0;
    y = 0;
    width = 0;
    height = 0;

    // 所属实体引用（方便碰撞回调时拿到 owner）
    #owner = null;

    // 碰撞信号
    onCollisionEnter = null;   // (otherCollider, contactInfo) => void
    onCollisionStay = null;    // (otherCollider, contactInfo) => void
    onCollisionExit = null;    // (otherCollider) => void

    constructor(globalPosition, colliderSize, owner = null) {
        this.#id = ++Collider.#idCounter;
        this.#owner = owner;

        this.x = globalPosition.x;
        this.y = globalPosition.y;
        this.width = colliderSize.x;        
        this.height = colliderSize.y; 

        // 每个 Collider 自己持有信号实例
        this.onCollisionEnter = new Signal('onCollisionEnter');
        this.onCollisionStay = new Signal('onCollisionStay');
        this.onCollisionExit = new Signal('onCollisionExit');

        //自动注册
        collisionManager.register(this);
    }

    setPosition(globalPosition) {
        this.x = globalPosition.x;
        this.y = globalPosition.y;
    }

    // ── 类型与掩码 ──

    setType(type) {
        this.#type = type;
        this.#layerMask = collisionManager.findMapping(type);
        return this; // 链式调用
    }

    getType() {
        return this.#type;
    }

    getLayerMask() {
        return this.#layerMask;
    }

    // ── 碰撞判定（核心） ──

    /**
     * 判断是否与另一个 Collider 可发生碰撞（掩码层过滤）
     * @param {Collider} other
     * @returns {boolean}
     */
    canCollideWith(other) {
        if (!this.#enabled || !other.#enabled) return false;
        if (this.#type === other.#type) return false; // 同类不相碰（可按需改）
        return collisionManager.LayerMaskJudge(this.#layerMask, other.#type);
    }

    /**
     * AABB 矩形相交检测
     * @param {Collider} other
     * @returns {boolean}
     */
    intersects(other) {
        return !(
            this.x + this.width <= other.x ||
            other.x + other.width <= this.x ||
            this.y + this.height <= other.y ||
            other.y + other.height <= this.y
        );
    }

    /**
     * 完整碰撞检测：先掩码过滤，再 AABB
     * @param {Collider} other
     * @returns {boolean}
     */
    checkCollision(other) {
        if (!this.canCollideWith(other)) return false;
        return this.intersects(other);
    }

    /**
     * 获取碰撞接触信息（供回调使用）
     * @param {Collider} other
     * @returns {Object}
     */
    getContactInfo(other) {
        return {
            self: this,
            other: other,
            // 碰撞法线（简单 AABB 推回方向）
            normal: this._calcNormal(other),
            // 穿透深度
            penetration: this._calcPenetration(other),
            // 碰撞中心点
            point: {
                x: Math.max(this.x, other.x) + Math.min(this.width, other.width) / 2,
                y: Math.max(this.y, other.y) + Math.min(this.height, other.height) / 2,
            }
        };
    }

    // ── 碰撞回调触发（由物理系统调用） ──

    /**
     * 触发碰撞进入事件
     * @param {Collider} other
     */
    dispatchCollisionEnter(other) {
        const contact = this.getContactInfo(other);
        this.onCollisionEnter.emit(other, contact);
    }

    /**
     * 触发碰撞持续事件
     * @param {Collider} other
     */
    dispatchCollisionStay(other) {
        const contact = this.getContactInfo(other);
        this.onCollisionStay.emit(other, contact);
    }

    /**
     * 触发碰撞退出事件
     * @param {Collider} other
     */
    dispatchCollisionExit(other) {
        this.onCollisionExit.emit(other);
    }

    // ── 生命周期 ──

    setEnabled(enabled) {
        this.#enabled = enabled;
    }

    isEnabled() {
        return this.#enabled;
    }

    getOwner() {
        return this.#owner;
    }

    getId() {
        return this.#id;
    }

    /**
     * 销毁：清理信号，断开引用
     */
    destroy() {
        this.onCollisionEnter.clear();
        this.onCollisionStay.clear();
        this.onCollisionExit.clear();
        this.#owner = null;
        this.#enabled = false;

        // 从管理器注销
        collisionManager.unregister(this);
    }

    // ── 内部工具 ──

    _calcNormal(other) {
        // 简化版：返回推回方向（从 other 指向 self 的反方向）
        const dx = (this.x + this.width / 2) - (other.x + other.width / 2);
        const dy = (this.y + this.height / 2) - (other.y + other.height / 2);
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        return { x: dx / len, y: dy / len };
    }

    _calcPenetration(other) {
        // X 轴穿透
        const ox = Math.max(0, Math.min(this.x + this.width, other.x + other.width) - Math.max(this.x, other.x));
        // Y 轴穿透
        const oy = Math.max(0, Math.min(this.y + this.height, other.y + other.height) - Math.max(this.y, other.y));
        return { x: ox, y: oy };
    }

    draw(context){
        context.strokeStyle = 'cyan';
        context.lineWidth = 1;  
        context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

class PhysicsSystem {
    update(deltaTime) {

        const colliders = collisionManager.getColliders();
        // console.log(colliders.length);
        for (let i = 0; i < colliders.length; i++) {
            const a = colliders[i];
            if (!a.isEnabled()) continue;

            for (let j = i + 1; j < colliders.length; j++) {
                const b = colliders[j];
                if (!b.isEnabled()) continue;

                if (a.checkCollision(b)) {
                    console.log(a, b);
                    a.dispatchCollisionEnter(b);
                    b.dispatchCollisionEnter(a);
                }
            }
        }
    }   
}

