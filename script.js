/* ===================================================
   PORTFOLIO SINTYA KHOFIFAH — script.js
=================================================== */

/* ===== HAMBURGER MENU ===== */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('open');
});

navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
    });
});

/* ===== ACTIVE NAV ON SCROLL ===== */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.navbar ul li');

function updateActiveNav() {
    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 130) current = sec.getAttribute('id');
    });
    navItems.forEach(li => {
        li.classList.remove('active');
        const a = li.querySelector('a');
        if (a && a.getAttribute('href') === '#' + current) li.classList.add('active');
    });
}
window.addEventListener('scroll', updateActiveNav);
updateActiveNav();

/* ===== SCROLL REVEAL ===== */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

/* ===== SKILL BAR ANIMATION ===== */
const skillFills = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.width = entry.target.getAttribute('data-width') + '%';
            }, 200);
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });
skillFills.forEach(fill => skillObserver.observe(fill));

/* ===== CONTACT FORM ===== */
const form       = document.getElementById("contact-form");
const statusText = document.getElementById("form-status");

form.addEventListener("submit", function(e) {
    e.preventDefault();
    statusText.textContent = "Sending...";
    statusText.classList.remove('success');

    fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
    })
    .then(r => {
        if (r.ok) return r.json();
        // If not JSON, try text response
        return r.text().then(text => ({ text }));
    })
    .then(data => {
        statusText.textContent = "✓ Message Sent Successfully";
        statusText.classList.add('success');
        form.reset();
    })
    .catch(() => { 
        // Fallback: regular form submission
        statusText.textContent = "Sending via email...";
        form.submit();
    });
});


/* =====================================================
   CINEMATIC LIGHTBOX
===================================================== */

const lbHTML = `
<div class="lb-curtain"></div>
<div class="lb-stage"></div>
<div class="lb-overlay-info">
    <div class="lb-info-text">
        <span class="lb-tag"></span>
        <h3 class="lb-title"></h3>
        <p class="lb-desc"></p>
    </div>
    <span class="lb-counter"></span>
</div>
<button class="lb-close" aria-label="Tutup">&#x2715;</button>
<button class="lb-prev"  aria-label="Sebelumnya">&#8592;</button>
<button class="lb-next"  aria-label="Selanjutnya">&#8594;</button>
<div class="lb-dots"></div>
<div class="lb-swipe-hint">swipe</div>
`;

const lb = document.createElement('div');
lb.id = 'lightbox';
lb.innerHTML = lbHTML;
document.body.appendChild(lb);

const lbStage   = lb.querySelector('.lb-stage');
const lbTag     = lb.querySelector('.lb-tag');
const lbTitle   = lb.querySelector('.lb-title');
const lbDesc    = lb.querySelector('.lb-desc');
const lbCounter = lb.querySelector('.lb-counter');
const lbClose   = lb.querySelector('.lb-close');
const lbPrev    = lb.querySelector('.lb-prev');
const lbNext    = lb.querySelector('.lb-next');
const lbDots    = lb.querySelector('.lb-dots');
const lbCurtain = lb.querySelector('.lb-curtain');

let cards = [];
let current = 0;
let isAnimating = false;

function collectCards() {
    cards = [];
    document.querySelectorAll('.work-card').forEach(card => {
        const imgEl = card.querySelector('.work-card-img img');
        const vidEl = card.querySelector('.work-card-img video');
        const bgEl  = card.querySelector('.work-card-img');
        cards.push({
            src     : card.dataset.media || (imgEl ? imgEl.src : '') || '',
            type    : card.dataset.mediaType || (vidEl ? 'video' : 'image'),
            tag     : card.querySelector('.tag')?.textContent.trim() || '',
            title   : card.querySelector('h3')?.textContent.trim() || '',
            desc    : card.querySelector('p')?.textContent.trim() || '',
            bgStyle : bgEl?.getAttribute('style') || '',
        });
    });
}

function buildDots() {
    lbDots.innerHTML = '';
    cards.forEach((_, i) => {
        const d = document.createElement('button');
        d.className = 'lb-dot' + (i === current ? ' active' : '');
        d.setAttribute('aria-label', 'Slide ' + (i + 1));
        d.addEventListener('click', () => goTo(i, i > current ? 'right' : 'left'));
        lbDots.appendChild(d);
    });
}

