/* ================= CẤU HÌNH — SỬA Ở ĐÂY ================= */

const CONFIG = {

    // Tên người yêu. Để "" thì trang sẽ gọi là "em".
    tenEm: "Yêu của anh",

    // Chữ ký cuối lá thư.
    chuKy: "Chàng học viên của em",

    // Ngày nhập học ở Học viện (YYYY-MM-DD) — đếm số ngày anh là học viên.
    ngayNhapHoc: "",

    // Ngày dự kiến ra trường (YYYY-MM-DD) — đếm ngược. Để "" nếu chưa muốn hiện.
    ngayRaTruong: "",

    // Âm lượng nhạc nền (0 → 1).
    amLuong: .8
};


const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;



/* ================= CHIỀU CAO MÀN HÌNH THẬT ================= */

// Trên iPhone (Safari, Zalo, Messenger...) 100vh tính cả phần bị thanh công cụ che,
// nên nội dung bị cắt. Đo chiều cao thật rồi đưa vào biến CSS --vh.

let lastWidth = 0;
let lastHeight = 0;


function setViewportUnit(force) {

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Thanh địa chỉ co/giãn khi cuộn chỉ đổi chiều cao một chút -> bỏ qua để trang không bị giật
    if (!force && w === lastWidth && Math.abs(h - lastHeight) < 160) return;

    lastWidth = w;
    lastHeight = h;

    document.documentElement.style.setProperty("--vh", (h * .01) + "px");
}


setViewportUnit(true);

window.addEventListener("resize", function () { setViewportUnit(false); });

window.addEventListener("orientationchange", function () {
    setTimeout(function () { setViewportUnit(true); }, 300);
});



/* ================= CÁ NHÂN HÓA ================= */

if (CONFIG.tenEm) {

    document
        .querySelectorAll(".js-her-name")
        .forEach(function (el) {
            el.textContent = CONFIG.tenEm;
        });

    document
        .querySelectorAll(".js-greeting")
        .forEach(function (el) {
            el.textContent = CONFIG.tenEm + ",";
        });
}


if (CONFIG.chuKy) {

    document
        .querySelectorAll(".js-his-name")
        .forEach(function (el) {
            el.textContent = CONFIG.chuKy;
        });
}


function parseDate(text) {

    if (!text) return null;

    const parts = text.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);

    return isNaN(date.getTime()) ? null : date;
}


function daysBetween(from, to) {
    return Math.floor((to - from) / 86400000);
}


const today = new Date();
const startDate = parseDate(CONFIG.ngayNhapHoc);
const endDate = parseDate(CONFIG.ngayRaTruong);

const daysAsCadet =
    startDate && daysBetween(startDate, today) >= 0
        ? daysBetween(startDate, today)
        : null;

const daysToGraduate =
    endDate && daysBetween(today, endDate) > 0
        ? daysBetween(today, endDate) + 1
        : null;


if (daysToGraduate !== null) {

    document.querySelector(".js-countdown-label").textContent = "NGÀY NỮA ANH RA TRƯỜNG";
}


