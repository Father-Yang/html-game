// 要先加载 Vector.js
class InputManager {
    static #instance = null;

    #keyDown = new Set();
    #keyPressed = new Set();
    #keyReleased = new Set();

    // mouse = new Vector2(0,0);
    // #mouseDown = false;
    // #mousePressed = false;
    // #mouseReleased = false;

    constructor() {
        if (InputManager.#instance) {
            throw new Error("不要 new InputManager，请用 InputManager.getInstance()");
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
            const key = e.key;
            if (!this.#keyDown.has(key)) {
                this.#keyPressed.add(key);
            }
            this.#keyDown.add(key);
        });

        window.addEventListener("keyup", (e) => {
            const key = e.key;
            this.#keyDown.delete(key);
            this.#keyReleased.delete(key);
        });

        // window.addEventListener("mousemove", (e) => {
        //     this.mouse.set(e.clientX, e.clientY);
        // });

        // window.addEventListener("mousedown", () => {
        //     if (!this.#mouseDown) {
        //         this.#mousePressed = true;
        //     }
        //     this.#mouseDown = true;
        // });

        // window.addEventListener("mouseup", () => {
        //     this.#mouseDown = false;
        //     this.#mouseReleased = true;
        // });
    }

    isKeyDown(code) {
        return this.#keyDown.has(code);
    }
    isKeyPressed(code) {
        return this.#keyPressed.has(code);
    }
    isKeyReleased(code) {
        return this.#keyReleased.has(code);
    }

    getVector(){
        return new Vector2((this.isKeyDown("a") ? -1 : 0) + (this.isKeyDown("d") ? 1 : 0) ,0);
    }

    // isMouseDown() { return this.#mouseDown; }
    // isMousePressed() { return this.#mousePressed; }
    // isMouseReleased() { return this.#mouseReleased; }

    endFrame() {
        this.#keyPressed.clear();
        this.#keyReleased.clear();
        // this.#mousePressed = false;
        // this.#mouseReleased = false;
    }
}

//全局挂载：window.input 就是单例，任何脚本直接用！
window.Input = InputManager.getInstance();