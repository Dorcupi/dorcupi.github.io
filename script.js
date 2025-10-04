// ---------- STARFIELD ----------
(function () {
    const canvas = document.getElementById('stars');
    const ctx = canvas.getContext('2d');
    let w, h, stars = [];

    function resize() {
        w = canvas.width = innerWidth * devicePixelRatio;
        h = canvas.height = innerHeight * devicePixelRatio;
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        initStars(Math.floor((innerWidth + innerHeight) / 6));
    }

    function initStars(n) {
        stars = [];
        for (let i = 0; i < n; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.6 * devicePixelRatio + 0.2,
                vx: (Math.random() - 0.5) * 0.02 * devicePixelRatio,
                alpha: 0.2 + Math.random() * 0.9
            })
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        // subtle gradient background to add depth
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(4,2,10,1)');
        g.addColorStop(1, 'rgba(2,4,8,1)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        // draw stars
        for (const s of stars) {
            s.x += s.vx;
            s.y += Math.sin((Date.now() + s.x) * 0.0005) * 0.15;
            if (s.x > w) s.x = 0;
            if (s.x < 0) s.x = w;
            if (s.y > h) s.y = 0;
            ctx.beginPath();
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = '#fff';
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }

    addEventListener('resize', () => { resize() });
    resize();
    requestAnimationFrame(draw);
})();

// ---------- TYPING EFFECT ----------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function typeText(targetEl, text, speed = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--type-speed'))) {
    targetEl.textContent = '';
    for (let i = 0; i < text.length; i++) {
        targetEl.textContent += text[i];
        await sleep(speed + Math.random() * 10);
    }
}

// start sequence on load
(async function () {
    const main = document.querySelector('.title');
    const optionEls = Array.from(document.querySelectorAll('.option'));
    const headings = ["Dorcupi", "DorcDev", "Divine's Apps"];

    // type main heading
    await typeText(main, 'What are you looking for?', 28);

    // add caret to main for style
    const caret = document.createElement('span');
    caret.className = 'caret';
    main.appendChild(caret);

    // small delay then type each option's h2
    await sleep(500);

    // position the typed text slightly staggered
    for (let i = 0; i < optionEls.length; i++) {
        const h2 = optionEls[i].querySelector('h2');
        // small visual pause between each
        await typeText(h2, headings[i], 40);
        // add an accessible aria-label for the link
        optionEls[i].setAttribute('aria-label', headings[i] + ' — click to visit ' + optionEls[i].dataset.target);
        await sleep(250);
    }

    // remove caret after typing
    caret.remove();
})();

// Enhance keyboard activation (Enter/Space) for anchors
document.querySelectorAll('.option').forEach(opt => {
    opt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            opt.click();
        }
    })
});