function countUp(el, target) {

    if (reduceMotion) {
        el.textContent = target;
        return;
    }

    const duration = 1800;
    const begin = performance.now();

    function tick(now) {

        const t = Math.min((now - begin) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);

        el.textContent = Math.round(target * eased);

        if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}


function startCounters() {

    const targets = [];

    if (daysAsCadet !== null) {
        document.querySelectorAll(".js-days").forEach(function (el) {
            targets.push([el, daysAsCadet]);
        });
    }

    if (daysToGraduate !== null) {
        targets.push([document.querySelector(".js-countdown"), daysToGraduate]);
    }


    const counterObserver = new IntersectionObserver(function (entries) {

        entries.forEach(function (entry) {

            if (!entry.isIntersecting) return;

            const pair = targets.find(function (p) { return p[0] === entry.target; });

            countUp(pair[0], pair[1]);
            counterObserver.unobserve(entry.target);
        });

    }, { threshold: .5 });


    targets.forEach(function (pair) {
        counterObserver.observe(pair[0]);
    });
}



/* ================= BẦU TRỜI SAO ================= */

function initStars(canvas) {

    const ctx = canvas.getContext("2d");
    const count = Number(canvas.dataset.stars) || 150;
    const shooting = canvas.dataset.shooting === "true";

    const stars = Array.from({ length: count }, function () {
        return {
            x: Math.random(),
            y: Math.random() * .85,
            r: Math.random() * 1.3 + .25,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * .02 + .005,
            gold: Math.random() < .12
        };
    });

    let shoots = [];
    let width = 0;
    let height = 0;
    let onScreen = true;


    function resize() {

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        width = canvas.offsetWidth;
        height = canvas.offsetHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }


    function draw() {

        ctx.clearRect(0, 0, width, height);

        stars.forEach(function (s) {

            s.phase += s.speed;

            const alpha = .35 + Math.sin(s.phase) * .35 + .3;

            ctx.beginPath();
            ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
            ctx.fillStyle = s.gold
                ? "rgba(238, 219, 168," + alpha + ")"
                : "rgba(255, 255, 255," + alpha * .85 + ")";
            ctx.fill();
        });


        if (shooting && Math.random() < .006 && shoots.length < 2) {

            shoots.push({
                x: Math.random() * width * .7 + width * .2,
                y: Math.random() * height * .35,
                vx: -(Math.random() * 6 + 7),
                vy: Math.random() * 3 + 3,
                life: 1
            });
        }


        shoots = shoots.filter(function (p) {

            p.x += p.vx;
            p.y += p.vy;
            p.life -= .018;

            const tail = ctx.createLinearGradient(p.x, p.y, p.x - p.vx * 12, p.y - p.vy * 12);
            tail.addColorStop(0, "rgba(255, 245, 210," + Math.max(p.life, 0) + ")");
            tail.addColorStop(1, "rgba(255, 245, 210, 0)");

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 12, p.y - p.vy * 12);
            ctx.strokeStyle = tail;
            ctx.lineWidth = 1.6;
            ctx.stroke();

            return p.life > 0;
        });
    }


    function loop() {

        if (onScreen && width > 0) draw();

        requestAnimationFrame(loop);
    }


    new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
    }).observe(canvas);


    window.addEventListener("resize", function () {
        resize();
        if (reduceMotion) draw();
    });


    resize();

    if (reduceMotion) draw();
    else loop();
}


document
    .querySelectorAll("canvas.stars")
    .forEach(initStars);



/* ================= NHẠC NỀN ================= */

const music = document.getElementById("backgroundMusic");
const player = document.getElementById("player");
const playerToggle = document.getElementById("playerToggle");
const playerIcon = document.getElementById("playerIcon");

let userPaused = false;
let fadeTimer = null;


function setPlaying(on) {

    player.classList.toggle("playing", on);
    playerIcon.textContent = on ? "❚❚" : "▶";
}


function fadeIn() {

    clearInterval(fadeTimer);

    music.volume = 0;

    // iPhone không cho chỉnh âm lượng bằng code -> vòng lặp tự dừng ngay
    fadeTimer = setInterval(function () {

        const next = Math.min(music.volume + .04, CONFIG.amLuong);

        music.volume = next;

        if (music.volume >= CONFIG.amLuong || next >= CONFIG.amLuong) clearInterval(fadeTimer);

    }, 80);
}


function startMusic() {

    if (!music.paused) return;

    music.volume = 0;

    const attempt = music.play();

    if (attempt && attempt.then) {
        attempt.then(fadeIn).catch(function () { setPlaying(false); });
    }
    else {
        fadeIn();
    }
}


music.addEventListener("play", function () { setPlaying(true); });
music.addEventListener("pause", function () { setPlaying(false); });


playerToggle.addEventListener("click", function () {

    if (music.paused) {
        userPaused = false;
        startMusic();
    }
    else {
        userPaused = true;
        music.pause();
    }
});


// Trình duyệt chặn tự phát nhạc cho tới khi người xem chạm vào trang:
// thử phát ngay, nếu bị chặn thì phát ở lần chạm / bấm phím đầu tiên.
startMusic();

["touchend", "click", "keydown"].forEach(function (type) {

    window.addEventListener(type, function once() {

        if (!userPaused && music.paused) startMusic();

        window.removeEventListener(type, once);

    }, { passive: true });
});