function updateDots() {
    lbDots.querySelectorAll('.lb-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
    });
}

function createSlide(idx) {
    const d = cards[idx];
    const slide = document.createElement('div');
    slide.className = 'lb-slide';
    slide.dataset.idx = idx;

    if (d.type === 'video' && d.src) {
        const vid = document.createElement('video');
        vid.src = d.src;
        vid.controls = true;
        vid.loop = true;
        vid.playsInline = true;
        slide.appendChild(vid);
    } else if (d.src) {
        const img = document.createElement('img');
        img.src = d.src;
        img.alt = d.title;
        img.draggable = false;
        slide.appendChild(img);
    } else {
        const ph = document.createElement('div');
        ph.className = 'lb-placeholder';
        ph.style.cssText = d.bgStyle || 'background:linear-gradient(135deg,#b65656,#601414)';
        ph.innerHTML = '<span>' + d.title + '</span>';
        slide.appendChild(ph);
    }
    return slide;
}

function updateInfo(idx) {
    const d = cards[idx];
    lbTag.textContent     = d.tag;
    lbTitle.textContent   = d.title;
    lbDesc.textContent    = d.desc;
    lbCounter.textContent = String(idx + 1).padStart(2,'0') + ' / ' + String(cards.length).padStart(2,'0');
    lbPrev.disabled = idx === 0;
    lbNext.disabled = idx === cards.length - 1;
}

function goTo(nextIdx, direction) {
    if (isAnimating || nextIdx === current) return;
    if (nextIdx < 0 || nextIdx >= cards.length) return;
    isAnimating = true;

    const oldSlide  = lbStage.querySelector('.lb-slide.active');
    const newSlide  = createSlide(nextIdx);
    const enterCls  = direction === 'right' ? 'enter-right' : 'enter-left';
    const exitCls   = direction === 'right' ? 'exit-left'   : 'exit-right';

    lbStage.appendChild(newSlide);

    if (oldSlide) {
        oldSlide.classList.add(exitCls);
        oldSlide.addEventListener('animationend', () => oldSlide.remove(), { once: true });
    }

    requestAnimationFrame(() => {
        newSlide.classList.add('active', enterCls);
        newSlide.addEventListener('animationend', () => {
            newSlide.classList.remove(enterCls);
            isAnimating = false;
        }, { once: true });
    });

    current = nextIdx;
    updateInfo(current);
    updateDots();

    const vid = newSlide.querySelector('video');
    if (vid) vid.play().catch(() => {});
}

function openLightbox(idx) {
    collectCards();
    current = idx;
    lbStage.innerHTML = '';

    const slide = createSlide(idx);
    slide.classList.add('active', 'enter-fade');
    slide.addEventListener('animationend', () => slide.classList.remove('enter-fade'), { once: true });
    lbStage.appendChild(slide);

    const vid = slide.querySelector('video');
    if (vid) vid.play().catch(() => {});

    updateInfo(idx);
    buildDots();

    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
    isAnimating = false;
    setTimeout(() => {
        lbStage.querySelectorAll('video').forEach(v => v.pause());
        lbStage.innerHTML = '';
    }, 600);
}

lbClose.addEventListener('click', closeLightbox);
lbCurtain.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => { if (current > 0) goTo(current - 1, 'left'); });
lbNext.addEventListener('click', () => { if (current < cards.length - 1) goTo(current + 1, 'right'); });

document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lbPrev.click();
    if (e.key === 'ArrowRight') lbNext.click();
});

/* Touch / Swipe */
let touchStartX = 0, touchStartY = 0;
lb.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });
lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (Math.abs(dx) > 50 && dy < 60) {
        if (dx < 0) lbNext.click(); else lbPrev.click();
    }
}, { passive: true });

/* Custom cursor */
const cursor = document.createElement('div');
// cursor.className = 'lb-cursor';
// cursor.textContent = 'View';
document.body.appendChild(cursor);

let cursorRaf;
document.querySelectorAll('.work-card').forEach((card, idx) => {
    card.addEventListener('mouseenter', () => cursor.classList.add('visible'));
    card.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
    card.addEventListener('click', () => {
        cursor.classList.remove('visible');
        openLightbox(idx);
    });
});

document.addEventListener('mousemove', e => {
    cancelAnimationFrame(cursorRaf);
    cursorRaf = requestAnimationFrame(() => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top  = e.clientY + 'px';
    });
});