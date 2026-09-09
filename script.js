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

    // Fire Celebration Pop
    function fireConfettiPop() {
        if (typeof confetti !== 'undefined') {
            const colors = ['#d4af37', '#f9e596', '#6a2a3b', '#eac5cc'];
            
            // 1. Initial large pop from both edges
            confetti({ particleCount: 60, spread: 60, origin: { x: 0.1, y: 0.6 }, colors: colors, disableForReducedMotion: true });
            confetti({ particleCount: 60, spread: 60, origin: { x: 0.9, y: 0.6 }, colors: colors, disableForReducedMotion: true });
            
            // 2. Secondary medium pop a moment later
            setTimeout(() => {
                confetti({ particleCount: 40, spread: 70, origin: { x: 0.25, y: 0.5 }, colors: colors });
                confetti({ particleCount: 40, spread: 70, origin: { x: 0.75, y: 0.5 }, colors: colors });
            }, 1000);

            // 3. Final elegant center pop
            setTimeout(() => {
                confetti({ particleCount: 50, spread: 100, origin: { x: 0.5, y: 0.4 }, colors: colors });
            }, 2200);
        }
    }

    // Handle scratch (erasing) continuously and smoothly
    function scratch(x, y) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 60; // Thicker brush for easier scratching
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        lastX = x;
        lastY = y;
        
        scratchCount++;
        // Trigger pop after user has scratched a fair amount
        if (scratchCount > 60 && !hasPopped) {
            hasPopped = true;
            fireConfettiPop();
            
            // Fade out the scratch layer after the pop so they can scroll
            setTimeout(() => {
                canvas.style.transition = 'opacity 1s ease';
                canvas.style.opacity = '0';
                setTimeout(() => {
                    canvas.style.pointerEvents = 'none';
                }, 1000);
            }, 1000);
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

    window.addEventListener('mouseup', () => isDrawing = false);
    
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

    canvas.addEventListener('touchend', () => isDrawing = false);

    // Init
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}
