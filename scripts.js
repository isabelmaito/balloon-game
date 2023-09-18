const balloon = document.getElementById("balloon")
const velocidade = 5
let press_up = false
let press_down = false
let press_left = false
let press_right = false

function handleKeyDown(event){
        
    if(event.key=="ArrowUp"){
        press_up=true
    }
    if(event.key=="ArrowDown"){
        press_down=true
    }
    if(event.key=="ArrowLeft"){
        press_left=true
    }
    if(event.key=="ArrowRight"){
        press_right=true
    }
}

function handleKeyUp(event){
        
    if(event.key=="ArrowUp"){
        press_up=false
    }
    if(event.key=="ArrowDown"){
        press_down=false
    }
    if(event.key=="ArrowLeft"){
        press_left=false
    }
    if(event.key=="ArrowRight"){
        press_right=false
    }
}

function moveBalloon(){
    const computed_style = getComputedStyle(balloon)
    const y = parseInt(computed_style.top)
    const x = parseInt(computed_style.left)
    if(press_up==true){
        balloon.style.top = (y-velocidade) + "px"
    }
    if(press_down==true){
        balloon.style.top = (y+velocidade) + "px"
    }
    if(press_left==true){
        balloon.style.left = (x-velocidade) + "px"
    }
    if(press_right==true){
        balloon.style.left = (x+velocidade) + "px"
    }
}

function gameLoop(){
    moveBalloon()
    setTimeout(gameLoop,parseInt(1000/60))
}

document.addEventListener("keydown",handleKeyDown)
document.addEventListener("keyup",handleKeyUp)
gameLoop()