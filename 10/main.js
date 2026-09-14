window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');

    canvas.width = 640; //32 * 20 = 640
    canvas.height = 360;//32 * 12 = 384

    debug = true;

    class Game {
        constructor(width, height){
            
            this.width = width;
            this.height = height;

            this.speed = 0;
            this.maxSpeed = 3;
            this.gravity = 10; // 游戏重力
            this.groundMargin = 20;
            this.player = new Player(this); 
            this.camera = new Camera(this);
            this.camera.follow(this.player);//设置摄像机跟随目标
            this.parallax = new ParallaxBackground(this.camera); //视差背景
            this.tilemap = new TileMap(this);
             
        }
        update(deltaTime){
            if(Input.isKeyDown("Enter")){
                debug = !debug;
            }
            this.parallax.update(deltaTime);
            this.camera.update(deltaTime);
            this.player.update(deltaTime);
            Input.endFrame();//物理帧结束清除输入
        }
        draw(context){

            context.save();          
            this.camera.apply(context); //应用摄像机
            this.parallax.draw(context);//视差背景
            // this.tilemap.draw(context);
            this.player.draw(context);//角色  

            if(debug){
                //绘制摄像机死区
                context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                context.lineWidth = 1;
                context.setLineDash([5, 5]); // 虚线
                context.strokeRect(
                    this.camera.globalPosition.x + this.camera.leftLimit,
                    this.camera.globalPosition.y + this.camera.topLimit,
                    this.camera.rightLimit - this.camera.leftLimit,
                    this.camera.bottomLimit - this.camera.topLimit
                );
            }
            context.restore();
                        
        }
        // 自动适配屏幕大小
        autoScale(){
		    let scale = Math.min(window.innerWidth / canvas.width, window.innerHeight / canvas.height);
		    if(Math.abs(scale-1) < 0.005) scale = 1;
		    canvas.style.width = canvas.width * scale +'px';
		    canvas.style.height = canvas.height * scale +'px';
	    }
    }

    const game = new Game( canvas.width, canvas.height);

    game.autoScale(); //页面一打开就执行一次
    window.addEventListener('resize', () => {
        game.autoScale()
    });

    let timer = 0;
    let lastTime = performance.now();
    const logicFPS = 1000 / 60.0;
    let debug_timer = 1;


    function animate(timeStamp){
        // 关闭像素平滑，需要每次刷新都设置
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false; //火狐兼容   

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const deltaTime = timeStamp - lastTime;

        lastTime = timeStamp;
        timer += deltaTime;

        if(timer >= logicFPS){        
            game.update(timer * 0.001); 
            debug_timer = timer;
            timer -= logicFPS;         
        }
        game.draw(ctx);
        if(debug) {
            ctx.save();

            ctx.font = '10px Segoe UI';
            ctx.textAlign = "left";
            ctx.fillStyle = "green";
            ctx.fillText("Update:" + (1000 / debug_timer).toFixed(1), 20, 10);
            ctx.fillText("Render:" + (1000 / deltaTime).toFixed(1), 20, 20);

            ctx.restore();
        }  
 
        requestAnimationFrame(animate);
    }
    animate(0);

});

