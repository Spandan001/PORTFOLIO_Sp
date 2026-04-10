/* ============================================================
   RED SHIELD TEAM — CYBERSECURITY PORTFOLIO
   Enhanced intro + Three.js hero + GSAP ScrollTrigger +
   Interactive About strings + RED SHIELD TEAM zoom +
   Globe.gl + Live News
   ============================================================ */

"use strict";

// ── Constants ──────────────────────────────────────────────
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?<>{}";
const ROLE_TITLES = [
  "Penetration Tester",
  "Cybersecurity Analyst",
  "VAPT Specialist",
  "Bug Hunter",
];

// ── Custom cursor ──────────────────────────────────────────
(function initCursor() {
  document.addEventListener("mousemove", (e) => {
    document.body.style.setProperty("--cx", e.clientX + "px");
    document.body.style.setProperty("--cy", e.clientY + "px");
  });
})();

// ── Hero flashlight effect ─────────────────────────────────
(function initFlashlight() {
  const hero = document.getElementById("home");
  const fl = document.getElementById("heroFlashlight");
  if (!hero || !fl) return;
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(2);
    const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(2);
    fl.style.setProperty("--mx", x + "%");
    fl.style.setProperty("--my", y + "%");
  });
})();

// ── Three.js Interactive Hero Background ───────────────────
(function initThreeHero() {
  const canvas = document.getElementById("heroWebGLCanvas");
  if (!canvas || typeof THREE === "undefined") return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const hero = document.getElementById("home");

  function resize() {
    const w = hero.offsetWidth;
    const h = hero.offsetHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const PARTICLE_COUNT = window.innerWidth < 768 ? 600 : 1500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (Math.random() - 0.5) * 14;
    const y = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 8;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    velocities.push(
      (Math.random() - 0.5) * 0.002,
      (Math.random() - 0.5) * 0.002,
      (Math.random() - 0.5) * 0.001
    );

    if (Math.random() < 0.65) {
      colors[i * 3] = 0.8 + Math.random() * 0.2;
      colors[i * 3 + 1] = 0.05 + Math.random() * 0.1;
      colors[i * 3 + 2] = 0.05 + Math.random() * 0.1;
    } else {
      colors[i * 3] = 0.35 + Math.random() * 0.2;
      colors[i * 3 + 1] = 0.1 + Math.random() * 0.1;
      colors[i * 3 + 2] = 0.6 + Math.random() * 0.2;
    }
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const lineGeometry = new THREE.BufferGeometry();
  const MAX_LINES = 800;
  const linePositions = new Float32Array(MAX_LINES * 6);
  const lineColors = new Float32Array(MAX_LINES * 6);
  lineGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(linePositions, 3)
  );
  lineGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(lineColors, 3)
  );
  lineGeometry.setDrawRange(0, 0);

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  const mouse = { x: 0, y: 0 };
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });

  let time = 0;
  let animating = true;

  function animate() {
    if (!animating) return;
    requestAnimationFrame(animate);
    time += 0.003;

    const pos = geometry.attributes.position.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] += velocities[i3] + Math.sin(time + i * 0.01) * 0.0003;
      pos[i3 + 1] += velocities[i3 + 1] + Math.cos(time + i * 0.01) * 0.0003;
      pos[i3 + 2] += velocities[i3 + 2];

      if (Math.abs(pos[i3]) > 7) pos[i3] = -pos[i3] * 0.9;
      if (Math.abs(pos[i3 + 1]) > 5) pos[i3 + 1] = -pos[i3 + 1] * 0.9;
      if (Math.abs(pos[i3 + 2]) > 4) pos[i3 + 2] = -pos[i3 + 2] * 0.9;
    }

    geometry.attributes.position.needsUpdate = true;

    let lineCount = 0;
    const connectionDist = 1.8;
    const step = PARTICLE_COUNT > 1000 ? 3 : 1;

    for (let i = 0; i < PARTICLE_COUNT && lineCount < MAX_LINES; i += step) {
      for (
        let j = i + step;
        j < PARTICLE_COUNT && lineCount < MAX_LINES;
        j += step
      ) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist) * 0.3;
          const li = lineCount * 6;
          linePositions[li] = pos[i * 3];
          linePositions[li + 1] = pos[i * 3 + 1];
          linePositions[li + 2] = pos[i * 3 + 2];
          linePositions[li + 3] = pos[j * 3];
          linePositions[li + 4] = pos[j * 3 + 1];
          linePositions[li + 5] = pos[j * 3 + 2];

          lineColors[li] = alpha;
          lineColors[li + 1] = alpha * 0.1;
          lineColors[li + 2] = alpha * 0.1;
          lineColors[li + 3] = alpha;
          lineColors[li + 4] = alpha * 0.1;
          lineColors[li + 5] = alpha * 0.1;

          lineCount++;
        }
      }
    }

    lineGeometry.setDrawRange(0, lineCount * 2);
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;

    camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    particles.rotation.y = time * 0.5;
    particles.rotation.x = Math.sin(time) * 0.1;

    renderer.render(scene, camera);
  }

  const heroObserver = new IntersectionObserver(
    (entries) => {
      animating = entries[0].isIntersecting;
      if (animating) animate();
    },
    { threshold: 0.1 }
  );
  heroObserver.observe(hero);
  animate();
})();

