/* =====================================================
   HASWADA — Cinematic Interactions
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Section Reveal (Intersection Observer) ----------
  const sections = document.querySelectorAll('.section');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  sections.forEach(sec => revealObserver.observe(sec));

  // ---------- GROW words sequential reveal ----------
  const growWords = document.querySelectorAll('.grow-word');
  const growSection = document.querySelector('.grow');
  
  const growObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        growWords.forEach((word, i) => {
          setTimeout(() => word.classList.add('visible'), 200 + i * 320);
        });
        growObserver.disconnect();
      }
    });
  }, { threshold: 0.35 });

  if (growSection) growObserver.observe(growSection);

  // ---------- ESKUL detail on tap ----------
  const eskulCards = document.querySelectorAll('.eskul-card');
  const eskulDetailText = document.getElementById('eskulDetailText');

  eskulCards.forEach(card => {
    card.addEventListener('click', () => {
      const desc = card.dataset.desc || '';
      const name = card.querySelector('h3')?.textContent || '';
      eskulDetailText.style.opacity = '0';
      setTimeout(() => {
        eskulDetailText.textContent = desc ? `${name} — ${desc}` : name;
        eskulDetailText.style.opacity = '1';
      }, 180);
    });
  });

  // ---------- FACILITY SLIDER ----------
  const slides = document.querySelectorAll('.facility-slide');
  const dotsContainer = document.getElementById('facDots');
  let currentSlide = 0;
  let autoPlay;

  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('span');

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    resetAutoPlay();
  }

  function resetAutoPlay() {
    clearInterval(autoPlay);
    autoPlay = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }

  document.querySelector('.fac-prev')?.addEventListener('click', () => goToSlide(currentSlide - 1));
  document.querySelector('.fac-next')?.addEventListener('click', () => goToSlide(currentSlide + 1));
  resetAutoPlay();

  // ---------- OPPORTUNITY STEPS ----------
  let selectedJenjang = '';
  let selectedProgram = '';

  const steps = {
    1: document.getElementById('step1'),
    2: document.getElementById('step2'),
    3: document.getElementById('step3'),
    form: document.getElementById('stepForm')
  };

  function showStep(key) {
    Object.values(steps).forEach(s => s?.classList.remove('active'));
    steps[key]?.classList.add('active');
  }

  document.querySelectorAll('#step1 .choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedJenjang = btn.dataset.jenjang;
      document.querySelectorAll('#step1 .choice-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(() => showStep(2), 280);
    });
  });

  document.querySelectorAll('#step2 .choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedProgram = btn.dataset.program;
      document.querySelectorAll('#step2 .choice-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const title = document.getElementById('programTitle');
      const priceLabel = document.getElementById('priceLabel');
      const priceValue = document.getElementById('priceValue');

      if (selectedProgram === 'Prestasi') {
        title.textContent = 'Program Prestasi';
        priceLabel.textContent = `${selectedJenjang} Prestasi — Peringkat 1`;
        priceValue.textContent = 'Rp 1.205.000';
      } else {
        title.textContent = 'Program Gelombang';
        priceLabel.textContent = `${selectedJenjang} Gelombang 1`;
        priceValue.textContent = 'Rp 2.450.000';
      }

      setTimeout(() => showStep(3), 280);
    });
  });

  document.getElementById('btnTertarik')?.addEventListener('click', () => {
    showStep('form');
  });

  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.back;
      if (target === '1') showStep(1);
      else if (target === '2') showStep(2);
      else if (target === '3') showStep(3);
    });
  });

  // Form → WhatsApp
  document.getElementById('interestForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const nama = form.nama.value.trim();
    const wa = form.whatsapp.value.trim();
    const asal = form.asal.value.trim();

    const message = `Halo Haswada,%0A%0ASaya tertarik dengan program *${selectedProgram}* jenjang *${selectedJenjang}*.%0A%0ANama: ${nama}%0AWhatsApp: ${wa}%0AAsal Sekolah: ${asal}%0A%0AMohon informasinya. Terima kasih.`;

    // GANTI NOMOR WHATSAPP SEKOLAH DI SINI
    const phone = '6281234567890';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  });

});
