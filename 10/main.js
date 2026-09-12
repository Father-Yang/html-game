window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');

    canvas.width = 640;
    canvas.height = 360;

    debug = true;

    class Game {
        constructor(width, height){
            
            this.width = width;
            this.height = height;

            this.speed = 0;
            this.maxSpeed = 3;
            this.gravity = 10; // 游戏重力
            this.groundMargin = 20;

            
            this.parallax = new ParallaxBackground(this);
            this.player = new Player(this);  
            this.camera = new Camera(this);
            this.camera.follow(this.player);
      
        }
        update(deltaTime){
            this.parallax.update(deltaTime);
            this.camera.update(deltaTime);
            this.player.update(deltaTime);
        }
        draw(context){
            this.parallax.draw(context);
            context.save();
            this.camera.draw(context);
            this.player.draw(context);
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
            ctx.fillStyle = "black";
            ctx.fillText("LogicFPS:" + (1000 / debug_timer).toFixed(1), 20, 10);
            ctx.fillText("RenderFPS:" + (1000 / deltaTime).toFixed(1), 20, 20);

            ctx.restore();
        }  
 
        requestAnimationFrame(animate);
    }
    animate(0);

});

