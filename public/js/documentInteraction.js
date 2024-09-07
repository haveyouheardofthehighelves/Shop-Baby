let inputField1 = document.getElementById("commands")
let inputField2 = document.getElementById("TTS")
let blackbox = document.getElementsByClassName("black-box")[0]
let cross_hair = document.getElementsByClassName("plus")[0]

let prevkey = ""
let hovered = false
let isClicked = false
const handleClick = () => isClicked = true;
const handleRelease = () => isClicked = false;


function map(current, fromLow, fromHigh, toLow, toHigh){
    return ((current-fromLow) * (toHigh-toLow))/(fromHigh-fromLow) + toLow
}

function coordinate(event) {
    const rect = blackbox.getBoundingClientRect();
    let x = event.clientX;
    let y = event.clientY;
    if(isClicked){
        document.documentElement.style.cursor = 'none'
        cross_hair.style.position = "absolute";
        cross_hair.style.top = y + "px"; 
        cross_hair.style.left = x + "px"; 
    }else{
        document.documentElement.style.cursor = 'auto';
    }
    console.log(`top: ${rect.top}, bottom: ${rect.bottom}, left: ${rect.left}, right: ${rect.right}`)
    //console.log(`xposition: relative ${x}, yposition: relative ${y}`)
    console.log(`view port coordinates: x: ${event.clientX} y: ${event.clientY}`)
    let mapped_y = map(y,rect.top, rect.bottom, 0, 180)
    let mapped_x = map(x,rect.left, rect.right, 0, 180)
    console.log(`mapped: (${mapped_x},${mapped_y})`)
}

document.addEventListener('keydown', (event) => {
    if (inputField1 != document.activeElement && inputField2 != document.activeElement) {
        const keyName = event.key;
        const keypressData = {
            type: 'keypress',
            data: keyName, // The key that was pressed
          };
          if(prevkey != event.key){
            wsServer.send(JSON.stringify(keypressData))
            prevkey = event.key
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (inputField1 != document.activeElement && inputField2 != document.activeElement) {
        const keyName = event.key;
        const keypressData = {
            type: 'keyrelease',
            data: keyName, // The key that was pressed
          };
          wsServer.send(JSON.stringify(keypressData))
          prevkey = ""
    }
});

blackbox.addEventListener('mouseenter', () => {
    console.log('hovered');
    hovered = true;

    // Attach mousemove event to track coordinates when hovered
    blackbox.addEventListener('mousemove', coordinate);
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('mouseup', handleRelease);

});

blackbox.addEventListener('mouseleave', () => {
    console.log('not hovered');
    hovered = false;
    isClicked = false;
    // Remove mousemove event when not hovered
    blackbox.removeEventListener('mousemove', coordinate);
    document.removeEventListener('mousedown', handleClick);
    document.removeEventListener('mouseup', handleRelease);
    document.documentElement.style.cursor = 'auto';
});

