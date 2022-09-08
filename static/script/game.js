const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let box = 20;

const config = {
	step: 0,
	maxStep: 6
}

let score = 0;

const scoreTag = document.querySelector(".score");
const settings = document.querySelector(".settings");
const settingsItem = document.querySelector(".settings_item");
const collision = document.querySelector("#collision");
const gameOver_item = document.querySelector(".gameOver_item");
const restart = document.querySelector(".restart");
const fps = document.querySelector(".fps");
const speedRange = document.querySelector("#speedRange");
const bestScore = document.querySelector(".bestScore");

let highScores = JSON.parse(localStorage.getItem("highScores"));
if(highScores == null){
    localStorage.setItem("highScores",JSON.stringify([]));
    localStorage.setItem("highScores",JSON.stringify([{score: 0}]));
    highScores = JSON.parse(localStorage.getItem("highScores"));
}; 
let sortHighScores = highScores.sort((a,b) => b.score - a.score);
bestScore.innerHTML = sortHighScores[0].score;

let hit = new Audio('./script/sound/hit.wav');
let pickup = new Audio('./script/sound/pickup.wav');
let up = new Audio('./script/sound/up.mp3');
let down = new Audio('./script/sound/down.mp3');
let right = new Audio('./script/sound/right.mp3');
let left = new Audio('./script/sound/left.mp3');
let pause = new Audio('./script/sound/Pause.mp3');
let unpause = new Audio('./script/sound/Unpause.mp3');
let press = new Audio('./script/sound/Press.mp3');


canvas.width = 1000;
canvas.height = 600;

let isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

if(isMobile.any()){
    document.querySelector("link").href = "./css/mobileStyle.css";	

    box = 20;
    canvas.width = 320;
    canvas.height = 480;
}

let w = canvas.width;
let h = canvas.height;

let food = {
    x: Math.floor(Math.random() * w / box) * box,
    y: Math.floor(Math.random() * h / box) * box
};

let snake = [];
snake[0] = {
    x: ((w / box) / 2) * box,
    y: ((h / box) / 2) * box
};

let direction = "";
let pTimestamp = 0;

let cheat = false;
let isParticles = false;

function draw(timestamp){
    requestAnimationFrame(draw);
    if ( ++config.step < config.maxStep) {
		return;
	};

    config.step = 0;

    const diff = timestamp - pTimestamp;
    pTimestamp = timestamp;
    
    if(!settingsItem.classList.contains("settingsItem_opened")){
        drawSnake();
        drawFood();
        fps.innerHTML = diff.toFixed(2);
    }
};

requestAnimationFrame(draw);

let colorFood = `hsl(${~~(Math.random() * 360)},100%,50%)`

function drawFood(){
    ctx.fillStyle = colorFood;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(255,255,255,.3 )";
    ctx.fillRect(food.x,food.y,box,box);
};

function drawSnake(){
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    config.maxStep = speedRange.value;

    ctx.clearRect(0,0,w,h);

    for(let i = 0;i < snake.length;i++){
        if(i == 0){
            ctx.fillStyle = "white";
            ctx.fillRect(snake[i].x,snake[i].y,box,box);
        }
        else{
            ctx.fillStyle = "rgba(225,225,225,1)";
            ctx.fillRect(snake[i].x,snake[i].y,box,box);
        };
    };

    for(let i = 1;i < snake.length;i++){
        if(snakeX == snake[i].x && snakeY == snake[i].y){
            gameOver_item.classList.add("gameOver_item_opened");
            settingsBtn();
            // hit.play();
            return;
        };
        if(food.x == snake[i].x && food.y == snake[i].y){
            food = {
                x: Math.floor(Math.random() * w / box) * box,
                y: Math.floor(Math.random() * h / box) * box
            };
        };
    };

    
    if(snakeX == food.x && snakeY == food.y || cheat){
        settingsParticl.color = colorFood;
        settingsParticl.posX = food.x;
        settingsParticl.posY = food.y;

        isParticles = true;
        particlesObj = {};
        pickup.play();
        score += 1;
        scoreTag.innerHTML = score.toString();
        food = {
            x: Math.floor(Math.random() * w / box) * box,
            y: Math.floor(Math.random() * h / box) * box
        };
        colorFood = `hsl(${~~(Math.random() * 360)},100%,50%)`

    }
    else{
        snake.pop();
    };

    if(isParticles){
        animation();
    };

    if(collision.checked){
        if(snakeX == w || snakeX + box == 0 || snakeY == h || snakeY + box == 0){
            saveScore = {
                score: score
            };
            highScores.push(saveScore)
            localStorage.setItem("highScores",JSON.stringify(highScores));
            sortHighScores = highScores.sort((a,b) => b.score - a.score);
            bestScore.innerHTML = sortHighScores[0].score;
            gameOver_item.classList.add("gameOver_item_opened");
            settingsBtn();
            hit.play();
            return;
        }
    }else{
        if(snakeX < 0){
            snakeX = w;
        }else if (snakeX > w - box){
            snakeX = 0;
        };
        if(snakeY < 0){
            snakeY = h;
        }else if (snakeY > h - box){
            snakeY = 0;
        };
    };
    
    if(direction === "right"){
        snakeX += box;
    }
    else if(direction === "left"){
        snakeX -= box;
    }
    else if(direction === "up"){
        snakeY -= box 
    }
    else if(direction === "down"){
        snakeY += box
    };

    let newHead = {
        x: snakeX,
        y: snakeY
    };
    snake.unshift(newHead);
};
document.addEventListener('keydown',(event) => {
    settingsItem.classList.remove("settingsItem_opened");
    if(event.key === "ArrowUp" && direction !== "down" 
    || event.key === "w" && direction !== "down"
    || event.key === "ц" && direction !== "down"
    ){
        direction = "up";
        up.play()
    }
    else if(event.key === "ArrowDown" && direction !== "up"
    || event.key === "s" && direction !== "up"
    || event.key === "ы" && direction !== "up"
    ){
        direction = "down";
        down.play()
    }
    else if(event.key === "ArrowRight" && direction !== "left"
    || event.key === "d" && direction !== "left"
    || event.key === "в" && direction !== "left"
    ){
        direction = "right";
        right.play()
    }
    else if(event.key === "ArrowLeft" && direction !== "right"
    || event.key === "a" && direction !== "right"
    || event.key === "ф" && direction !== "right"
    ){
        direction = "left"
        left.play()
    };
    if(event.key === "Enter"){
        cheat = true;  
    };
});

