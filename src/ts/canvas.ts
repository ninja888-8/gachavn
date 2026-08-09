import type { GachaItem } from './gacha.ts';

const overlay = document.getElementById("gacha-overlay") as HTMLElement;

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let ctx = canvas.getContext("2d", {alpha: false}) as CanvasRenderingContext2D;

let pullControls = Array.from((document.getElementById("gamble-controls") as Element).children) as HTMLButtonElement[];

let w: number, h: number;

let starSmall = new Image();
starSmall.src = new URL('../images/small-star.png', import.meta.url).href;

let star = new Image();
star.src = new URL('../images/star-med.png', import.meta.url).href;

let starPos: number[][] = [];
let starGrow = true;
let starOpacity = 0.0;

let meteor = false;
let meteorFrame = 0;
let meteorPos = 0;
let meteorVel: number;
let meteorAccel: number;
let trailColor = "rgb(123, 123, 123)";
let linePos: number[][] = [];

let aspect: number;
let theta: number;

let meteorPosStart = 0;
let meteorPosCenter = 0;
let meteorV0: number;
let meteorA0: number;

let flair = new Image();
let flairPos: number[] = [0, 0];
let highestRarity = "Common";

let raf: number;

export function pull(n: number, results: GachaItem[]) {
    if (n == 10) {
        for (let i = 0; i < n; i++) {
            starPos.push([(Math.random() + 0.5) * w/2, (Math.random() + 0.5) * h/2]);
            if (results[i].rarity != "Common" && highestRarity != "Legendary") {
                highestRarity = results[i].rarity;
            }
        }
    } else {
        starPos.push([(Math.random() + 3.5) * w/8, (Math.random() + 3.5) * h/8]);
        highestRarity = results[0].rarity;
    }
    
    // console.log(results);
    // console.log(highestRarity);

    starGrow = true;
    starOpacity = 0.05;

    pullControls[0].disabled = true;
    pullControls[1].disabled = true;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    w = canvas.width;
    h = canvas.height;

    aspect = 2*w/h;
    theta = Math.atan(1/aspect);

    const totalTime = 3;
    const halfTime = totalTime / 2;
    const offscreenMargin = 150;

    meteorPosCenter = h/4 - 400 * Math.sin(theta);
    const halfDist = (w/2 + offscreenMargin) / aspect;
    meteorPosStart = meteorPosCenter - halfDist;

    meteorV0 = 2 * halfDist / halfTime;
    meteorA0 = meteorV0 / halfTime;
 
    meteorPos = meteorPosStart;
    meteorVel = meteorV0;
    meteorAccel = -meteorA0;

    cancelAnimationFrame(raf);
    draw();
}

