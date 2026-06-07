/* ============================================
   SNAKE GAME — "HACK THE SYSTEM"
   Themed terminal snake for portfolio footer
   ============================================ */

(function () {
    'use strict';

    // ── CONFIG ──────────────────────────────────
    const GRID       = 20;   // cells
    const CELL       = 16;   // px per cell (canvas = 320x320)
    const CANVAS_PX  = GRID * CELL; // 320
    const BASE_SPEED = 140;  // ms per tick
    const SPEED_INC  = 4;    // ms faster per food eaten

    // Dynamic Colors based on theme
    function getColors() {
        const style = getComputedStyle(document.body);
        const isLight = document.body.getAttribute('data-theme') === 'light';
        
        return {
            bg:          isLight ? '#f1f5f9' : '#020202',
            grid:        isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.018)',
            snakeHead:   isLight ? '#0891b2' : '#06b6d4',
            snakeBody:   isLight ? '#0e7490' : '#0e7490',
            snakeGlow:   isLight ? 'rgba(8,145,178,0.2)' : 'rgba(6,182,212,0.35)',
            food:        isLight ? '#0891b2' : '#22d3ee',
            foodGlow:    isLight ? 'rgba(8,145,178,0.3)' : 'rgba(34,211,238,0.6)',
            foodText:    isLight ? '#0891b2' : '#67e8f9',
            wallHit:     '#ef4444',
            scoreFlash:  isLight ? '#0891b2' : '#06b6d4',
        };
    }

    // ── STATE ────────────────────────────────────
    let snake, dir, nextDir, food, score, highScore, speed, gameLoop, lives, gameState, colors;
    // gameState: 'idle' | 'playing' | 'gameover' | 'paused'

    // ── DOM ──────────────────────────────────────
    const canvas      = document.getElementById('snake-canvas');
    const ctx         = canvas.getContext('2d');
    const overlay     = document.getElementById('snake-overlay');
    const overlayTitle = document.getElementById('snake-overlay-title');
    const overlaySub  = document.getElementById('snake-overlay-sub');
    const startBtn    = document.getElementById('snake-start-btn');
    const scoreEl     = document.getElementById('snake-score');
    const hiEl        = document.getElementById('snake-hi');
    const livesEl     = document.getElementById('snake-lives');

    if (!canvas) return; // Guard if elements not found

    canvas.width  = CANVAS_PX;
    canvas.height = CANVAS_PX;

    // ── INIT ─────────────────────────────────────
    function init() {
        snake     = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        dir       = { x: 1, y: 0 };
        nextDir   = { x: 1, y: 0 };
        score     = 0;
        lives     = 3;
        speed     = BASE_SPEED;
        food      = spawnFood();
        gameState = 'playing';

        updateHUD();
        hideOverlay();
        clearInterval(gameLoop);
        gameLoop = setInterval(tick, speed);
    }

    // ── FOOD ─────────────────────────────────────
    function spawnFood() {
        let pos;
        do {
            pos = {
                x: Math.floor(Math.random() * GRID),
                y: Math.floor(Math.random() * GRID),
                pulse: 0
            };
        } while (snake.some(s => s.x === pos.x && s.y === pos.y));
        return pos;
    }

    // ── TICK ─────────────────────────────────────
    function tick() {
        if (gameState !== 'playing') return;

        dir = { ...nextDir };
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        // Wall collision
        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
            handleDeath();
            return;
        }
        // Self collision (skip tail tip since it moves away)
        if (snake.slice(0, -1).some(s => s.x === head.x && s.y === head.y)) {
            handleDeath();
            return;
        }

        snake.unshift(head);

        // Eat food
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            if (score > highScore) highScore = score;
            food = spawnFood();
            popScore();
            // Speed up
            speed = Math.max(60, speed - SPEED_INC);
            clearInterval(gameLoop);
            gameLoop = setInterval(tick, speed);
        } else {
            snake.pop();
        }

        updateHUD();
        draw();
    }

    // ── DEATH ────────────────────────────────────
    function handleDeath() {
        lives--;
        updateLives();

        // Flash red & shake
        flashRed();
        document.querySelector('.snake-canvas-container')?.classList.add('snake-game-shake');
        setTimeout(() => {
            document.querySelector('.snake-canvas-container')?.classList.remove('snake-game-shake');
        }, 500);

        if (lives <= 0) {
            gameState = 'gameover';
            clearInterval(gameLoop);
            setTimeout(showGameOver, 600);
        } else {
            // Reset position, keep score & speed
            clearInterval(gameLoop);
            setTimeout(() => {
                snake   = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
                dir     = { x: 1, y: 0 };
                nextDir = { x: 1, y: 0 };
                gameLoop = setInterval(tick, speed);
            }, 800);
        }
    }

    function flashRed() {
        ctx.fillStyle = 'rgba(239,68,68,0.25)';
        ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);
    }

    // ── DRAW ─────────────────────────────────────
    function draw() {
        const colors = getColors();
        // Background
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);

        drawGrid(colors);
        drawFood(colors);
        drawSnake(colors);
    }

    function drawGrid(colors) {
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth   = 0.5;
        for (let i = 0; i <= GRID; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL, 0);
            ctx.lineTo(i * CELL, CANVAS_PX);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * CELL);
            ctx.lineTo(CANVAS_PX, i * CELL);
            ctx.stroke();
        }
    }

    function drawFood(colors) {
        food.pulse = (food.pulse || 0) + 0.08;
        const glow   = 0.5 + 0.5 * Math.sin(food.pulse);
        const px     = food.x * CELL;
        const py     = food.y * CELL;
        const size   = CELL - 2;

        // Glow
        ctx.shadowBlur  = 12 + 8 * glow;
        ctx.shadowColor = colors.foodGlow;

        // Draw a small diamond/rotated square for "food" feel
        ctx.fillStyle = colors.food;
        ctx.save();
        ctx.translate(px + CELL / 2, py + CELL / 2);
        ctx.rotate(Math.PI / 4 + food.pulse * 0.02);
        const s = (size * 0.55) / 2;
        ctx.fillRect(-s, -s, s * 2, s * 2);
        ctx.restore();

        // Center dot
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px + CELL / 2, py + CELL / 2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur  = 0;
        ctx.shadowColor = 'transparent';
    }

    function drawSnake(colors) {
        snake.forEach((seg, i) => {
            const px = seg.x * CELL;
            const py = seg.y * CELL;
            const isHead = i === 0;
            const t = 1 - i / snake.length; // 1 at head, ~0 at tail

            if (isHead) {
                ctx.shadowBlur  = 12;
                ctx.shadowColor = colors.snakeGlow;
                ctx.fillStyle   = colors.snakeHead;
            } else {
                ctx.shadowBlur = 0;
                // Gradient from body to tail
                const alpha = 0.3 + 0.7 * t;
                ctx.fillStyle = colors.snakeBody.replace(')', `,${alpha})`).replace('rgb', 'rgba');
                // Simple fallback if regex fails
                if (!ctx.fillStyle.includes('rgba')) {
                    ctx.fillStyle = colors.snakeHead + '88';
                }
            }

            const pad = isHead ? 1 : 2;
            const r   = isHead ? 4 : 3;
            roundRect(ctx, px + pad, py + pad, CELL - pad * 2, CELL - pad * 2, r);
            ctx.fill();

            // Head eyes
            if (isHead) {
                ctx.shadowBlur = 0;
                ctx.fillStyle  = '#fff';
                const eyeOffsets = getEyeOffsets();
                eyeOffsets.forEach(([ox, oy]) => {
                    ctx.beginPath();
                    ctx.arc(px + CELL / 2 + ox, py + CELL / 2 + oy, 2, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
        });

        ctx.shadowBlur  = 0;
        ctx.shadowColor = 'transparent';
    }

    function getEyeOffsets() {
        if (dir.x === 1)  return [[3, -3], [3, 3]];
        if (dir.x === -1) return [[-3, -3], [-3, 3]];
        if (dir.y === 1)  return [[-3, 3], [3, 3]];
        if (dir.y === -1) return [[-3, -3], [3, -3]];
        return [[3, -3], [3, 3]];
    }

    // Rounded rect helper
    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // ── HUD ──────────────────────────────────────
    function updateHUD() {
        if (scoreEl) scoreEl.textContent = String(score).padStart(4, '0');
        if (hiEl)    hiEl.textContent    = String(highScore || 0).padStart(4, '0');
    }

    function updateLives() {
        if (!livesEl) return;
        const dots = livesEl.querySelectorAll('.snake-life-dot');
        dots.forEach((d, i) => {
            d.classList.toggle('active', i < lives);
        });
    }

    function popScore() {
        if (!scoreEl) return;
        scoreEl.classList.remove('pop');
        void scoreEl.offsetWidth;
        scoreEl.classList.add('pop');
    }

    // ── OVERLAY ──────────────────────────────────
    function hideOverlay() {
        if (overlay) overlay.classList.add('hidden');
    }

    function showOverlay(title, sub, btnText) {
        if (!overlay) return;
        if (overlayTitle) overlayTitle.innerHTML = title;
        if (overlaySub)  overlaySub.textContent  = sub;
        if (startBtn)    startBtn.textContent     = btnText;
        overlay.classList.remove('hidden');
    }

    function showGameOver() {
        draw(); // Final frame
        showOverlay(
            `GAME <span>OVER</span>`,
            `SCORE: ${String(score).padStart(4,'0')} // HI: ${String(highScore||0).padStart(4,'0')}`,
            'RESTART'
        );
    }

    // ── CONTROLS ─────────────────────────────────
    const DIRS = {
        ArrowUp:    { x: 0, y: -1 },
        ArrowDown:  { x: 0, y:  1 },
        ArrowLeft:  { x: -1, y: 0 },
        ArrowRight: { x:  1, y: 0 },
        w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
        s: { x: 0, y:  1 }, S: { x: 0, y:  1 },
        a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
        d: { x:  1, y: 0 }, D: { x:  1, y: 0 },
    };

    function changeDir(d) {
        // Prevent 180 turn
        if (d.x !== -dir.x || d.y !== -dir.y) {
            nextDir = d;
        }
    }

    document.addEventListener('keydown', (e) => {
        const d = DIRS[e.key];
        if (d) {
            e.preventDefault();
            if (gameState === 'playing') changeDir(d);
        }
        if ((e.key === 'p' || e.key === 'P') && gameState === 'playing') {
            pauseGame();
        } else if ((e.key === 'p' || e.key === 'P') && gameState === 'paused') {
            resumeGame();
        }
    });

    // Touch controls
    document.getElementById('btn-up')?.addEventListener('click',    () => { if(gameState==='playing') changeDir({x:0,y:-1}); });
    document.getElementById('btn-down')?.addEventListener('click',  () => { if(gameState==='playing') changeDir({x:0,y:1}); });
    document.getElementById('btn-left')?.addEventListener('click',  () => { if(gameState==='playing') changeDir({x:-1,y:0}); });
    document.getElementById('btn-right')?.addEventListener('click', () => { if(gameState==='playing') changeDir({x:1,y:0}); });

    // Swipe detection on canvas
    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
            changeDir(dx > 0 ? { x:1,y:0 } : { x:-1,y:0 });
        } else {
            changeDir(dy > 0 ? { x:0,y:1 } : { x:0,y:-1 });
        }
        e.preventDefault();
    }, { passive: false });

    // ── PAUSE ────────────────────────────────────
    function pauseGame() {
        gameState = 'paused';
        clearInterval(gameLoop);
        showOverlay('SYSTEM <span>PAUSED</span>', 'PRESS P TO RESUME', 'RESUME');
    }

    function resumeGame() {
        gameState = 'playing';
        hideOverlay();
        gameLoop = setInterval(tick, speed);
    }

    // ── START BUTTON ─────────────────────────────
    startBtn?.addEventListener('click', () => {
        if (gameState === 'paused') { resumeGame(); return; }
        highScore = highScore || 0;
        init();
    });

    // ── INITIAL DRAW ─────────────────────────────
    gameState = 'idle';
    highScore = 0;

    // Draw idle screen
    function drawIdleScreen() {
        const colors = getColors();
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);
        drawGrid(colors);

        // Draw a decorative snake
        const demoSnake = [
            {x:10,y:10},{x:9,y:10},{x:8,y:10},{x:7,y:10},
            {x:6,y:10},{x:6,y:9},{x:6,y:8},{x:7,y:8},{x:8,y:8}
        ];
        demoSnake.forEach((seg, i) => {
            const t = 1 - i / demoSnake.length;
            ctx.fillStyle = i === 0 ? colors.snakeHead : colors.snakeBody.replace(')', `,${0.2 + 0.6*t})`).replace('rgb', 'rgba');
            ctx.shadowBlur  = i === 0 ? 10 : 0;
            ctx.shadowColor = colors.snakeGlow;
            roundRect(ctx, seg.x*CELL+1, seg.y*CELL+1, CELL-2, CELL-2, i===0?4:3);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    }

    // Listen for theme changes to redraw colors
    window.addEventListener('themeChanged', () => {
        if (gameState === 'idle') {
            drawIdleScreen();
        } else if (gameState === 'playing' || gameState === 'paused' || gameState === 'gameover') {
            draw();
        }
    });

    drawIdleScreen();
    showOverlay(
        '<span>SNAKE</span>.EXE',
        'USE ARROW KEYS OR WASD // SWIPE ON MOBILE',
        'INITIALIZE'
    );

})();