let x1 = null;
let y1 = null;

document.addEventListener("touchstart",(event) => {
    const firstTouch = event.touches[0];
    x1 = firstTouch.clientX;
    y1 = firstTouch.clientY;
},false);

document.addEventListener("touchmove",(event) => {
    if(!x1 || !y1){
        return;
    };

    let x2 = event.touches[0].clientX;
    let y2 = event.touches[0].clientY;
    
    let xDiff = x2 - x1;
    let yDiff = y2 - y1;

    if(Math.abs(xDiff) > Math.abs(yDiff)){
        if(xDiff > 0 && direction !== "left"){
            direction = "right";
            right.play();
        }else if(direction !== "right"){
            direction = "left";
            left.play();
        };
    }else{
        if(yDiff > 0 && direction !== "up"){
            direction = "down";
            down.play();
        }else if(direction !== "down"){
            direction = "up";
            up.play();
        };
    };
    x1 = null;
    y1 = null;
},false);

document.addEventListener('keyup',(event) => {
    cheat = false;
});

settings.addEventListener('click',settingsBtn);

function settingsBtn(){
    if(gameOver_item.classList.contains("gameOver_item_opened")){
        settingsItem.classList.remove("settingsItem_opened");
        return;
    };
    if(!settingsItem.classList.contains("settingsItem_opened")){
        settingsItem.classList.add("settingsItem_opened");
        pause.play();
    }else{
        settingsItem.classList.remove("settingsItem_opened");
        unpause.play();
    };
};


restart.addEventListener("click",() => {

    const saveScore = {
        score: score
    };
    highScores.push(saveScore)
    localStorage.setItem("highScores",JSON.stringify(highScores));
    sortHighScores = highScores.sort((a,b) => b.score - a.score);
    bestScore.innerHTML = sortHighScores[0].score;

    direction = "";
    score = 0;
    scoreTag.innerHTML = score.toString();
    snake = []
    snake[0] = {
        x: ((w / box) / 2) * box,
        y: ((h / box) / 2) * box
    };
    gameOver_item.classList.remove("gameOver_item_opened");
});

let particleIndex = 0,
        particlesObj = {}
        settingsParticl = {
        color: colorFood,
        size: 6,
        posX: food.x,
        posY: food.y,
        gravity: 1.5,
        amount: 30,
        maxLife: 20,
    };

function Particle(){
    this.x = settingsParticl.posX;
    this.y = settingsParticl.posY;

    this.vx = Math.random() * 20 - 10;
    this.vy =  Math.random() * 20 - 5;
    this.size = settingsParticl.size

    particleIndex++
    particlesObj[particleIndex] = this;
};

Particle.prototype.drawing = function(){
    this.x += this.vx;
    this.y += this.vy;
    this.vy += settingsParticl.gravity;

    this.life++;

    ctx.fillStyle = settingsParticl.color;
    ctx.fillRect(this.x,this.y,this.size,this.size);

    this.size > 0 ? this.size -= 0.9 : 0 
};

function animation(){
    for(let i = 0;i < settingsParticl.amount;i++){
        if(Object.keys(particlesObj).length < settingsParticl.amount){
            new Particle();
        }
    };
    for(let i in particlesObj){
        particlesObj[i].drawing()
    }; 
};
