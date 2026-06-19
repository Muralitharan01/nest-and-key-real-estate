// ─── Landing Page Logic ────────────────────────────────────────────────────
import { listenToProperties } from "./properties.js";
import { addEnquiry } from "./enquiries.js";

let allProperties  = [];
let activeCategory = "All";

const grid       = document.getElementById("properties-grid");
const filterBtns = document.querySelectorAll(".filter-btn");
const countEl    = document.getElementById("property-count");
const loaderEl   = document.getElementById("grid-loader");

// ── Build a single property card ──────────────────────────────────────────
function buildCard(p, index) {
  // Support both imageUrls[] (multi) and legacy imageUrl (single)
  const images = (p.imageUrls && p.imageUrls.length)
    ? p.imageUrls
    : (p.imageUrl ? [p.imageUrl] : []);

  const price = Number(p.price).toLocaleString("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  });

  // Build slide elements
  const slides = images.length
    ? images.map((url, i) => `
        <div class="slide ${i === 0 ? "active" : ""}" data-index="${i}">
          <img src="${url}" alt="${p.name} — photo ${i + 1}" loading="lazy" />
        </div>`).join("")
    : `<div class="slide active"><div class="slide-placeholder">🏠</div></div>`;

  // Dot navigation (only shown when >1 image)
  const dots = images.length > 1
    ? `<div class="slider-dots">
        ${images.map((_, i) => `<span class="dot ${i === 0 ? "active" : ""}" data-dot="${i}"></span>`).join("")}
       </div>`
    : "";

  // Prev/Next arrows (only when >1 image)
  const arrows = images.length > 1
    ? `<button class="slide-arrow prev" aria-label="Previous image">&#8249;</button>
       <button class="slide-arrow next" aria-label="Next image">&#8250;</button>`
    : "";

  const card = document.createElement("article");
  card.className = "property-card";
  card.style.animationDelay = `${index * 60}ms`;
  card.dataset.id = p.id;

  card.innerHTML = `
    <div class="card-slider">
      <div class="slides-track">${slides}</div>
      ${arrows}
      ${dots}
      <span class="category-badge">${p.category}</span>
      ${images.length > 1 ? `<span class="img-count-badge">${images.length} photos</span>` : ""}
    </div>
    <div class="card-body">
      <h3 class="card-title">${p.name}</h3>
      <p class="card-location">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        ${p.location}
      </p>
      <p class="card-desc">${p.description}</p>
      <div class="card-footer">
        <span class="card-price">${price}</span>
        <button class="btn-enquire" onclick="openEnquiry('${p.name.replace(/'/g,"\\'")}')">Enquire</button>
      </div>
    </div>`;

  // Wire up slider controls (only if multiple images)
  if (images.length > 1) {
    initSlider(card, images.length);
  }

  return card;
}

// ── Slider Logic ──────────────────────────────────────────────────────────
function initSlider(card, total) {
  let current   = 0;
  let autoTimer = null;

  const track  = card.querySelector(".slides-track");
  const dots   = card.querySelectorAll(".dot");
  const prevBtn= card.querySelector(".slide-arrow.prev");
  const nextBtn= card.querySelector(".slide-arrow.next");

  function goTo(n) {
    // Wrap around
    current = (n + total) % total;

    track.querySelectorAll(".slide").forEach((s, i) => {
      s.classList.toggle("active", i === current);
    });
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), 3500);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  prevBtn.addEventListener("click", (e) => { e.stopPropagation(); stopAuto(); goTo(current - 1); startAuto(); });
  nextBtn.addEventListener("click", (e) => { e.stopPropagation(); goTo(current + 1); startAuto(); });

  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      stopAuto();
      goTo(parseInt(dot.dataset.dot));
      startAuto();
    });
  });

  // Pause on hover, resume on leave
  card.querySelector(".card-slider").addEventListener("mouseenter", stopAuto);
  card.querySelector(".card-slider").addEventListener("mouseleave", startAuto);

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend",   (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { stopAuto(); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  });

  startAuto();
}

