class InputHandler {
    constructor(game){
        this.keys = [];
        this.game = game;
        window.addEventListener('keydown', e => {
            if((e.key === 'a'
              ||e.key === 'd' 
              ||e.key === 'w' 
              ||e.key === 's'
              ||e.key === ' '
            )&& this.keys.indexOf(e.key) === -1){
                this.keys.push(e.key);
            }  
            if(e.key === 'Enter') this.game.debug = !this.game.debug;
        });
        window.addEventListener('keyup', e => {
            if( e.key === 'a'
              ||e.key === 'd' 
              ||e.key === 'w' 
              ||e.key === 's' 
              ||e.key === ' '
            ){
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }    
        });
    }
}