/* ================= MỞ THƯ ================= */

const intro = document.getElementById("intro");
const openLetter = document.getElementById("openLetter");

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

window.scrollTo(0, 0);


document
    .querySelectorAll(".reveal-hero")
    .forEach(function (el, i) {
        el.style.setProperty("--d", (.35 + i * .16) + "s");
    });


openLetter.addEventListener("click", function () {

    if (intro.classList.contains("opening")) return;

    startMusic();

    intro.classList.add("opening");

    setTimeout(function () {

        window.scrollTo(0, 0);

        intro.classList.add("hide");

        document.body.classList.remove("is-locked");
        document.body.classList.add("is-ready");

        startCounters();
        onScroll();

    }, reduceMotion ? 0 : 1800);

    setTimeout(function () {
        intro.style.display = "none";
    }, reduceMotion ? 50 : 3000);
});



/* ================= HIỆN DẦN KHI CUỘN ================= */

document
    .querySelectorAll(".gallery, .promise-grid")
    .forEach(function (group) {

        Array.from(group.children).forEach(function (child, i) {
            child.style.setProperty("--delay", (i * .14) + "s");
        });
    });


const revealObserver = new IntersectionObserver(function (entries) {

    entries.forEach(function (entry) {

        if (!entry.isIntersecting) return;

        const el = entry.target;

        el.classList.add("visible");
        revealObserver.unobserve(el);

        // bỏ độ trễ sau khi hiện để hiệu ứng hover phản hồi ngay
        setTimeout(function () {
            el.style.removeProperty("--delay");
        }, 1800);
    });

}, {
    threshold: .12,
    rootMargin: "0px 0px -5% 0px"
});


document
    .querySelectorAll("[data-reveal]")
    .forEach(function (el) {
        revealObserver.observe(el);
    });



/* ================= HAI NHỊP ĐẬP: CHỮ SÁNG THEO CUỘN ================= */

const heartbeat = document.getElementById("heartbeat");
const heartbeatText = document.getElementById("heartbeatText");


function splitWords(el) {

    const nodes = Array.from(el.childNodes);

    el.innerHTML = "";

    nodes.forEach(function (node) {

        const accent = node.nodeType === 1;

        node.textContent.split(/(\s+)/).forEach(function (part) {

            if (!part) return;

            if (/^\s+$/.test(part)) {
                el.appendChild(document.createTextNode(" "));
                return;
            }

            const span = document.createElement("span");

            span.className = accent ? "w accent" : "w";
            span.textContent = part;

            el.appendChild(span);
        });
    });

    return el.querySelectorAll(".w");
}


const heartbeatWords = splitWords(heartbeatText);



/* ================= CUỘN: NAVBAR, NÚI, NHẬT KÝ ================= */

const navbar = document.getElementById("navbar");
const depthLayers = document.querySelectorAll("[data-depth]");
const diaryList = document.querySelector(".diary-list");
const diaryFill = document.getElementById("diaryFill");

let ticking = false;


function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}


function onScroll() {

    const y = window.pageYOffset;
    const vh = window.innerHeight;


    navbar.classList.toggle("scrolled", y > 40);


    if (!reduceMotion && y < vh * 1.3) {

        depthLayers.forEach(function (layer) {
            layer.style.transform =
                "translate3d(0," + (y * Number(layer.dataset.depth)) + "px,0)";
        });
    }


    // Màn hình quá thấp (xoay ngang) thì đoạn này không "dính" -> sáng hết chữ
    const hb = heartbeat.getBoundingClientRect();
    const travel = hb.height - vh;

    let lit = heartbeatWords.length;

    if (!reduceMotion && travel > 40) {
        lit = Math.ceil(clamp(-hb.top / travel, 0, 1) * 1.2 * heartbeatWords.length);
    }

    heartbeatWords.forEach(function (word, i) {
        word.classList.toggle("on", i < lit);
    });


    const dl = diaryList.getBoundingClientRect();
    const dlProgress = clamp((vh * .6 - dl.top) / dl.height, 0, 1);

    diaryFill.style.height = (dlProgress * 100) + "%";


    ticking = false;
}


