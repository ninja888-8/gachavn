import type { GachaItem } from './gacha.ts';
import { showPull } from './gacha.ts';

const overlay = document.getElementById("gacha-overlay") as HTMLElement;

let canvas = document.getElementById('canvas') as HTMLCanvasElement;
let ctx = canvas.getContext("2d", {alpha: false}) as CanvasRenderingContext2D;

let pullControls = Array.from((document.getElementById("gamble-controls") as Element).children) as HTMLButtonElement[];

let w: number, h: number;

let starSmall = new Image();
starSmall.src = new URL('../images/small-star.png', import.meta.url).href;

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

let flairPurple = new Image();
flairPurple.src = new URL('../images/rare-flair.png', import.meta.url).href;
let flairGold = new Image();
flairGold.src = new URL('../images/legendary-flair.png', import.meta.url).href;
let flairPos: number[] = [0, 0];
let highestRarity = "Common";

let pullResults: GachaItem[];

let raf: number;

type Star = { x: number, y: number, r: number, dx: number, dy: number, baseAlpha: number, phase: number, speed: number };
const stars: Star[] = [];
const STAR_COUNT = 80;

let last = performance.now();
// let shooting: { x: number, y: number, len: number, angle: number, speed: number } | null = null;

// function spawnShooting() {
//     const rand = Math.random() < 0.5;
    
//     const x = rand ? -120 : window.innerWidth + 120;
//     const y = Math.random() * window.innerHeight * 0.6 + window.innerHeight * 0.2;
//     const len = Math.random() * 320 + 180;
//     const angle = rand ? Math.random() * 0.25 + 0.05 : Math.PI - (Math.random() * 0.25 + 0.05);
//     const speed = Math.random() * 12 + 6;
//     shooting = { 
//         x, y, len, angle, speed
//     };
// }

function step(now: number) {
    const dt = Math.min(60, now - last) / 16.6667; last = now;
    // ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // // gentle gradient sky glow
    // ctx.fillStyle = "rgba(6,16,51,0.12)"; 
    // ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // draw stars with per-star twinkle (smooth sinusoidal variation)
    const t = now / 1000;
    for (const s of stars) {
        s.x += s.dx * dt;
        s.y += s.dy * dt;
        const tw = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase); // 0..1
        const alpha = Math.max(0.05, s.baseAlpha * (0.5 + tw * 0.5));
        ctx.beginPath();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'white';
        ctx.shadowBlur = s.r * 6;
        ctx.shadowColor = 'rgba(255,240,200,0.85)';
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;

    // if (!shooting) spawnShooting();
    // if (shooting) {
    //     // movement using angle (vx, vy) so tail orientation matches movement
    //     const vx = Math.cos(shooting.angle) * shooting.speed;
    //     const vy = Math.sin(shooting.angle) * shooting.speed;
    //     shooting.x += vx * dt;
    //     shooting.y += vy * dt;

    //     // draw trail along the movement vector (tail is opposite the direction of travel)
    //     const tailX = shooting.x - Math.cos(shooting.angle) * shooting.len;
    //     const tailY = shooting.y - Math.sin(shooting.angle) * shooting.len;
    //     const grad = ctx.createLinearGradient(shooting.x, shooting.y, tailX, tailY);
    //     grad.addColorStop(0, 'rgba(255,255,255,1)');
    //     grad.addColorStop(1, 'rgba(255,200,120,0)');
    //     ctx.strokeStyle = grad; 
    //     ctx.lineWidth = 2.5 + Math.random() * 2.0; 
    //     ctx.lineCap = 'round';
    //     ctx.beginPath(); 
    //     ctx.moveTo(shooting.x, shooting.y);
    //     ctx.lineTo(tailX, tailY); 
    //     ctx.stroke();

    //     // head
    //     ctx.beginPath(); 
    //     ctx.fillStyle = 'white'; 
    //     ctx.arc(shooting.x, shooting.y, 3.2, 0, Math.PI * 2); 
    //     ctx.fill();
    //     if (shooting.x - shooting.len > window.innerWidth + 200 || shooting.x + shooting.len < -200) shooting = null;
    // }

    // requestAnimationFrame(step);
}

// requestAnimationFrame(step);

function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 3.2 + 0.3,
            dx: (Math.random() - 0.5) * 0.02,
            dy: 0,
            baseAlpha: Math.random() * 0.7 + 0.3,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 3 + 0.6
        });
    }
}

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

    pullResults = results;

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

    initStars();
    
    cancelAnimationFrame(raf);
    draw();
}

function draw() {
    // use delta time to make consistent on different fps

    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgb(4, 5, 36)";
    ctx.fillRect(0, 0, w, h);

    step(Date.now());

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
        
        if (starOpacity < 0.26 && !starGrow) {
            meteor = true;
        }
    }
    
    if (meteor) {
        ctx.globalAlpha = 1;

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
            } else if (highestRarity == 'Legendary') {
                trailColor = 'rgb(237, 198, 57)';
            }
        }
        meteorVel += meteorAccel / 60;

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

        if (meteorFrame >= 89 && highestRarity != "Common") {
            ctx.globalAlpha = 0.6 * (179 - meteorFrame) / 120;
            ctx.translate(flairPos[0], flairPos[1]);
            ctx.rotate((meteorFrame - 89) * Math.PI / 180);
            let flairSize = 64 * (meteorFrame - 59) / 15;
            if (highestRarity == "Rare") {
                ctx.drawImage(flairPurple, -flairSize / 2, -flairSize / 2, flairSize, flairSize);
            } else if (highestRarity == "Legendary") {
                ctx.drawImage(flairGold, -flairSize / 2, -flairSize / 2, flairSize, flairSize);
            }
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

            pullControls[0].disabled = false;
            pullControls[1].disabled = false;

            showPull(pullResults);
        }
    }
    
    raf = requestAnimationFrame(draw);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
