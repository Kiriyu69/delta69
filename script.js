const canvas = document.createElement("canvas");
document.getElementById("matrix").appendChild(canvas);

const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);

const chars =
"01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@";

const fontSize = 16;
const columns =
Math.floor(window.innerWidth / fontSize);

const drops =
Array(columns).fill(1);

function draw() {

  ctx.fillStyle =
  "rgba(0,0,0,0.08)";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle =
  "#00ff88";

  ctx.font =
  `${fontSize}px monospace`;

  for(let i=0;i<drops.length;i++){

    const text =
    chars[Math.floor(
      Math.random()*chars.length
    )];

    ctx.fillText(
      text,
      i * fontSize,
      drops[i] * fontSize
    );

    if(
      drops[i] * fontSize >
      canvas.height &&
      Math.random() > 0.975
    ){
      drops[i] = 0;
    }

    drops[i]++;
  }
}

setInterval(draw,33);

const backBtn =
document.getElementById("backBtn");

const overlay =
document.getElementById("videoOverlay");

const video =
document.getElementById("introVideo");

backBtn.addEventListener("click", async () => {

  overlay.style.display = "block";

  try{
    await video.play();
  }catch(e){
    console.log(e);
  }

  if(video.requestFullscreen){
    video.requestFullscreen()
    .catch(()=>{});
  }

});

video.addEventListener("ended", async () => {

  if(document.fullscreenElement){
    await document.exitFullscreen()
    .catch(()=>{});
  }

  overlay.style.display = "none";

});