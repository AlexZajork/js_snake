import {runGame} from "./game.js";
    
let btnPlay = document.getElementById('btnPlay');
let btnSettings = document.getElementById('btnSettings');
let btnAbout = document.getElementById('btnAbout');

btnPlay.addEventListener("click", async () => {
    let startDialog = document.getElementById('start');
    startDialog.style.display = 'none';

    let speed = document.getElementById('speed').innerText;
    let result = await runGame(speed);
    console.log(result);

    startDialog.style.display = '';
    btnPlay.focus();
})

btnAbout.addEventListener("click", () =>{
    document.querySelector('#about').style.display = '';
})

btnSettings.addEventListener("click", () =>{
    document.querySelector('#settings').style.display = '';
})

Array.from(document.querySelectorAll('.btnSpeed')).map(e=> {
    e.addEventListener("click", (event) => {
        let speed = event.target.innerText.toLowerCase();
        document.querySelector('#speed').innerText = speed;
    });
})