class Particle {
    constructor(game){
        this.game = game;
        this.markedForDeletion = false;
    }
}

class Trail extends Particle{
    constructor(sprite, alpha){
        super(null);
        this.sprite = new Sprite(
            sprite.image, 
            sprite.size, 
            sprite.frameCoord, 
            sprite.globalPosition.clone(), 
            sprite.anchor.clone(), 
            sprite.scale);
        this.sprite.facingDir = sprite.facingDir;
        this.alpha = alpha;
        this.size  = 1;
    }
    update(deltaTime){
        this.size *= 0.95;
        this.sprite.scale *= this.size;
        this.sprite.globalPosition = new Vector2(
            this.sprite.globalPosition.x, 
            this.sprite.globalPosition.y + this.sprite.size.y * (1 - this.size) * 0.5);
            // this.sprite.globalPosition.y);
        if(this.sprite.scale < 1) this.markedForDeletion = true;
    }
    draw(context){
        context.globalAlpha = this.alpha; 
        this.sprite.draw(context); 
        context.globalAlpha = 1;     
    }
}

class ParticleManger{
    #particles = [];
    #maxParticles = 50;//最大离子个数
    static #instance = null;//全局唯一静态
    constructor(){
        if (ParticleManger.#instance) {
            throw new Error("ParticleManger.getInstance()");
        }
    }
    static getInstance() {
        if (!ParticleManger.#instance) {
            ParticleManger.#instance = new ParticleManger();
        }
        return ParticleManger.#instance;
    }
    addParticle(particle){
        this.#particles.push(particle);
    }
    update(deltaTime){
        this.#particles = this.#particles.filter(e => !e.markedForDeletion);
        //更新离子状态
        if(this.#particles.length > this.#maxParticles) {
            this.#particles.length = this.#maxParticles; //限定离子个数
        } 
        this.#particles.forEach((particle, index) => {
            particle.update(particle);
        }); 
    }
    draw(context){
        this.#particles.forEach((particle, index) => {
            particle.draw(context);
        }); 
    }
}

window.particleManger = ParticleManger.getInstance();