const balloon = document.getElementById("balloon")
const velocidade = 5

function handleKeyDown(event){
    const computed_style = getComputedStyle(balloon)
    const y = parseInt(computed_style.top)
    const x = parseInt(computed_style.left)
    if(event.key=="ArrowUp"){
        balloon.style.top = (y-velocidade) + "px"
    }
    if(event.key=="ArrowDown"){
        balloon.style.top = (y+velocidade) + "px"
    }
    if(event.key=="ArrowLeft"){
        balloon.style.left = (x-velocidade) + "px"
    }
    if(event.key=="ArrowRight"){
        balloon.style.left = (x+velocidade) + "px"
    }
}

document.addEventListener("keydown",handleKeyDown)