// ══════════════════════════════════════════════════════════════
// ABOUT SECTION — Interactive Red String Network (chkstepan-style)
// Three.js WebGL lines that distort/ripple on mouse proximity
// ══════════════════════════════════════════════════════════════
(function initAboutStrings() {
  const canvas = document.getElementById("aboutStringCanvas");
  const section = document.getElementById("about");
  if (!canvas || !section || typeof THREE === "undefined") return;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const w = section.offsetWidth;
    const h = section.offsetHeight;
    renderer.setSize(w, h);
    const aspect = w / h;
    camera.left = -aspect;
    camera.right = aspect;
    camera.top = 1;
    camera.bottom = -1;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  // --- Create node network ---
  const NODE_COUNT = 120;
  const nodes = [];
  const aspect = section.offsetWidth / section.offsetHeight;

  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: (Math.random() - 0.5) * aspect * 2.4,
      y: (Math.random() - 0.5) * 2.4,
      restX: 0,
      restY: 0,
      vx: 0,
      vy: 0,
    });
    nodes[i].restX = nodes[i].x;
    nodes[i].restY = nodes[i].y;
  }

  // --- Find connections (k-nearest neighbors) ---
  const connections = [];
  const MAX_CONNECTIONS = 400;
  const CONNECTION_DIST = 0.6;

  for (let i = 0; i < NODE_COUNT; i++) {
    const distances = [];
    for (let j = 0; j < NODE_COUNT; j++) {
      if (i === j) continue;
      const dx = nodes[i].restX - nodes[j].restX;
      const dy = nodes[i].restY - nodes[j].restY;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < CONNECTION_DIST) {
        distances.push({ idx: j, dist: d });
      }
    }
    distances.sort((a, b) => a.dist - b.dist);
    const nearest = distances.slice(0, 4);
    for (const n of nearest) {
      const key =
        Math.min(i, n.idx) + "_" + Math.max(i, n.idx);
      if (!connections.find((c) => c.key === key)) {
        connections.push({
          a: i,
          b: n.idx,
          key: key,
          dist: n.dist,
        });
      }
      if (connections.length >= MAX_CONNECTIONS) break;
    }
    if (connections.length >= MAX_CONNECTIONS) break;
  }

  // --- Build line geometry ---
  const linePositions = new Float32Array(connections.length * 6);
  const lineColors = new Float32Array(connections.length * 6);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(linePositions, 3)
  );
  lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(linesMesh);

  // --- Node dots ---
  const dotPositions = new Float32Array(NODE_COUNT * 3);
  const dotColors = new Float32Array(NODE_COUNT * 3);
  const dotGeometry = new THREE.BufferGeometry();
  dotGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(dotPositions, 3)
  );
  dotGeometry.setAttribute("color", new THREE.BufferAttribute(dotColors, 3));

  const dotMaterial = new THREE.PointsMaterial({
    size: 3,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: false,
  });

  const dots = new THREE.Points(dotGeometry, dotMaterial);
  scene.add(dots);

  // --- Mouse tracking ---
  const mouse = { x: 9999, y: 9999, active: false };
  const MOUSE_RADIUS = 0.4;
  const REPULSION_STRENGTH = 0.06;
  const DAMPING = 0.92;
  const SPRING = 0.03;

  section.addEventListener("mousemove", (e) => {
    const rect = section.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    const asp = section.offsetWidth / section.offsetHeight;
    mouse.x = nx * asp;
    mouse.y = ny;
    mouse.active = true;
  });
  section.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  let animating = false;

  function animate() {
    if (!animating) return;
    requestAnimationFrame(animate);

    // --- Physics: repulsion + spring back ---
    for (let i = 0; i < NODE_COUNT; i++) {
      const node = nodes[i];

      // Spring back to rest position
      const dx = node.restX - node.x;
      const dy = node.restY - node.y;
      node.vx += dx * SPRING;
      node.vy += dy * SPRING;

      // Mouse repulsion
      if (mouse.active) {
        const mx = node.x - mouse.x;
        const my = node.y - mouse.y;
        const dist = Math.sqrt(mx * mx + my * my);
        if (dist < MOUSE_RADIUS && dist > 0.001) {
          const force =
            ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * REPULSION_STRENGTH;
          node.vx += (mx / dist) * force;
          node.vy += (my / dist) * force;
        }
      }

      // Apply velocity with damping
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      node.x += node.vx;
      node.y += node.vy;

      // Update dot positions
      dotPositions[i * 3] = node.x;
      dotPositions[i * 3 + 1] = node.y;
      dotPositions[i * 3 + 2] = 0;

      // Dot colors — brighter when displaced
      const displacement = Math.sqrt(
        (node.x - node.restX) ** 2 + (node.y - node.restY) ** 2
      );
      const brightness = Math.min(0.3 + displacement * 5, 1.0);
      dotColors[i * 3] = brightness;
      dotColors[i * 3 + 1] = brightness * 0.05;
      dotColors[i * 3 + 2] = brightness * 0.05;
    }

    dotGeometry.attributes.position.needsUpdate = true;
    dotGeometry.attributes.color.needsUpdate = true;

    // --- Update line positions ---
    for (let i = 0; i < connections.length; i++) {
      const conn = connections[i];
      const a = nodes[conn.a];
      const b = nodes[conn.b];
      const i6 = i * 6;

      linePositions[i6] = a.x;
      linePositions[i6 + 1] = a.y;
      linePositions[i6 + 2] = 0;
      linePositions[i6 + 3] = b.x;
      linePositions[i6 + 4] = b.y;
      linePositions[i6 + 5] = 0;

      // Line color — red, brighter when stretched/compressed
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const distortion = Math.abs(currentDist - conn.dist);
      const alpha = Math.min(0.15 + distortion * 3, 0.8);

      lineColors[i6] = alpha;
      lineColors[i6 + 1] = alpha * 0.05;
      lineColors[i6 + 2] = alpha * 0.08;
      lineColors[i6 + 3] = alpha;
      lineColors[i6 + 4] = alpha * 0.05;
      lineColors[i6 + 5] = alpha * 0.08;
    }

    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;

    renderer.render(scene, camera);
  }

  // Lazy rendering
  const observer = new IntersectionObserver(
    (entries) => {
      const wasAnimating = animating;
      animating = entries[0].isIntersecting;
      if (animating && !wasAnimating) animate();
    },
    { threshold: 0.05 }
  );
  observer.observe(section);
})();