// ── Render all cards ──────────────────────────────────────────────────────
function renderCards(list) {
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = `
      <div class="no-results">
        <span class="no-icon">🏚️</span>
        <p>No properties found in this category.</p>
      </div>`;
    return;
  }

  list.forEach((p, i) => grid.appendChild(buildCard(p, i)));
}

// ── Category Filter ───────────────────────────────────────────────────────
function applyFilter() {
  const list = activeCategory === "All"
    ? allProperties
    : allProperties.filter((p) => p.category === activeCategory);
  renderCards(list);
  if (countEl) countEl.textContent = list.length;
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    applyFilter();
  });
});

// ── Real-time Listener ────────────────────────────────────────────────────
listenToProperties((list) => {
  loaderEl?.classList.add("hidden");
  allProperties = list;
  applyFilter();
  animateCounter("stat-properties", list.length);
});

// ── Enquiry Modal ─────────────────────────────────────────────────────────
window.openEnquiry = function (name) {
  document.getElementById("enquiry-property").value = name;
  document.getElementById("enquiry-modal").classList.add("open");
};
window.closeEnquiry = function () {
  document.getElementById("enquiry-modal").classList.remove("open");
};
document.getElementById("enquiry-modal")?.addEventListener("click", (e) => {
  if (e.target.id === "enquiry-modal") closeEnquiry();
});

window.submitEnquiry = async function () {
  const name = document.getElementById("enq-name").value.trim();
  const phone = document.getElementById("enq-phone").value.trim();
  const propName = document.getElementById("enquiry-property").value;

  if (!name) { alert("Please enter your name."); return; }

  const submitBtn = document.querySelector("#enquiry-modal .btn-submit");
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";

  try {
    await addEnquiry({
      type: "property",
      name,
      phone,
      propertyName: propName,
    });
    closeEnquiry();
    
    // Reset enquiry inputs
    document.getElementById("enq-name").value = "";
    document.getElementById("enq-phone").value = "";

    // Show visual toast
    const t = document.createElement("div");
    t.style.cssText = "position:fixed;bottom:1.5rem;right:1.5rem;background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);color:#86efac;padding:.8rem 1.2rem;border-radius:10px;font-size:.85rem;z-index:999;";
    t.textContent = "✓ Enquiry submitted! We'll call you shortly.";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  } catch (err) {
    console.error("Error submitting enquiry:", err);
    alert("Something went wrong. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
};

window.handleContact = async function (e) {
  e.preventDefault();
  const name  = document.getElementById("c-name").value.trim();
  const email = document.getElementById("c-email").value.trim();
  const phone = document.getElementById("c-phone").value.trim();
  const msg   = document.getElementById("c-msg").value.trim();
  const btn   = document.getElementById("submit-btn");

  btn.textContent = "Sending…";
  btn.disabled = true;

  try {
    await addEnquiry({
      type: "general",
      name,
      email,
      phone,
      message: msg,
    });
    btn.textContent = "✓ Sent! We'll be in touch.";
    setTimeout(() => {
      btn.textContent = "Send Message →";
      btn.disabled = false;
      document.getElementById("contact-form")?.reset();
    }, 4000);
  } catch (err) {
    console.error("Error sending contact message:", err);
    btn.textContent = "Error! Try again.";
    btn.disabled = false;
  }
};

// ── Sticky Nav ────────────────────────────────────────────────────────────
const nav = document.querySelector(".navbar");
window.addEventListener("scroll", () => nav?.classList.toggle("scrolled", window.scrollY > 60));

// ── Counter Animation ─────────────────────────────────────────────────────
function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let n = 0;
  const step  = Math.ceil(target / 40);
  const timer = setInterval(() => {
    n = Math.min(n + step, target);
    el.textContent = n;
    if (n >= target) clearInterval(timer);
  }, 30);
}

// ── Mobile Nav ────────────────────────────────────────────────────────────
document.getElementById("nav-toggle")?.addEventListener("click", () => {
  document.getElementById("nav-menu").classList.toggle("open");
});
