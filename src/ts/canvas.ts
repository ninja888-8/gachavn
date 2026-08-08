import type { GachaItem } from './gacha.ts';

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
let meteorPos = -350;
let meteorVel: number;
let meteorAccel: number;
let trailColor = "rgb(123, 123, 123)";
let linePos: number[][] = [];

let flair = new Image();
flair.src = new URL('../images/common-flair.png', import.meta.url).href;
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
    
    console.log(results);
    console.log(highestRarity);

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

    meteorVel = h/2 + 350;
    meteorAccel = -h/2 - 350;

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
            let lastX;
            let lastY;
            
            for (let i = 0; i < starPos.length; i++) {
                let currentX = starPos[i][0], currentY = starPos[i][1];
                ctx.drawImage(starSmall, currentX, currentY);
                
                if (lastX && lastY) {
                    if (i == 1) {
                        ctx.beginPath();
                        ctx.moveTo(lastX + 16, lastY + 16);
                    }
                    ctx.lineTo(currentX + 16, currentY + 16);
                }
                lastX = currentX, lastY = currentY;
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

        let aspect = 2*w/h;
        let theta = Math.atan(1/aspect);

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
        if (meteorFrame == 59) {
            meteorAccel = -meteorAccel;
            if (highestRarity == 'Rare') {
                trailColor = 'rgb(186, 19, 186)';
                flair.src = new URL('../images/rare-flair.png', import.meta.url).href;
            } else if (highestRarity == 'Legendary') {
                trailColor = 'rgb(237, 198, 57)';
                flair.src = new URL('../images/legendary-flair.png', import.meta.url).href;
            }
        }
        meteorVel += meteorAccel / 60;

        if (meteorFrame >= 59) {
            ctx.globalAlpha = 0.6 * (119 - meteorFrame);
            ctx.rotate((meteorFrame - 59) * Math.PI / 180);
            ctx.drawImage(flair, w/2, h/2);
            ctx.globalAlpha = 1;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        // if (meteorFrame < 30 || meteorFrame > 90) {
        //     meteorPos += (h/2 + 350) / 120 * 3/2;
        // } else {
        //     meteorPos += (h/2 + 350) / 120 * 2/3;
        // }

        let aaa = [Math.floor(meteorPos * aspect), Math.floor(meteorPos + h/4)];
        let test = [Math.floor(meteorPos * aspect + 400 * Math.cos(theta)), Math.floor(meteorPos + 400 * Math.sin(theta) + h/4)];
        let angle = theta + Math.PI/2;

        ctx.beginPath();
        ctx.arc(test[0], test[1], 20, 0, 2 * Math.PI);
        ctx.fillStyle = trailColor;
        ctx.fill();

        let gradient = ctx.createLinearGradient(aaa[0], aaa[1], test[0], test[1]);
        // gradient.addColorStop(0, "rgb(4, 5, 36)");
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, trailColor);

        ctx.beginPath();
        ctx.moveTo(aaa[0], aaa[1]);
        ctx.lineTo(test[0] + 20 * Math.cos(angle), test[1] + 20 * Math.sin(angle));
        ctx.lineTo(test[0] - 20 * Math.cos(angle), test[1] - 20 * Math.sin(angle));
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.drawImage(starSmall, test[0] - 16, test[1] - 16);

        meteorFrame++;
        if (meteorFrame >= 120) {
            meteor = false;
            meteorPos = -350;
            meteorVel = h/2 + 350;
            meteorAccel = -h/2 - 350;
            trailColor = "rgb(123, 123, 123)";
            meteorFrame = 0;
            starOpacity = 0;
            starPos.length = 0;
            highestRarity = "Common";

            pullControls[0].disabled = false;
            pullControls[1].disabled = false;
        }
    }
    
    raf = requestAnimationFrame(draw);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