// ── Scramble utility ───────────────────────────────────────
function scrambleText(el, finalText, speed = 28, stepSize = 0.35) {
  if (!el) return;
  let iteration = 0;
  clearInterval(el._scrambleTimer);
  el._scrambleTimer = setInterval(() => {
    el.innerText = finalText
      .split("")
      .map((ch, i) => {
        if (i < Math.floor(iteration)) return ch;
        if (ch === " " || ch === "\n") return ch;
        return SCRAMBLE_CHARS[
          Math.floor(Math.random() * SCRAMBLE_CHARS.length)
        ];
      })
      .join("");
    iteration += stepSize;
    if (iteration >= finalText.length) {
      clearInterval(el._scrambleTimer);
      el.innerText = finalText;
    }
  }, speed);
}

// ── HAKAI 3-PHASE LOADER (Enhanced) ───────────────────────
(function initLoader() {
  const overlay = document.getElementById("loader-overlay");
  const wordEl = document.getElementById("loader-word");
  const logoOverlay = document.getElementById("logo-zoom-overlay");

  if (!overlay || !wordEl || !logoOverlay) return;

  document.body.style.overflow = "hidden";

  const WORDS = [
    "ENCRYPTION",
    "CYBERSECURITY",
    "PENETRATION",
    "MALWARE",
    "PHISHING",
    "RED TEAMER",
    "NETWORK",
    "ARISHEM",
  ];
  let idx = 0;

  const showWord = () => {
    if (idx >= WORDS.length) {
      wordEl.style.transition = "opacity 0.3s, filter 0.3s";
      wordEl.style.opacity = "0";
      wordEl.style.filter = "blur(8px)";
      setTimeout(startPhase2, 350);
      return;
    }
    wordEl.style.animation = "none";
    wordEl.style.opacity = "1";
    wordEl.style.filter = "blur(0)";
    wordEl.style.transition = "";
    void wordEl.offsetHeight;
    wordEl.style.animation = "";
    wordEl.innerText = WORDS[idx];
    idx++;
    const delay = idx === WORDS.length ? 800 : 280;
    setTimeout(showWord, delay);
  };

  setTimeout(showWord, 100);

  function startPhase2() {
    logoOverlay.classList.add("active");
    overlay.classList.add("hide");

    const img = document.getElementById("logo-zoom-img");

    const doAnimate = () => {
      setTimeout(() => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            logoOverlay.classList.add("phase-in");
          })
        );
        setTimeout(startPhase3, 1800);
      }, 80);
    };

    if (img) {
      const cvs = document.createElement("canvas");
      const ctx = cvs.getContext("2d");
      const process = () => {
        cvs.width = img.naturalWidth || 500;
        cvs.height = img.naturalHeight || 500;
        ctx.drawImage(img, 0, 0);
        try {
          const d = ctx.getImageData(0, 0, cvs.width, cvs.height);
          for (let i = 0; i < d.data.length; i += 4) {
            const r = d.data[i],
              g = d.data[i + 1],
              b = d.data[i + 2];
            if (r > 155 && g > 155 && b > 155) d.data[i + 3] = 0;
          }
          ctx.putImageData(d, 0, 0);
          img.src = cvs.toDataURL("image/png");
        } catch (e) {
          /* CORS fallback */
        }
        doAnimate();
      };
      if (img.complete && img.naturalWidth > 0) {
        process();
      } else {
        img.onload = process;
      }
    } else {
      doAnimate();
    }
  }

  function startPhase3() {
    logoOverlay.classList.add("phase-burst");
    setTimeout(() => {
      logoOverlay.style.opacity = "0";
      logoOverlay.style.transition = "opacity 0.3s";
      document.body.style.overflow = "";
      setTimeout(() => {
        logoOverlay.style.display = "none";
        revealHero();
      }, 350);
    }, 900);
  }
})();

