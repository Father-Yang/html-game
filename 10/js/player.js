class Player {
    constructor(game){
        this.game = game;
        this.animationPlayer = new AnimationPlayer("player");
        this.stateMachine = new StateMachine();

        this.idleState = new PlayerIdleState(this, this.stateMachine);
        this.runState = new PlayerRunState(this, this.stateMachine);
        this.dashState = new PlayerDashState(this, this.stateMachine);

        this.stateMachine.init(this.idleState);

        this.velocity = new Vector2(0, 0);
    }
    update(deltaTime){
        // console.log("player-update-deltaTime", deltaTime);
        this.stateMachine.update(deltaTime);
    }
    draw(context){
        this.animationPlayer.draw(context);
    }
    
    onGround(){
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }

    setVelocity(velocity){
        this.velocity = velocity;
        handleFilp(this.velocity.x);
    }

    #handleFilp(xVelcoity){
    //     if (xVelcoity > 0 && facingRight == false)
    // //         Flip();
    //     elseif (xVelcoity < 0 && facingRight)
    //         Flip();
    }

    // public void SetVelocity(float xVelocity, float yVelocity)
    // {
    //     rb.linearVelocity = new Vector2(xVelocity, yVelocity);
    //     HandleFlip(xVelocity);
    // }

    // private void HandleFlip(float xVelcoity)
    // {
    //     if (xVelcoity > 0 && facingRight == false)
    //         Flip();
    //     else if (xVelcoity < 0 && facingRight)
    //         Flip();
    // }

    // public void Flip()
    // {
    //     transform.Rotate(0, 180, 0);
    //     facingRight = !facingRight;
    //     facingDir = facingDir * -1;
    // }
            // player.SetVelocity(player.moveInput.x * player.moveSpeed, rb.linearVelocity.y);
    
}