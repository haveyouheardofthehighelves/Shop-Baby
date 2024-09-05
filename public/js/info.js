let Keys = document.getElementById("keyPress")
let Dialgoue = document.getElementById("Dialgoue")
let DID = document.getElementById("DID")

function init() {
    socket = io()
    socket.on('keypressed', event =>{
        Keys.textContent = `Key Press: ${event}`
        console.log(event)
    })

    socket.on('keyreleased', event =>{
        if(String(Keys.textContent).slice(11, String(Keys.textContent).length) == event){
            Keys.textContent = `Key Press: `
            console.log(event)
        }
    })  
}

init()