// ── Hero reveal after loader ───────────────────────────────
function revealHero() {
  const title = document.querySelector(".hero-title");
  const desc = document.getElementById("heroDesc");
  const actions = document.querySelector(".hero-actions");
  const stats = document.querySelector(".hero-stats");

  if (title) setTimeout(() => title.classList.add("visible"), 100);
  if (desc) setTimeout(() => desc.classList.add("visible"), 300);
  if (actions) setTimeout(() => actions.classList.add("visible"), 500);
  if (stats) setTimeout(() => stats.classList.add("visible"), 700);

  const nameEl = document.getElementById("heroName");
  if (nameEl) {
    setTimeout(() => scrambleText(nameEl, "Spandan Manna", 28, 0.3), 300);
  }

  setTimeout(startRoleTypewriter, 800);

  const descEl = document.getElementById("heroDesc");
  if (descEl) {
    setTimeout(
      () =>
        scrambleText(
          descEl,
          "Securing the digital frontier. B.Tech CSE student specializing in penetration testing, VAPT, and cybersecurity — keeping systems ahead of modern threats.",
          18,
          0.8
        ),
      600
    );
  }

  setTimeout(animateCounters, 900);
}

// ── Typewriter role titles ─────────────────────────────────
function startRoleTypewriter() {
  const el = document.getElementById("heroRole");
  if (!el) return;
  let rIdx = 0,
    cIdx = 0,
    deleting = false;

  const type = () => {
    const current = ROLE_TITLES[rIdx];
    if (!deleting) {
      el.innerText = current.slice(0, ++cIdx);
      if (cIdx === current.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      el.innerText = current.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        rIdx = (rIdx + 1) % ROLE_TITLES.length;
      }
    }
    setTimeout(type, deleting ? 55 : 90);
  };
  type();
}

