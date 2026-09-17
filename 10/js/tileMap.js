class Ground {
  constructor(globalPosition, colliderSize) {
        this.collider = new Collider(globalPosition, colliderSize, this);
        this.collider.setType(CollisionType.Ground);
    }
}

class Wall {
  constructor(globalPosition, colliderSize) {
        this.collider = new Collider(globalPosition, colliderSize, this);
        this.collider.setType(CollisionType.Wall);
    }
}

class TileMap {
    #grounds = [];
    #walls = [];
    constructor(game) {
        this.game = game;
        //TODO 临时加载地图
        this.image = document.getElementById("tiles");
        this.ground_1 = new Vector2(2, 1);
        this.ground_2 = new Vector2(8, 1);
        this.ground_3 = new Vector2(6, 1);


        // 格子尺寸
        this.tileW = 32;
        this.tileH = 32;

        // 地图数据：0 = 空，非 0 = solid 20 * 12
        this.grid = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
            [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
            [2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
            [2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
            [2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,2,0,0,0,2],
            [2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];

        this.rows = this.grid.length;
        this.cols = this.grid[0].length;

        // 瓦片类型 → 颜色（调试用，后面换成图片）
        this.tileColors = {
            1: '#555',    // 地面
            2: '#8B4513', // 平台
            3: '#A52A2A', // 砖块
        };

        // 可行走标记（哪些格子算 solid）
        this.solidTiles = { 1: true, 2: true, 3: true };

        this.initPhysics(); //TODO
    }

    initPhysics(){
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const tile = this.grid[row][col];
                if (tile === 0) continue;

                const x = col * this.tileW;
                const y = row * this.tileH;
                if((tile === 1))
                    this.#grounds.push(new Ground(new Vector2(x, y), new Vector2(32, 32)));
                else if((tile === 2))
                    this.#walls.push(new Wall(new Vector2(x, y), new Vector2(32, 32)));
            }
        }
        
    }

    // ─── 坐标转换 ───

    // 世界坐标 → 格子索引
    worldToGrid(wx, wy) {
        return {
            col: Math.floor(wx / this.tileW),
            row: Math.floor(wy / this.tileH)
        };
    }

    // 格子索引 → 世界坐标（格子左上角）
    gridToWorld(col, row) {
        return {
            x: col * this.tileW,
            y: row * this.tileH
        };
    }

    // ─── 查询 ───

    // 获取某个格子的类型
    getTile(col, row) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return 0;
        return this.grid[row][col];
    }

    // 判断某个格子是否 solid
    isSolid(col, row) {
        return this.solidTiles[this.getTile(col, row)] || false;
    }

    // 获取某个矩形范围内的 solid 格子（给碰撞检测用）
    getSolidTilesInRect(rect) {
        const leftCol   = Math.max(0, Math.floor(rect.x / this.tileW));
        const rightCol  = Math.min(this.cols - 1, Math.floor((rect.x + rect.w - 0.001) / this.tileW));
        const topRow    = Math.max(0, Math.floor(rect.y / this.tileH));
        const bottomRow = Math.min(this.rows - 1, Math.floor((rect.y + rect.h - 0.001) / this.tileH));

        const result = [];
        for (let row = topRow; row <= bottomRow; row++) {
            for (let col = leftCol; col <= rightCol; col++) {
                if (this.isSolid(col, row)) {
                    result.push({
                        col, row,
                        collider: new RectCollider(
                            col * this.tileW,
                            row * this.tileH,
                            this.tileW,
                            this.tileH
                        )
                    });
                }
            }
        }
        return result;
    }

    // ─── 绘制 ───

    draw(context) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = col * this.tileW;
                const y = row * this.tileH;
                if (debug) {
                    context.strokeStyle = 'rgba(255,255,255,0.1)';
                    context.strokeRect(
                        x, 
                        y, 
                        this.tileW, this.tileH);
                }
                const tile = this.grid[row][col];
                if (tile === 0) continue;
                if(tile === 1){
                    // console.log(document.getElementById("ground"))
                    context.drawImage(document.getElementById("ground"), x, y);
                }
                    // context.drawImage(this.image, 
                    //     this.ground_1.x * 32,this.ground_1.y * 32, 32, 32,
                    //     x,
                    //     y, 
                    //     32, 32
                    // );
                    
                if(tile === 2){
                    context.drawImage(document.getElementById("wall"), x, y);
                }

                if(tile === 3){
                    context.drawImage(document.getElementById("platform"), x, y);
                }
                    // context.drawImage(this.image, 
                    //     this.ground_2.x * 32,this.ground_2.y * 32, 32, 32,
                    //     x,
                    //     y, 
                    //     32, 32
                    // );
                    
            }
        }
    }

    // ─── 以后扩展：从 Tiled JSON 加载 ───

    loadFromTiled(data) {
        this.tileW = data.tilewidth;
        this.tileH = data.tileheight;
        this.cols = data.width;
        this.rows = data.height;

        const layer = data.layers[0];
        this.grid = [];
        for (let row = 0; row < this.rows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col] = layer.data[row * this.cols + col];
            }
        }
    }
}