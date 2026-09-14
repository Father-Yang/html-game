class CapsuleCollider {
    constructor(globalPosition, colliderSize, owner = null) {
        this.x = globalPosition.x;        
        this.y = globalPosition.y;        
        this.w = colliderSize.x;        
        this.h = colliderSize.y;        
        this.radius = this.w / 2;
        this.owner = owner;
    }

    setPosition(globalPosition) {
        this.x = globalPosition.x;
        this.y = globalPosition.y;
    }

    // 胶囊中心轴的线段
    #getSegment() {
        const r = this.radius;
        return {
            ax: this.x + r,
            ay: this.y + r,
            bx: this.x + r,
            by: this.y + this.h - r
        };
    }

    // 点到线段的最近点
    #closestPointOnSegment(px, py, seg) {
        const dx = seg.bx - seg.ax;
        const dy = seg.by - seg.ay;
        const lenSq = dx * dx + dy * dy;

        if (lenSq === 0) return { x: seg.ax, y: seg.ay };

        let t = ((px - seg.ax) * dx + (py - seg.ay) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));

        return {
            x: seg.ax + t * dx,
            y: seg.ay + t * dy
        };
    }

    // 胶囊 vs 矩形（AABB）
    intersectsRect(rect) {
        const seg = this.#getSegment();
        const closest = this.#closestPointOnSegment(
            Math.max(rect.x, Math.min(seg.ax, rect.x + rect.w)),
            Math.max(rect.y, Math.min(seg.ay, rect.y + rect.h)),
            seg
        );

        const dx = closest.x - (rect.x + rect.w / 2);
        const dy = closest.y - (rect.y + rect.h / 2)
        // 简化：用矩形中心到最近点的距离
        const cx = Math.max(rect.x, Math.min(closest.x, rect.x + rect.w));
        const cy = Math.max(rect.y, Math.min(closest.y, rect.y + rect.h));

        const ddx = closest.x - cx;
        const ddy = closest.y - cy;
        return (ddx * ddx + ddy * ddy) <= (this.radius * this.radius);
    }


    // 获取穿透信息（用于碰撞响应）
    getOverlap(other) {
        if (other.radius !== undefined) {
            // 胶囊 vs 胶囊
            return this.getOverlapCapsule(other);
        } else {
            // 胶囊 vs 矩形
            return this.getOverlapRect(other);
        }
    }

    getOverlapRect(rect) {
        const seg = this.#getSegment();

        // 矩形最近点
        const cx = Math.max(rect.x, Math.min(seg.ax, rect.x + rect.w));
        const cy = Math.max(rect.y, Math.min(seg.ay, rect.y + rect.h));

        // 线段到矩形最近点
        const closest = this.#closestPointOnSegment(cx, cy, seg);

        const dx = closest.x - cx;
        const dy = closest.y - cy;
        const distSq = dx * dx + dy * dy;

        if (distSq > this.radius * this.radius) return null;

        const dist = Math.sqrt(distSq);
        if (dist === 0) {
            // 胶囊中心轴在矩形内部
            return { nx: 0, ny: -1, depth: this.radius };
        }

        return {
            nx: dx / dist,
            ny: dy / dist,
            depth: this.radius - dist
        };
    }

    getOverlapCapsule(other) {
        const segA = this.#getSegment();
        const segB = other.getSegment();

        const closestA = this.#closestPointOnSegment(segB.ax, segB.ay, segA);
        const closestB = other.closestPointOnSegment(segA.ax, segA.ay, segB);

        const dx = closestA.x - closestB.x;
        const dy = closestA.y - closestB.y;
        const distSq = dx * dx + dy * dy;

        if (distSq > (this.radius + other.radius) ** 2) return null;

        const dist = Math.sqrt(distSq);
        if (dist === 0) {
            return { nx: 0, ny: -1, depth: this.radius + other.radius };
        }

        return {
            nx: dx / dist,
            ny: dy / dist,
            depth: this.radius + other.radius - dist
        };
    }

    
    // // 胶囊 vs 胶囊
    // intersectsCapsule(other) {
    //     const segA = this.#getSegment();
    //     const segB = other.getSegment();

    //     // 两线段最近点
    //     const closestA = this.#closestPointOnSegment(
    //         segB.ax, segB.ay, segA
    //     );
    //     const closestB = other.closestPointOnSegment(
    //         segA.ax, segA.ay, segB
    //     );

    //     const dx = closestA.x - closestB.x;
    //     const dy = closestA.y - closestB.y;
    //     const distSq = dx * dx + dy * dy;
    //     const radSum = this.radius + other.radius;

    //     return distSq <= radSum * radSum;
    // }

    // // 胶囊 vs 点
    // intersectsPoint(px, py) {
    //     const seg = this.#getSegment();
    //     const closest = this.#closestPointOnSegment(px, py, seg);
    //     const dx = px - closest.x;
    //     const dy = py - closest.y;
    //     return (dx * dx + dy * dy) <= (this.radius * this.radius);
    // }

    // 调试绘制
    draw(context) {
        if (!debug) return;
        const r = this.radius;
        context.save();
        context.strokeStyle = 'cyan';
        context.lineWidth = 1;
        context.beginPath();
        context.arc(this.x + r, this.y + r, r, Math.PI, 0);
        context.lineTo(this.x + this.w, this.y + this.h - r);
        context.arc(this.x + r, this.y + this.h - r, r, 0, Math.PI);
        context.closePath();
        context.stroke();
        context.restore();
    }
}