// ── Nav scramble + sticky ──────────────────────────────────
(function initNav() {
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  });

  const btn = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");
  if (btn && mobileNav) {
    btn.addEventListener("click", () => {
      btn.classList.toggle("open");
      mobileNav.classList.toggle("open");
    });
    mobileNav.querySelectorAll(".mobile-link").forEach((link) => {
      link.addEventListener("click", () => {
        btn.classList.remove("open");
        mobileNav.classList.remove("open");
      });
    });
  }

  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  window.addEventListener("scroll", () => {
    let cur = "";
    sections.forEach((s) => {
      if (window.scrollY >= s.offsetTop - 160) cur = s.getAttribute("id");
    });
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + cur);
    });
  });
})();

// ── Scramble hover on all .scramble-btn & .scramble-nav ───
(function initScrambleHovers() {
  const attach = (el) => {
    el.addEventListener("mouseenter", function () {
      if (this.dataset.scrambling === "true") return;
      this.dataset.scrambling = "true";
      const original = this.getAttribute("data-text") || this.innerText;
      let i = 0;
      clearInterval(this._t);
      this._t = setInterval(() => {
        this.innerText = original
          .split("")
          .map((ch, idx) => {
            if (idx < Math.floor(i)) return ch;
            if (ch === " ") return " ";
            return SCRAMBLE_CHARS[
              Math.floor(Math.random() * SCRAMBLE_CHARS.length)
            ];
          })
          .join("");
        i += 0.55;
        if (i >= original.length) {
          clearInterval(this._t);
          this.innerText = original;
          this.dataset.scrambling = "false";
        }
      }, 22);
    });
  };
  document
    .querySelectorAll(
      ".scramble-btn, .scramble-nav, .card-link, .service-link"
    )
    .forEach(attach);
})();

// ══════════════════════════════════════════════════════════════
// GSAP ScrollTrigger Animations
// Includes: section reveals, card staggers, zoom transition
// ══════════════════════════════════════════════════════════════
(function initGSAPAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;

  gsap.registerPlugin(ScrollTrigger);

  // --- Section heading reveals ---
  gsap.utils.toArray(".gsap-reveal").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 60, filter: "blur(4px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          end: "top 50%",
          toggleActions: "play none none none",
        },
      }
    );
  });

  // --- Portfolio cards stagger ---
  gsap.utils.toArray(".portfolio-grid").forEach((grid) => {
    const cards = grid.querySelectorAll(".gsap-reveal-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 50, rotateX: 8, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: grid,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  });

  // --- Service cards stagger ---
  gsap.utils.toArray(".services-grid").forEach((grid) => {
    const cards = grid.querySelectorAll(".gsap-reveal-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 40, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: grid,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  });

  // --- Threat cards stagger ---
  gsap.utils.toArray(".threat-cards").forEach((container) => {
    const cards = container.querySelectorAll(".gsap-reveal-card");
    gsap.fromTo(
      cards,
      { opacity: 0, x: 60 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  });

  // --- Contact left/right slide ---
  gsap.utils.toArray(".gsap-reveal-left").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, x: -60 },
      {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  });

  gsap.utils.toArray(".gsap-reveal-right").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, x: 60 },
      {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  });

  // --- Skill bars animate on scroll ---
  gsap.utils.toArray(".skill-fill").forEach((bar) => {
    gsap.to(bar, {
      width: bar.dataset.w + "%",
      duration: 1.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: bar,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });
  });

  // ══════════════════════════════════════════════════════════
  // RED SHIELD TEAM — Zoom Transition
  // Pin the brand group, zoom into the logo, flood red, reveal next section
  // ══════════════════════════════════════════════════════════
  const zoomSection = document.querySelector(".zoom-section");
  const brandGroup = document.getElementById("zoomBrandGroup");
  const brandText = document.getElementById("zoomBrandText");
  const zoomLogo = document.getElementById("zoomLogo");
  const redFlood = document.getElementById("zoomRedFlood");

  if (zoomSection && brandGroup && brandText && zoomLogo && redFlood) {
    // We need to calculate offset so scaling focuses on the logo
    // Since the logo is on the left side of the group, we shift transform-origin
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: zoomSection,
        start: "top top",
        end: "bottom top",
        scrub: 1.5,
        pin: ".zoom-wrapper",
        pinSpacing: false,
        anticipatePin: 1,
      },
    });

    // Phase 1: 0% → 30% — gentle scale up, everything visible
    tl.fromTo(
      brandGroup,
      { scale: 1 },
      { scale: 2.5, duration: 0.3, ease: "none" }
    );

    // Phase 2: 30% → 55% — scale continues, text fades out
    tl.to(brandText, { opacity: 0, duration: 0.15, ease: "power1.in" }, 0.2);

    // Shift transform-origin to the logo center once text is gone
    tl.to(
      brandGroup,
      {
        scale: 25,
        duration: 0.4,
        ease: "power1.in",
        onUpdate: function () {
          // Dynamically shift origin toward the logo as we scale
          const progress = this.progress();
          if (progress > 0.1) {
            const logoRect = zoomLogo.getBoundingClientRect();
            const groupRect = brandGroup.getBoundingClientRect();
            if (groupRect.width > 0) {
              const originX =
                ((logoRect.left + logoRect.width / 2 - groupRect.left) /
                  groupRect.width) *
                100;
              const originY = 50;
              brandGroup.style.transformOrigin = `${originX}% ${originY}%`;
            }
          }
        },
      },
      0.3
    );

    // Phase 3: 70% → 100% — red flood covers everything
    tl.fromTo(
      redFlood,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power2.in" },
      0.65
    );

    // Fade out the red flood at the very end so next section slides in
    tl.to(redFlood, { opacity: 0, duration: 0.1, ease: "none" }, 0.9);
  }
})();