window.addEventListener("scroll", function () {

    if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
    }

}, { passive: true });


window.addEventListener("resize", onScroll);

onScroll();



/* ================= ẢNH TỪ THƯ MỤC images/ ================= */

// Ảnh nền cho hai khung "Nơi anh / Nơi em" (nếu có images/hocvien.jpg, images/home.jpg)
[
    [".world.cadet", "../images/hocvien.jpg"],
    [".world.home", "../images/home.jpg"]
].forEach(function (pair) {

    const el = document.querySelector(pair[0]);
    const img = new Image();

    img.onload = function () {
        el.style.setProperty("--photo", "url('" + pair[1] + "')");
        el.classList.add("has-photo");
    };

    img.src = pair[1];
});


const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox.querySelector("img");


document
    .querySelectorAll(".polaroid")
    .forEach(function (card) {

        const img = card.querySelector("img");

        function markMissing() {
            card.classList.add("missing");
        }

        if (img.complete && img.naturalWidth === 0) markMissing();

        img.addEventListener("error", markMissing);


        card.addEventListener("click", function () {

            if (card.classList.contains("missing")) return;

            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add("open");
        });
    });


lightbox.addEventListener("click", function () {
    lightbox.classList.remove("open");
});


document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") lightbox.classList.remove("open");
});



/* ================= TIM BAY ================= */

const heartColors = ["#c4342b", "#e2574c", "#d6b46a", "#eedba8", "#f08a7e"];


function burstHearts(x, y, amount) {

    const spread = Math.min(260, window.innerWidth * .7);

    for (let i = 0; i < amount; i++) {

        const heart = document.createElement("span");

        heart.className = "float-heart";
        heart.textContent = Math.random() < .2 ? "★" : "♥";

        heart.style.left = x + "px";
        heart.style.top = y + "px";
        heart.style.setProperty("--dx", (Math.random() * spread - spread / 2) + "px");
        heart.style.setProperty("--dy", -(Math.random() * 260 + 160) + "px");
        heart.style.setProperty("--rot", (Math.random() * 60 - 30) + "deg");
        heart.style.setProperty("--size", (Math.random() * 18 + 14) + "px");
        heart.style.setProperty("--time", (Math.random() * 1.2 + 1.6) + "s");
        heart.style.setProperty("--color", heartColors[i % heartColors.length]);

        heart.addEventListener("animationend", function () {
            heart.remove();
        });

        document.body.appendChild(heart);
    }
}


function centerOf(el) {

    const rect = el.getBoundingClientRect();

    return [rect.left + rect.width / 2, rect.top + rect.height / 2];
}



/* ================= LỜI HỨA ================= */

const promiseCards = document.querySelectorAll(".promise-card");
let promisesDone = false;


promiseCards.forEach(function (card) {

    card.addEventListener("click", function () {

        card.classList.toggle("flipped");

        const allOpen = Array.from(promiseCards).every(function (c) {
            return c.classList.contains("flipped");
        });

        if (allOpen && !promisesDone) {

            promisesDone = true;

            const pos = centerOf(card);

            burstHearts(pos[0], pos[1], 24);
        }
    });
});



/* ================= GỬI ANH MỘT CÁI ÔM ================= */

const hugButton = document.getElementById("hugButton");
const hugCount = document.getElementById("hugCount");

const hugMessages = [
    "Anh nhận được rồi ♥",
    "Đủ ấm cho cả tuần học ♥",
    "Thêm một cái nữa là anh thuộc bài ngay ♥",
    "Cả phòng ghen tị với anh rồi đấy ♥",
    "Ra trường anh sẽ ôm em thật chặt ♥"
];

let hugs = 0;


hugButton.addEventListener("click", function () {

    const pos = centerOf(hugButton);

    burstHearts(pos[0], pos[1], 18);

    hugCount.textContent =
        hugMessages[hugs % hugMessages.length] +
        (hugs > 0 ? "  ×" + (hugs + 1) : "");

    hugs++;

    hugCount.classList.remove("pop");
    void hugCount.offsetWidth;
    hugCount.classList.add("pop");
});
