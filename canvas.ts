let canvas = document.getElementById("canvas") as HTMLCanvasElement;
let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

let pullControls = Array.from((document.getElementById("gamble-controls") as Element).children) as HTMLButtonElement[];

let w: number, h: number;

let starSmall = new Image();
starSmall.src = "small-star.png";

let starPos: number[][] = [];
let starGrow = true;
let starOpacity = 0.0;

let flyby = false;
let starSize = 1;
let starDeg = 0;
let starX = -128, starY = -128;
let starColor = "white";

let raf: number;

export function pull(n: number) {
    if (n == 10) {
        for (let i = 0; i < n; i++) {
            starPos.push([(Math.random() + 0.5) * w/2, (Math.random() + 0.5) * h/2]);
        }
    } else {
        starPos.push([(Math.random() + 3.5) * w/8, (Math.random() + 3.5) * h/8]);
    }

    starGrow = true;
    starOpacity = 0.05;

    pullControls[0].disabled = true;
    pullControls[1].disabled = true;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    cancelAnimationFrame(raf);
    draw();
}

function draw() {
    // use delta time when ;-;

    w = canvas.width;
    h = canvas.height;

    ctx.globalAlpha = flyby ? 0.5 : 1;
    ctx.fillStyle = "rgb(4, 5, 36)";
    ctx.fillRect(0, 0, w, h);

    if (starPos.length != 0) {
        if (starOpacity > 0) {
            ctx.globalAlpha = starOpacity;
            let lastX;
            let lastY;

            for (let i = 0; i < starPos.length; i++) {
                let currentX = starPos[i][0], currentY = starPos[i][1];
                ctx.drawImage(starSmall, currentX, currentY);
                
                if (lastX && lastY) {
                    ctx.beginPath();
                    ctx.moveTo(lastX + 16, lastY + 16);
                    ctx.lineTo(currentX + 16, currentY + 16);
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                lastX = currentX, lastY = currentY;
            }
            
            if (starGrow) {
                starOpacity += 0.05;
                if (starOpacity >= 1.5) {
                    starGrow = false;
                }
            } else {
                starOpacity -= 0.025;
            }
        } else {
            starOpacity = 0;
            starPos.length = 0;
            pullControls[0].disabled = false;
            pullControls[1].disabled = false;

            ctx.globalAlpha = 1;
            ctx.fillStyle = "rgb(4, 5, 36)";
            ctx.fillRect(0, 0, w, h);
            flyby = true;
        }
    } else if (flyby) {
        // do it
    }
    
    raf = requestAnimationFrame(draw);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
