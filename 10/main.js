window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');

    canvas.width = 640;
    canvas.height = 360;

    class Game {
        constructor(width, height){
            this.debug = false;

            this.width = width;
            this.height = height;

            this.speed = 0;
            this.maxSpeed = 3;
            this.gravity = 1; // 游戏重力
            this.groundMargin = 80;

            this.player = new Player(this);
            this.input = new InputHandler(this);
      
        }
        update(deltaTime){
            this.player.update(deltaTime);
        }
        draw(context){
            this.player.draw(context);
        }
        // 自动适配屏幕大小
        autoScale(){
		    let scale = Math.min(window.innerWidth/canvas.width,window.innerHeight/canvas.height);
		    if(Math.abs(scale-1)<0.005) scale=1;
		    canvas.style.width = canvas.width * scale +'px';
		    canvas.style.height = canvas.height * scale +'px';
	    }
    }

    const game = new Game( canvas.width, canvas.height);

    let lastTime = 0;
    let timer = 0;
    
    function animate(timeStamp){
        game.autoScale();
        const deltaTime = timeStamp - lastTime;
        //console.log("deltaTime===:" + timer);   
        lastTime = timeStamp;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const fps = 1000 / 60.0;
        
        if(timer >= fps){   
            //console.log(timer);       
            game.update(timer);
            
            timer = 0;         
        }
        else{
            timer += deltaTime;
            //console.log("===:" + timer);   
        }
        game.draw(ctx);

        // 关闭像素平滑，需要每次刷新都设置
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false; //火狐兼容    

        requestAnimationFrame(animate);
    }
    animate(0);
});