function draw() {
    // use delta time when ;-;

    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgb(4, 5, 36)";
    ctx.fillRect(0, 0, w, h);

    if (starPos.length != 0) {
        // if (starOpacity > 0 && starGrow || ) {
            ctx.globalAlpha = starOpacity;
            
            ctx.beginPath();
            for (let i = 0; i < starPos.length; i++) {
                let currentX = starPos[i][0], currentY = starPos[i][1];
                ctx.drawImage(starSmall, currentX, currentY);
                
                if (i == 0) {
                    ctx.moveTo(currentX + 16, currentY + 16);
                } else {
                    ctx.lineTo(currentX + 16, currentY + 16);
                }
            }
            
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            if (starGrow) {
                starOpacity += 0.05;
                if (starOpacity >= 1.5) {
                    starGrow = false;
                }
            } else if (starOpacity > 0.26) { // floating point whatever
                starOpacity -= 0.025;
            }
        /*} else*/ if (starOpacity < 0.26 && !starGrow) {
            // starOpacity = 0;
            // starPos.length = 0;
            // pullControls[0].disabled = false;
            // pullControls[1].disabled = false;

            // ctx.globalAlpha = 1;
            // ctx.fillStyle = "rgb(4, 5, 36)";
            // ctx.fillRect(0, 0, w, h);
            meteor = true;
        }
    }
    
    if (meteor) {
        ctx.globalAlpha = 1;
        console.log(`${meteorFrame} ${meteorPos}`);

        if (meteorFrame % 5 == 0) {
            linePos.push([w + (Math.random() - 0.5) * 400, h + (Math.random() - 0.5) * 400 - h/4]);
        }
        
        for (let i = 0; i < linePos.length; i++) {
            let lineX = linePos[i][0], lineY = linePos[i][1];

            if (lineX < -100 * aspect || lineY < -100) {
                linePos.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            ctx.moveTo(lineX, lineY);
            ctx.lineTo(lineX + 100 * aspect, lineY + 100);
            
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();

            linePos[i] = [lineX - aspect * 200, lineY - 200];
        }

        meteorPos += meteorVel / 60;
        if (meteorFrame == 89) {
            meteorAccel = -meteorAccel;
            flairPos = [
                Math.floor(meteorPos * aspect + 400 * Math.cos(theta)),
                Math.floor(meteorPos + 400 * Math.sin(theta) + h/4)
            ];
            if (highestRarity == 'Rare') {
                trailColor = 'rgb(186, 19, 186)';
                flair.src = new URL('../images/rare-flair.png', import.meta.url).href;
            } else if (highestRarity == 'Legendary') {
                trailColor = 'rgb(237, 198, 57)';
                flair.src = new URL('../images/legendary-flair.png', import.meta.url).href;
            }
        }
        meteorVel += meteorAccel / 60;

        // if (meteorFrame < 30 || meteorFrame > 90) {
        //     meteorPos += (h/2 + 350) / 120 * 3/2;
        // } else {
        //     meteorPos += (h/2 + 350) / 120 * 2/3;
        // }

        let tail = [Math.floor(meteorPos * aspect), Math.floor(meteorPos + h/4)];
        let head = [Math.floor(meteorPos * aspect + 400 * Math.cos(theta)), Math.floor(meteorPos + 400 * Math.sin(theta) + h/4)];
        let angle = theta + Math.PI/2;

        ctx.beginPath();
        ctx.arc(head[0], head[1], 20, 0, 2 * Math.PI);
        ctx.fillStyle = trailColor;
        ctx.fill();

        let gradient = ctx.createLinearGradient(tail[0], tail[1], head[0], head[1]);
        // gradient.addColorStop(0, "rgb(4, 5, 36)");
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, trailColor);

        ctx.beginPath();
        ctx.moveTo(tail[0], tail[1]);
        ctx.lineTo(Math.floor(head[0] + 20 * Math.cos(angle)), Math.floor(head[1] + 20 * Math.sin(angle)));
        ctx.lineTo(Math.floor(head[0] - 20 * Math.cos(angle)), Math.floor(head[1] - 20 * Math.sin(angle)));
        ctx.closePath();
        // ctx.strokeStyle = "transparent";
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.drawImage(starSmall, head[0] - 16, head[1] - 16);

        if (meteorFrame >= 89) {
            ctx.globalAlpha = 0.6 * (179 - meteorFrame) / 120;
            ctx.translate(flairPos[0], flairPos[1]);
            ctx.rotate((meteorFrame - 89) * Math.PI / 180);
            let flairSize = 64 * (meteorFrame - 59) / 30;
            ctx.drawImage(flair, -flairSize / 2, -flairSize / 2, flairSize, flairSize);
            ctx.globalAlpha = 1;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        meteorFrame++;
        if (meteorFrame >= 170) {
            starOpacity -= 0.025;
        }
        if (meteorFrame >= 180) {
            meteor = false;
            meteorPos = meteorPosStart;
            meteorVel = meteorV0;
            meteorAccel = -meteorA0;
            trailColor = "rgb(123, 123, 123)";
            meteorFrame = 0;
            starOpacity = 0;
            starPos.length = 0;
            highestRarity = "Common";
            flair.src = "";

            pullControls[0].disabled = false;
            pullControls[1].disabled = false;

            overlay.style.display = "flex";
        }
    }
    
    raf = requestAnimationFrame(draw);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
