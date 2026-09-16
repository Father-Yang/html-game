class InputManager {
    static #instance = null;

    #keyDown = new Set();
    #keyPressed = new Set();
    #keyReleased = new Set();

    
    #mouseDown = false;
    #mousePressed = false;
    #mouseReleased = false;

    constructor() {
        if (InputManager.#instance) {
            throw new Error("InputManager.getInstance()");
        }
        this.#bindEvents();
    }

    static getInstance() {
        if (!InputManager.#instance) {
            InputManager.#instance = new InputManager();
        }
        return InputManager.#instance;
    }

    #bindEvents() {
        window.addEventListener("keydown", (e) => {
            if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
                e.preventDefault();
            }
            if (!this.#keyDown.has(e.code)) {
                this.#keyPressed.add(e.code);
            }
            this.#keyDown.add(e.code);
        });

        window.addEventListener("keyup", (e) => {
            this.#keyDown.delete(e.code);
            this.#keyReleased.add(e.code);
        });

        window.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
                if (!this.#mouseDown) {
                    this.#mousePressed = true;
                }
                this.#mouseDown = true;
            }
        });

        window.addEventListener("mouseup", (e) => {
            if (e.button === 0) {
                this.#mouseDown = false;
                this.#mouseReleased = true;
            }
        });
    }

    isKeyDown(code) { return this.#keyDown.has(code); }
    isKeyPressed(code) { return this.#keyPressed.has(code); }
    isKeyReleased(code) { return this.#keyReleased.has(code); }

    getAxisX() {
        let axisX = 0;
        if (this.isKeyDown("KeyA") || this.isKeyDown("ArrowLeft")) axisX -= 1;
        if (this.isKeyDown("KeyD") || this.isKeyDown("ArrowRight")) axisX += 1;
        return axisX;
    }

    getAxisY() {
        let axisY = 0;
        if (this.isKeyDown("KeyW") || this.isKeyDown("ArrowUp")) axisY -= 1;
        if (this.isKeyDown("KeyS") || this.isKeyDown("ArrowDown")) axisY += 1;
        return axisY;
    }

    //鼠标
    isMouseDown() { return this.#mouseDown; }
    isMousePressed() { return this.#mousePressed; }
    isMouseReleased() { return this.#mouseReleased; }

    endFrame() {
        this.#keyPressed.clear();
        this.#keyReleased.clear();
        this.#mousePressed = false;
        this.#mouseReleased = false;
    }
}

window.Input = InputManager.getInstance();