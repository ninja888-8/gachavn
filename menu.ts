const canvas = document.getElementById('sky') as HTMLCanvasElement | null;
if (!canvas) throw new Error('#sky not found');
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

type Star = { x: number, y: number, r: number, dx: number, dy: number, baseAlpha: number, phase: number, speed: number };
const stars: Star[] = [];
const STAR_COUNT = 80;

let last = performance.now();
let shooting: { x: number, y: number, len: number, angle: number, speed: number } | null = null;

function spawnShooting() {
    shooting = { 
        x: -120, 
        y: Math.random() * window.innerHeight * 0.45 + 20, 
        len: Math.random() * 320 + 180, 
        angle: Math.random() * 0.25 + 0.05, 
        speed: Math.random() * 12 + 6
    };
}

function step(now: number) {
    const dt = Math.min(60, now - last) / 16.6667; last = now;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // gentle gradient sky glow
    ctx.fillStyle = "rgba(6,16,51,0.12)"; 
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

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

    if (!shooting) spawnShooting();
    if (shooting) {
        // movement using angle (vx, vy) so tail orientation matches movement
        const vx = Math.cos(shooting.angle) * shooting.speed;
        const vy = Math.sin(shooting.angle) * shooting.speed;
        shooting.x += vx * dt;
        shooting.y += vy * dt;

        // draw trail along the movement vector (tail is opposite the direction of travel)
        const tailX = shooting.x - Math.cos(shooting.angle) * shooting.len;
        const tailY = shooting.y - Math.sin(shooting.angle) * shooting.len;
        const grad = ctx.createLinearGradient(shooting.x, shooting.y, tailX, tailY);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.strokeStyle = grad; 
        ctx.lineWidth = 2.5 + Math.random() * 2.0; 
        ctx.lineCap = 'round';
        ctx.beginPath(); 
        ctx.moveTo(shooting.x, shooting.y);
        ctx.lineTo(tailX, tailY); 
        ctx.stroke();

        // head
        ctx.beginPath(); 
        ctx.fillStyle = 'white'; 
        ctx.arc(shooting.x, shooting.y, 3.2, 0, Math.PI * 2); 
        ctx.fill();
        if (shooting.x - shooting.len > window.innerWidth + 200) shooting = null;
    }

    requestAnimationFrame(step);
}

requestAnimationFrame(step);

function spawnButtonStars(btn: HTMLElement, count = 8) {
    for (let i = 0; i < count; i++) {
        const s = document.createElement('span');
        s.className = 'btn-star';
        
        const bw = btn.clientWidth;
        const bh = btn.clientHeight;
        
        // start from near the button center with a reasonable spread so stars can travel visibly
        const startX = bw * 0.5 + (Math.random() - 0.5) * Math.min(80, bw * 0.4);
        const startY = bh * 0.5 + (Math.random() - 0.5) * Math.min(48, bh * 0.4);
        s.style.left = startX + 'px'; s.style.top = startY + 'px';
        
        // neutral starting transform
        s.style.transform = 'translate(0px, 0px) scale(1)';
        s.style.willChange = 'transform, opacity';
        btn.appendChild(s);

        // target offsets
        const angle = Math.random() * Math.PI * 2;
        const dist = (48 + Math.random() * 96) * (1 + Math.random() * 0.2);
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;

        // randomize duration so particles spread out and animate smoothly
        const dur = 600 + Math.random() * 900;
        s.style.transition = `transform ${dur}ms cubic-bezier(.2,.9,.2,1), opacity ${Math.max(300, dur - 200)}ms linear`;
        
        // force reflow then start animation
        void s.offsetWidth;
        requestAnimationFrame(() => {
            s.style.transform = `translate(${tx}px, ${ty}px) scale(${(Math.random() * 0.8 + 0.3).toFixed(2)})`;
            s.style.opacity = '0';
        });

        setTimeout(() => { try { btn.removeChild(s); } catch (e) { } }, dur + 120);
    }
}

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

function resize() {
    if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    initStars();
}

function newGame() {
    window.location.href = 'novel.html';
}

// function continueGame() {
//     window.location.href = 'novel.html';
// }

function visitGallery() {
    window.location.href = 'gallery.html';
}

// button starry hover effect for the primary button
const primaryBtn = document.querySelector('.btn.primary') as HTMLElement | null;
if (primaryBtn) {
    primaryBtn.addEventListener('mouseenter', () => {
        primaryBtn.classList.add('dim');
        spawnButtonStars(primaryBtn, Math.round(6 * Math.random()) + 8);
    });
    primaryBtn.addEventListener('mouseleave', () => {
        primaryBtn.classList.remove('dim');
    });
}

initStars();
window.addEventListener('resize', resize);
resize();

document.getElementById('new-game')?.addEventListener('click', newGame);
// document.getElementById('continue-game')?.addEventListener('click', continueGame);
document.getElementById('gallery')?.addEventListener('click', visitGallery);