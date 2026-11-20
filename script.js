document.addEventListener('DOMContentLoaded', () => {
    // Generate Background Particles
    createParticles();

    // Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealOnScroll.observe(reveal);
    });

    // Initial reveals for hero
    setTimeout(() => {
        document.querySelectorAll('#hero .reveal').forEach(el => el.classList.add('active'));
    }, 100);

    // Scratch Card Logic
    initScratchCard();
});

function createParticles() {
    const container = document.getElementById('particles');
    const count = 50;
    
    const shapes = ['♥', '✧', '']; // Empty string for standard glowing dots
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        if (shape !== '') {
            particle.innerHTML = shape;
            particle.style.background = 'transparent';
            particle.style.boxShadow = 'none';
            particle.style.color = (Math.random() > 0.5) ? 'var(--clr-gold)' : 'var(--clr-text-muted)';
            particle.style.fontSize = `${Math.random() * 15 + 10}px`;
        } else {
            const size = Math.random() * 4 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
        }
        
        const left = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 10 + 10;
        
        particle.style.left = `${left}vw`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        container.appendChild(particle);
    }
}

function initScratchCard() {
    const canvas = document.getElementById('scratch-card');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let scratchCount = 0;
    let hasPopped = false;
    
    // Resize canvas to match container
    function resizeCanvas() {
        const parent = canvas.parentElement;
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        fillCanvas();
    }
    
    // Draw golden gradient overlay with text
    function fillCanvas() {
        // Base gold gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#aa771c");
        gradient.addColorStop(0.5, "#f9e596");
        gradient.addColorStop(1, "#aa771c");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text prompt
        ctx.font = "italic 22px 'Cinzel', serif";
        ctx.fillStyle = "#3a0108";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Scratch with your cursor", canvas.width / 2, canvas.height / 2);
    }

    // Fire Grand Celebration Pop (Multi-stage bursts with rich colors)
    function fireConfettiPop() {
        if (typeof confetti !== 'undefined') {
            const colors = ['#d4af37', '#f9e596', '#ffffff', '#e84393', '#6a2a3b', '#ff7675', '#ffd700'];
            
            // 1. Initial dual cannons from left and right edges
            confetti({
                particleCount: 90,
                angle: 60,
                spread: 75,
                origin: { x: 0.05, y: 0.65 },
                colors: colors,
                scalar: 1.2
            });
            confetti({
                particleCount: 90,
                angle: 120,
                spread: 75,
                origin: { x: 0.95, y: 0.65 },
                colors: colors,
                scalar: 1.2
            });
            
            // 2. High-energy secondary burst from quarter points (400ms)
            setTimeout(() => {
                confetti({
                    particleCount: 70,
                    spread: 80,
                    origin: { x: 0.25, y: 0.5 },
                    colors: colors
                });
                confetti({
                    particleCount: 70,
                    spread: 80,
                    origin: { x: 0.75, y: 0.5 },
                    colors: colors
                });
            }, 400);

            // 3. Central golden explosion (800ms)
            setTimeout(() => {
                confetti({
                    particleCount: 110,
                    spread: 120,
                    origin: { x: 0.5, y: 0.45 },
                    colors: colors,
                    ticks: 220,
                    scalar: 1.15
                });
            }, 800);

            // 4. Starburst raining encore (1400ms)
            setTimeout(() => {
                confetti({
                    particleCount: 65,
                    spread: 90,
                    origin: { x: 0.35, y: 0.4 },
                    colors: colors
                });
                confetti({
                    particleCount: 65,
                    spread: 90,
                    origin: { x: 0.65, y: 0.4 },
                    colors: colors
                });
            }, 1400);

            // 5. Final shimmer shower (2000ms)
            setTimeout(() => {
                confetti({
                    particleCount: 85,
                    spread: 110,
                    origin: { x: 0.5, y: 0.3 },
                    colors: colors,
                    gravity: 0.85
                });
            }, 2000);
        }
    }

    // Automatically check if card is ~40-50% scratched and trigger reveal
    function checkScratchedArea() {
        if (hasPopped) return;
        try {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            let clearedCount = 0;
            let totalSampled = 0;
            const stride = 16 * 4; // Sample every 16th pixel
            for (let i = 3; i < data.length; i += stride) {
                totalSampled++;
                if (data[i] < 128) {
                    clearedCount++;
                }
            }
            const ratio = clearedCount / totalSampled;
            if (ratio >= 0.40) {
                triggerReveal();
            }
        } catch (e) {
            if (scratchCount > 55) {
                triggerReveal();
            }
        }
    }

    function triggerReveal() {
        if (hasPopped) return;
        hasPopped = true;
        fireConfettiPop();
        
        // Smoothly fade out the canvas so the surprise reveals completely
        canvas.style.transition = 'opacity 0.7s cubic-bezier(0.25, 1, 0.5, 1)';
        canvas.style.opacity = '0';
        setTimeout(() => {
            canvas.style.pointerEvents = 'none';
            canvas.style.display = 'none';
        }, 700);
    }

    // Handle scratch (erasing) continuously and smoothly
    function scratch(x, y) {
        if (hasPopped) return;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 65; // Generous brush for smooth scratching
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        lastX = x;
        lastY = y;
        
        scratchCount++;
        // Check scratched area periodically
        if (scratchCount % 6 === 0) {
            checkScratchedArea();
        }
        // Safety threshold
        if (scratchCount >= 65) {
            triggerReveal();
        }
    }

    // Events
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
        scratch(e.offsetX, e.offsetY);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        scratch(e.offsetX, e.offsetY);
    });

    window.addEventListener('mouseup', () => {
        isDrawing = false;
        if (!hasPopped && scratchCount > 15) {
            checkScratchedArea();
        }
    });
    
    canvas.addEventListener('mouseenter', (e) => {
        // If mouse button is held down while re-entering
        if (e.buttons === 1) {
            isDrawing = true;
            lastX = e.offsetX;
            lastY = e.offsetY;
        }
    });

    // Touch support for mobile
    canvas.addEventListener('touchstart', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.touches[0].clientX - rect.left;
        lastY = e.touches[0].clientY - rect.top;
        scratch(lastX, lastY);
        e.preventDefault();
    });

    canvas.addEventListener('touchmove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        scratch(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
        e.preventDefault();
    });

    canvas.addEventListener('touchend', () => {
        isDrawing = false;
        if (!hasPopped && scratchCount > 15) {
            checkScratchedArea();
        }
    });

    // Init
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}