// ── Counter animation ──────────────────────────────────────
function animateCounters() {
  document.querySelectorAll(".stat-num").forEach((el) => {
    const target = parseInt(el.dataset.count);
    let start = 0;
    const step = () => {
      start++;
      el.innerText = start;
      if (start < target) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// ── Globe.gl 3D Threat Dashboard ───────────────────────────
(function initGlobe() {
  const container = document.getElementById("globeViz");
  if (!container || typeof Globe === "undefined") return;

  const globeSection = document.getElementById("threat-intel");
  let globeInstance = null;
  let globeInitialized = false;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !globeInitialized) {
        globeInitialized = true;
        buildGlobe();
        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(globeSection);

  function buildGlobe() {
    const width = container.offsetWidth;
    const height = container.offsetHeight || 500;

    globeInstance = Globe()(container)
      .globeImageUrl(
        "https://unpkg.com/three-globe@2.31.1/example/img/earth-dark.jpg"
      )
      .bumpImageUrl(
        "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png"
      )
      .backgroundImageUrl("")
      .backgroundColor("rgba(0,0,0,0)")
      .width(width)
      .height(height)
      .atmosphereColor("#ff1a1a")
      .atmosphereAltitude(0.2)
      .showGraticules(true)
      .pointsData([])
      .arcsData([])
      .ringsData([]);

    globeInstance.controls().autoRotate = true;
    globeInstance.controls().autoRotateSpeed = 0.5;
    globeInstance.controls().enableZoom = false;
    globeInstance.controls().enablePan = false;

    function generateAttacks() {
      const cities = [
        { lat: 40.71, lng: -74.01, name: "New York" },
        { lat: 51.51, lng: -0.13, name: "London" },
        { lat: 35.68, lng: 139.69, name: "Tokyo" },
        { lat: 22.54, lng: 88.34, name: "Kolkata" },
        { lat: 28.61, lng: 77.21, name: "New Delhi" },
        { lat: 55.76, lng: 37.62, name: "Moscow" },
        { lat: 39.9, lng: 116.4, name: "Beijing" },
        { lat: -23.55, lng: -46.63, name: "São Paulo" },
        { lat: 48.86, lng: 2.35, name: "Paris" },
        { lat: 1.29, lng: 103.85, name: "Singapore" },
        { lat: 37.57, lng: 126.98, name: "Seoul" },
        { lat: -33.87, lng: 151.21, name: "Sydney" },
        { lat: 52.52, lng: 13.41, name: "Berlin" },
        { lat: 19.08, lng: 72.88, name: "Mumbai" },
        { lat: 34.05, lng: -118.24, name: "Los Angeles" },
        { lat: 25.2, lng: 55.27, name: "Dubai" },
      ];

      const arcs = [];
      const rings = [];

      for (let i = 0; i < 12; i++) {
        const from = cities[Math.floor(Math.random() * cities.length)];
        const to = cities[Math.floor(Math.random() * cities.length)];
        if (from.name === to.name) continue;

        arcs.push({
          startLat: from.lat,
          startLng: from.lng,
          endLat: to.lat,
          endLng: to.lng,
          color: [
            Math.random() < 0.5
              ? "rgba(255,26,26,0.6)"
              : "rgba(155,89,208,0.4)",
            Math.random() < 0.5
              ? "rgba(255,26,26,0.3)"
              : "rgba(155,89,208,0.2)",
          ],
        });

        rings.push({
          lat: to.lat,
          lng: to.lng,
          maxR: 3,
          propagationSpeed: 2,
          repeatPeriod: 1200,
          color: "rgba(255,26,26,0.5)",
        });
      }

      globeInstance
        .arcsData(arcs)
        .arcColor("color")
        .arcDashLength(0.5)
        .arcDashGap(0.2)
        .arcDashAnimateTime(2500)
        .arcStroke(0.5)
        .ringsData(rings)
        .ringColor("color")
        .ringMaxRadius("maxR")
        .ringPropagationSpeed("propagationSpeed")
        .ringRepeatPeriod("repeatPeriod");
    }

    generateAttacks();
    setInterval(generateAttacks, 6000);

    const satellites = [];
    for (let i = 0; i < 3; i++) {
      satellites.push({
        lat: Math.random() * 180 - 90,
        lng: Math.random() * 360 - 180,
        alt: 0.4 + Math.random() * 0.3,
        radius: 0.4,
        color: i === 0 ? "#ff1a1a" : "#9B59D0",
      });
    }
    globeInstance
      .pointsData(satellites)
      .pointAltitude("alt")
      .pointRadius("radius")
      .pointColor("color");

    window.addEventListener("resize", () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight || 500;
      globeInstance.width(w).height(h);
    });
  }
})();

// ── Live Threat Counter ────────────────────────────────────
(function initThreatCounters() {
  const compromised = document.getElementById("compromisedCount");
  const active = document.getElementById("activeThreats");
  const blocked = document.getElementById("attacksBlocked");

  if (!compromised || !active || !blocked) return;

  let cTarget = 127834,
    aTarget = 3421,
    bTarget = 98127;

  function formatNum(n) {
    return n.toLocaleString();
  }

  const section = document.getElementById("threat-intel");
  if (!section) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        countUp();
        observer.disconnect();
        setTimeout(startLiveIncrement, 3000);
      }
    },
    { threshold: 0.3 }
  );
  observer.observe(section);

  function countUp() {
    const duration = 2000;
    const start = Date.now();

    function step() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      compromised.innerText = formatNum(Math.floor(cTarget * eased));
      active.innerText = formatNum(Math.floor(aTarget * eased));
      blocked.innerText = formatNum(Math.floor(bTarget * eased));

      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function startLiveIncrement() {
    setInterval(() => {
      cTarget += Math.floor(Math.random() * 15) + 1;
      aTarget += Math.floor(Math.random() * 5) - 2;
      if (aTarget < 0) aTarget = Math.floor(Math.random() * 100);
      bTarget += Math.floor(Math.random() * 12) + 1;

      compromised.innerText = formatNum(cTarget);
      active.innerText = formatNum(aTarget);
      blocked.innerText = formatNum(bTarget);
    }, 2000);
  }
})();

// ── Live Cyber News Feed ───────────────────────────────────
(function initNewsFeed() {
  const tickerTrack = document.querySelector(".ticker-track");
  const newsGrid = document.getElementById("newsGrid");
  if (!tickerTrack || !newsGrid) return;

  const fallbackNews = [
    {
      title: "Critical RCE Vulnerability Discovered in Apache Struts 2",
      source: "The Hacker News",
      time: "2 hours ago",
      excerpt:
        "A critical remote code execution vulnerability has been identified in Apache Struts 2, affecting thousands of enterprise applications worldwide.",
      url: "#",
      critical: true,
    },
    {
      title: "Major Data Breach Exposes 50M Records from Healthcare Provider",
      source: "KrebsOnSecurity",
      time: "4 hours ago",
      excerpt:
        "A massive data breach at a leading healthcare provider has compromised personal and medical records of over 50 million patients.",
      url: "#",
      critical: true,
    },
    {
      title: "Google Chrome Zero-Day Actively Exploited in the Wild",
      source: "BleepingComputer",
      time: "6 hours ago",
      excerpt:
        "Google has released an emergency patch for Chrome after discovering a zero-day vulnerability being actively exploited by threat actors.",
      url: "#",
      critical: true,
    },
    {
      title: "New Ransomware Variant Targets Industrial Control Systems",
      source: "DarkReading",
      time: "8 hours ago",
      excerpt:
        "Security researchers have identified a sophisticated new ransomware variant specifically designed to target ICS/SCADA systems.",
      url: "#",
      critical: false,
    },
    {
      title: "Microsoft Patch Tuesday Addresses 73 Security Vulnerabilities",
      source: "SecurityWeek",
      time: "12 hours ago",
      excerpt:
        "Microsoft's latest Patch Tuesday release fixes 73 security vulnerabilities including three critical zero-day flaws.",
      url: "#",
      critical: false,
    },
    {
      title: "State-Sponsored APT Group Targets Financial Institutions",
      source: "Mandiant",
      time: "1 day ago",
      excerpt:
        "A state-sponsored APT group has been observed conducting sophisticated phishing campaigns targeting global financial institutions.",
      url: "#",
      critical: false,
    },
  ];

  async function fetchNews() {
    try {
      const response = await fetch(
        "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TheHackersNews&count=6"
      );
      if (!response.ok) throw new Error("Feed unavailable");
      const data = await response.json();
      if (data.status === "ok" && data.items && data.items.length > 0) {
        return data.items.map((item, i) => ({
          title: item.title,
          source: data.feed.title || "The Hacker News",
          time: new Date(item.pubDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          excerpt: item.description
            ? item.description.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
            : "",
          url: item.link || "#",
          critical: i < 2,
        }));
      }
      throw new Error("No items");
    } catch {
      return fallbackNews;
    }
  }

  async function populateNews() {
    const articles = await fetchNews();

    const tickerHTML = articles
      .map(
        (a) => `
        <div class="ticker-item ${a.critical ? "critical" : ""}">
            <span class="ticker-dot"></span>
            <span>${a.title}</span>
        </div>
    `
      )
      .join("");
    tickerTrack.innerHTML = tickerHTML + tickerHTML;

    newsGrid.innerHTML = articles
      .slice(0, 6)
      .map(
        (a) => `
        <div class="news-card gsap-reveal-card" style="opacity:1;">
            <div class="news-card-img">
                <i class="fas fa-shield-virus"></i>
            </div>
            <div class="news-card-body">
                <div class="news-card-source">
                    <i class="fas fa-circle"></i>
                    ${a.source}
                </div>
                <h3 class="news-card-title">${a.title}</h3>
                <p class="news-card-excerpt">${a.excerpt}</p>
                <div class="news-card-meta">
                    <span class="news-card-time">${a.time}</span>
                    <a href="${a.url}" target="_blank" class="news-card-link" rel="noopener">READ MORE →</a>
                </div>
            </div>
        </div>
    `
      )
      .join("");

    if (typeof gsap !== "undefined") {
      gsap.fromTo(
        ".news-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".news-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }

  populateNews();
  setInterval(populateNews, 300000);
})();

// ── Contact form ───────────────────────────────────────────
(function initContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !subject || !message) {
      status.className = "form-status error";
      status.innerText = "⚠ Please fill in all required fields.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.className = "form-status error";
      status.innerText = "⚠ Please enter a valid email address.";
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerText = "SENDING...";
    submitBtn.disabled = true;

    setTimeout(() => {
      status.className = "form-status success";
      status.innerText = "✓ Message sent! I will get back to you shortly.";
      form.reset();
      submitBtn.innerText = "SEND MESSAGE";
      submitBtn.disabled = false;
      setTimeout(() => {
        status.innerText = "";
      }, 5000);
    }, 1400);
  });
})();

// ── CV download button ─────────────────────────────────────
(function initCVButtons() {
  ["cvBtn", "cvBtnAbout"].forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.open("https://drive.google.com/file/d/1WVerwmb80mdB_o5be0l40PmgWVh_tcMC/view?usp=drive_link", "_blank");
    });
  });
})();

// ── Smooth scroll for all anchor links ────────────────────
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const hash = link.getAttribute("href");
    if (hash === "#") return;
    const target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
