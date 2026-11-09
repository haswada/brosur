/* =====================================================
   HASWADA — Cinematic Interactions + Registration Flow
   TP 2027/2028
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // ---------- Responsive navigation + GA4 section analytics ----------
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const mobileMoreToggle = document.querySelector('.mobile-more-toggle');
  const mobileMorePanel = document.getElementById('mobileMorePanel');
  const mobileMoreBackdrop = document.querySelector('.mobile-more-backdrop');
  const mobileMoreClose = document.querySelector('.more-close');
  const sectionMeta = {
    opening: { name: 'Beranda', order: 1 },
    grow: { name: 'Profil & Keunggulan', order: 2 },
    live: { name: 'Kehidupan Siswa', order: 3 },
    eskul: { name: 'Ekstrakurikuler', order: 4 },
    facilities: { name: 'Fasilitas', order: 5 },
    achieve: { name: 'Prestasi', order: 6 },
    alumni: { name: 'Alumni', order: 7 },
    opportunity: { name: 'Beasiswa & Daftar', order: 8 }
  };
  const trackedSections = new Set();
  function trackEvent(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
  }
  function setActiveNavigation(id) {
    navLinks.forEach(link => {
      const active = link.dataset.nav === id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function closeMoreMenu() {
    if (mobileMorePanel) mobileMorePanel.hidden = true;
    if (mobileMoreBackdrop) mobileMoreBackdrop.hidden = true;
    mobileMoreToggle?.setAttribute('aria-expanded', 'false');
  }
  function openMoreMenu() {
    if (mobileMorePanel) mobileMorePanel.hidden = false;
    if (mobileMoreBackdrop) mobileMoreBackdrop.hidden = false;
    mobileMoreToggle?.setAttribute('aria-expanded', 'true');
  }
  mobileMoreToggle?.addEventListener('click', () => {
    const isOpen = mobileMoreToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) { closeMoreMenu(); }
    else {
      openMoreMenu();
      trackEvent('navigation_menu_open', { navigation_label: 'Lainnya', menu_location: 'mobile_bottom' });
    }
  });
  mobileMoreClose?.addEventListener('click', closeMoreMenu);
  mobileMoreBackdrop?.addEventListener('click', closeMoreMenu);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMoreMenu(); });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const id = link.dataset.nav;
      const meta = sectionMeta[id];
      closeMoreMenu();
      if (meta) trackEvent('navigation_click', {
        section_id: id,
        section_name: meta.name,
        section_order: meta.order,
        navigation_label: meta.name
      });
      setActiveNavigation(id);
    });
  });

  const observedSections = Object.keys(sectionMeta)
    .map(id => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        const meta = sectionMeta[id];
        if (!meta) return;
        setActiveNavigation(id);
        if (!trackedSections.has(id)) {
          trackedSections.add(id);
          trackEvent('section_view', {
            section_id: id,
            section_name: meta.name,
            section_order: meta.order
          });
        }
      });
    }, { threshold: 0.15, rootMargin: '-10% 0px -18% 0px' });
    observedSections.forEach(section => sectionObserver.observe(section));
  } else {
    observedSections.forEach(section => {
      const meta = sectionMeta[section.id];
      if (meta) trackEvent('section_view', { section_id: section.id, section_name: meta.name, section_order: meta.order });
    });
  }

  // ---------- Section reveal ----------
  const sections = document.querySelectorAll('.section');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    sections.forEach(section => revealObserver.observe(section));
  } else {
    sections.forEach(section => section.classList.add('revealed'));
  }

  // ---------- GROW words ----------
  const growWords = document.querySelectorAll('.grow-word');
  const growSection = document.querySelector('.grow');
  if (growSection && growWords.length && 'IntersectionObserver' in window) {
    const growObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          growWords.forEach((word, index) => {
            window.setTimeout(() => word.classList.add('visible'), 180 + index * 280);
          });
          growObserver.disconnect();
        }
      });
    }, { threshold: 0.25 });
    growObserver.observe(growSection);
  }

  // ---------- Detail cards: grow / extracurricular ----------
  document.querySelectorAll('.eskul-card').forEach(card => {
    card.addEventListener('click', () => {
      const track = card.closest('.eskul-track2') ? 'eskulDetailText2' : 'eskulDetailText';
      const target = document.getElementById(track);
      if (!target) return;
      const title = card.querySelector('h3')?.textContent?.trim() || '';
      const desc = card.dataset.desc || '';
      target.style.opacity = '0';
      window.setTimeout(() => {
        target.textContent = title && desc ? `${title}: ${desc}` : (desc || title);
        target.style.opacity = '1';
      }, 160);
    });
  });

  // ---------- Facility slider ----------
  const facilitySlides = [...document.querySelectorAll('.facility-slide')];
  const dotsContainer = document.getElementById('facDots');
  const prevFacility = document.querySelector('.fac-prev');
  const nextFacility = document.querySelector('.fac-next');
  let facilityIndex = 0;
  let facilityTimer = null;
  if (facilitySlides.length && dotsContainer) {
    dotsContainer.innerHTML = '';
    facilitySlides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Tampilkan fasilitas ${index + 1}`);
      dot.addEventListener('click', () => showFacility(index));
      dotsContainer.appendChild(dot);
    });
    const dots = [...dotsContainer.querySelectorAll('button')];
    function showFacility(index, restart=true) {
      facilityIndex = (index + facilitySlides.length) % facilitySlides.length;
      facilitySlides.forEach((slide, i) => slide.classList.toggle('active', i === facilityIndex));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === facilityIndex));
      if (restart) startFacilityTimer();
    }
    function startFacilityTimer() {
      if (facilityTimer) window.clearInterval(facilityTimer);
      if (facilitySlides.length > 1) facilityTimer = window.setInterval(() => showFacility(facilityIndex + 1, false), 5000);
    }
    prevFacility?.addEventListener('click', () => showFacility(facilityIndex - 1));
    nextFacility?.addEventListener('click', () => showFacility(facilityIndex + 1));
    showFacility(0, false);
    startFacilityTimer();
  }

  // ---------- Achievement detail ----------
  const achieveDetail = document.getElementById('achieveDetailText');
  document.querySelectorAll('.achieve-card').forEach(card => {
    card.addEventListener('click', () => {
      if (!achieveDetail) return;
      achieveDetail.style.opacity = '0';
      window.setTimeout(() => {
        achieveDetail.textContent = card.dataset.desc || card.textContent.trim();
        achieveDetail.style.opacity = '1';
      }, 160);
    });
  });

  // ---------- Headmaster slider ----------
  const headmasterSlides = [...document.querySelectorAll('.headmaster-slide')];
  if (headmasterSlides.length > 1) {
    let headmasterIndex = Math.max(0, headmasterSlides.findIndex(slide => slide.classList.contains('active')));
    window.setInterval(() => {
      headmasterSlides[headmasterIndex].classList.remove('active');
      headmasterIndex = (headmasterIndex + 1) % headmasterSlides.length;
      headmasterSlides[headmasterIndex].classList.add('active');
    }, 4500);
  }

  // ---------- Teacher modal ----------
  const teacherModal = document.getElementById('teacherModal');
  const openTeacherModal = document.getElementById('btnViewAllTeachers');
  const closeTeacherModal = document.getElementById('btnCloseModal');
  function closeTeachers() {
    teacherModal?.classList.remove('open');
    if (teacherModal) teacherModal.style.display = '';
    document.body.style.overflow = '';
  }
  openTeacherModal?.addEventListener('click', () => {
    if (!teacherModal) return;
    teacherModal.classList.add('open');
    teacherModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });
  closeTeacherModal?.addEventListener('click', closeTeachers);
  teacherModal?.addEventListener('click', event => {
    if (event.target === teacherModal) closeTeachers();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeTeachers();
  });

  // ---------- GA4: CTA clicks ----------
  document.querySelectorAll('.cta-card.accent[href="#opportunity"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof window.gtag === 'function') window.gtag('event', 'klaim_beasiswa_click', {
        event_category: 'SPMB', event_label: 'Lihat Jalur Beasiswa'
      });
    });
  });

  // =====================================================
  // REGISTRATION DATA — nominal in rupiah
  // =====================================================
  const money = value => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  }).format(value).replace(/\u00a0/g, ' ');
  const feeData = {
    SMP: [
      ['Uang Kegiatan Pengembangan Diri', 200000], ['Dana Sehat', 75000],
      ['Kalender', 50000], ['Topi, Dasi dan Bed Sekolah Lengkap', 130000],
      ['Buku Paket Madin', 75000], ['Kain Seragam Hijau Kuning', 200000],
      ['Kain Seragam Pramuka', 200000], ['Seragam Olahraga', 100000],
      ['Infaq Bulanan', 80000], ['Tes Psikologi', 100000]
    ],
    SMA: [
      ['Uang Kegiatan Pengembangan Diri', 200000], ['Dana Sehat', 75000],
      ['Kalender', 50000], ['Topi, Dasi dan Bed Sekolah Lengkap', 130000],
      ['Buku Paket Madin', 75000], ['Kain Seragam Hijau Kuning', 200000],
      ['Kain Seragam Pramuka', 200000], ['Seragam Olahraga', 100000],
      ['Infaq Bulanan', 130000], ['Tes Psikologi', 100000]
    ]
  };
  const apparel = {
    SMP: { Putra: ['Kopyah', 50000], Putri: ['Kerudung (Hijau, Putih & Pramuka)', 120000] },
    SMA: { Putra: ['Kopyah', 50000], Putri: ['Kerudung (Hijau, Putih & Pramuka)', 120000] }
  };
  const benefitSets = {
    SMP: {
      akademik: {
        'Peringkat 1': [['Uang Kegiatan Pengembangan Diri',200000],['Dana Sehat',75000],['Kalender',50000],['Topi, Dasi dan Bed Sekolah Lengkap',130000],['Buku Paket Madin',75000],['Pembebasan infaq 3 bulan',240000],['Kain Seragam Hijau Kuning',200000],['Kain Seragam Pramuka',200000],['Seragam Olahraga',100000]],
        'Peringkat 2': [['Uang Kegiatan Pengembangan Diri',200000],['Dana Sehat',75000],['Kalender',50000],['Topi, Dasi dan Bed Sekolah Lengkap',130000],['Buku Paket Madin',75000],['Pembebasan infaq 2 bulan',160000],['Seragam Olahraga',100000]],
        'Peringkat 3': [['Uang Kegiatan Pengembangan Diri',200000],['Dana Sehat',75000],['Kalender',50000],['Topi, Dasi dan Bed Sekolah Lengkap',130000],['Buku Paket Madin',75000],['Pembebasan infaq 1 bulan',80000],['Seragam Olahraga',100000]]
      },
      nonakademik: {
        'Tingkat Provinsi': [['Uang Kegiatan Pengembangan Diri',200000],['Dana Sehat',75000],['Kalender',50000],['Topi, Dasi dan Bed Sekolah Lengkap',130000],['Buku Paket Madin',75000],['Pembebasan infaq 3 bulan',240000],['Kain Seragam Hijau Kuning',200000],['Kain Seragam Pramuka',200000],['Seragam Olahraga',100000]],
        'Tingkat Kabupaten': [['Uang Kegiatan Pengembangan Diri',200000],['Dana Sehat',75000],['Kalender',50000],['Topi, Dasi dan Bed Sekolah Lengkap',130000],['Buku Paket Madin',75000],['Pembebasan infaq 2 bulan',160000],['Seragam Olahraga',100000]],
        'Tingkat Kecamatan': [['Uang Kegiatan Pengembangan Diri',200000],['Dana Sehat',75000],['Kalender',50000],['Topi, Dasi dan Bed Sekolah Lengkap',130000],['Buku Paket Madin',75000],['Pembebasan infaq 1 bulan',80000],['Seragam Olahraga',100000]]
      },
      gelombang: {
        'Gelombang 1': [['Seragam Olahraga',100000],['Pembebasan infaq 2 bulan',160000]],
        'Gelombang 2': [['Seragam Olahraga',100000],['Pembebasan infaq 1 bulan',80000]],
        'Gelombang 3': [['Seragam Olahraga',100000]]
      }
    },
    SMA: {
      akademik: {
        'Peringkat 1': [['Uang Kegiatan Pengembangan Diri',200000],['Dana Sehat',75000],['Kalender',50000],['Topi, Dasi dan Bed Sekolah Lengkap',130000],['Buku Paket Madin',75000],['Kain Seragam Hijau Kuning',200000],['Kain Seragam Pramuka',200000],['Seragam Olahraga',100000],['Perlengkapan Putra/Putri',0],['Pembebasan infaq bulan Agustus',130000],['Tes Psikologi',100000]]
      },
      nonakademik: {
        'Tingkat Provinsi': [['Uang Kegiatan Pengembangan Diri',200000],['Dana Sehat',75000],['Kalender',50000],['Topi, Dasi dan Bed Sekolah Lengkap',130000],['Buku Paket Madin',75000],['Kain Seragam Hijau Kuning',200000],['Kain Seragam Pramuka',200000],['Seragam Olahraga',100000],['Perlengkapan Putra/Putri',0],['Pembebasan infaq bulan Agustus',130000],['Tes Psikologi',100000]],
        'Tingkat Kabupaten': [['Kain Seragam Hijau Kuning',200000],['Kain Seragam Pramuka',200000],['Seragam Olahraga',100000]],
        'Tingkat Kecamatan': [['Kain Seragam Hijau Kuning',200000],['Seragam Olahraga',100000]]
      },
      gelombang: {
        'Gelombang 1': [['Kain Seragam Hijau Kuning',200000],['Kain Seragam Pramuka',200000],['Seragam Olahraga',100000]],
        'Gelombang 2': [['Kain Seragam Hijau Kuning',200000],['Seragam Olahraga',100000]],
        'Gelombang 3': [['Kain Seragam Hijau Kuning',200000]]
      }
    }
  };
  const categoryLabels = {
    akademik: { title: 'Prestasi Akademik', helper: 'Pilih peringkat akademik yang sesuai.' },
    nonakademik: { title: 'Prestasi Nonakademik', helper: 'Pilih tingkat prestasi/lomba yang dapat dibuktikan dengan sertifikat atau dokumen resmi.' },
    gelombang: { title: 'Potongan Gelombang', helper: 'Pilih gelombang pendaftaran yang berlaku.' }
  };

  const state = { jenjang: '', program: '', kategori: '', gender: '' };
  const stepEls = {
    1: document.getElementById('step1'), 2: document.getElementById('step2'),
    3: document.getElementById('step3'), 4: document.getElementById('step4'),
    5: document.getElementById('step5'), form: document.getElementById('stepForm')
  };
  const progressEls = [...document.querySelectorAll('.progress-step')];
  const categoryChoices = document.getElementById('categoryChoices');

  function showStep(key) {
    Object.values(stepEls).forEach(el => el?.classList.remove('active'));
    stepEls[key]?.classList.add('active');
    const progress = key === 'form' ? 5 : Number(key);
    progressEls.forEach((el, index) => {
      el.classList.toggle('active', index + 1 === progress);
      el.classList.toggle('done', index + 1 < progress);
    });

    // Saat formulir dibuka, arahkan layar ke awal formulir.
    // Tanpa ini, posisi gulir tetap di tombol pada bagian bawah rincian biaya,
    // sehingga formulir yang berada di atasnya terlihat seolah-olah menghilang.
    if (key === 'form' && stepEls.form) {
      requestAnimationFrame(() => {
        const top = stepEls.form.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      });
    }
  }
  function selectButton(selector, attr, value) {
    document.querySelectorAll(selector).forEach(button => button.classList.toggle('selected', button.dataset[attr] === value));
  }
  // Jadwal gelombang pendaftaran TP 2027/2028 (mengikuti tanggal lokal perangkat).
  const waveSchedule = {
    'Gelombang 1': { start: '2026-11-02', end: '2027-01-31' },
    'Gelombang 2': { start: '2027-02-01', end: '2027-04-30' },
    'Gelombang 3': { start: '2027-05-01', end: '2027-06-30' }
  };
  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  function waveAvailability(wave) {
    const schedule = waveSchedule[wave];
    if (!schedule) return { active: false, note: 'Jadwal belum tersedia' };
    const today = localDateKey();
    if (today < schedule.start) return { active: false, note: 'Belum dibuka' };
    if (today > schedule.end) return { active: false, note: 'Telah ditutup' };
    return { active: true, note: 'Sedang dibuka · dapat dipilih' };
  }

  function categoryIcon(category) {
    const label = String(category).toLowerCase();
    if (label.includes('gelombang')) return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h3M8 17h7"/></svg>';
    if (label.includes('juara') || label.includes('lomba') || label.includes('prestasi')) return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="m8.5 12-1 9 4.5-2.5 4.5 2.5-1-9"/></svg>';
    if (label.includes('peringkat') || label.includes('akademik') || label.includes('nilai')) return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 7h8M8 11h8"/></svg>';
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 14.8 8.7 21 9.6l-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>';
  }

  function categoriesForCurrentSelection() {
    const available = Object.keys(benefitSets[state.jenjang][state.program] || {});
    const heading = document.getElementById('categoryHeading');
    const helper = document.getElementById('categoryHelper');
    heading.textContent = categoryLabels[state.program].title;
    helper.textContent = categoryLabels[state.program].helper;
    categoryChoices.innerHTML = '';
    available.forEach(category => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-btn';
      button.dataset.category = category;
      const icon = document.createElement('span');
      icon.className = 'choice-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = categoryIcon(category);
      const strong = document.createElement('strong');
      strong.textContent = category;
      const small = document.createElement('small');
      if (state.program === 'gelombang') {
        const availability = waveAvailability(category);
        button.disabled = !availability.active;
        button.classList.toggle('is-unavailable', !availability.active);
        small.textContent = availability.note;
      } else {
        small.textContent = 'Lihat rincian manfaat yang tersedia';
      }
      button.append(icon, strong, small);
      button.addEventListener('click', () => {
        if (button.disabled) return;
        state.kategori = category;
        selectButton('#categoryChoices .choice-btn', 'category', category);
        trackEvent('registration_category_select', {
          jenjang: state.jenjang,
          jalur: state.program,
          kategori: state.kategori,
          form_step: 'kategori'
        });
        showStep(4);
      });
      categoryChoices.appendChild(button);
    });
  }
  function renderRows(container, rows) {
    container.innerHTML = '';
    rows.forEach(([label, amount]) => {
      const row = document.createElement('div');
      row.className = 'fee-row';
      const name = document.createElement('span'); name.textContent = label;
      const value = document.createElement('strong'); value.textContent = money(amount);
      row.append(name, value); container.appendChild(row);
    });
  }
  function prepareSmaBenefits(rows) {
    return rows.map(([label, amount]) => {
      if (label === 'Perlengkapan Putra/Putri') return [apparel.SMA[state.gender][0], apparel.SMA[state.gender][1]];
      return [label, amount];
    });
  }
  function renderSummary() {
    const baseRows = feeData[state.jenjang].map(row => [...row]);
    baseRows.splice(8, 0, [...apparel[state.jenjang][state.gender]]);
    const benefitRowsRaw = benefitSets[state.jenjang][state.program][state.kategori];
    const benefitRows = state.jenjang === 'SMA' ? prepareSmaBenefits(benefitRowsRaw) : benefitRowsRaw;
    const baseTotal = baseRows.reduce((sum, row) => sum + row[1], 0);
    const benefitTotal = benefitRows.reduce((sum, row) => sum + row[1], 0);

    // Hanya manfaat yang membebaskan komponen biaya awal yang dikurangkan.
    // Pembebasan infaq bulanan/periode berikutnya tetap dihitung sebagai manfaat,
    // tetapi tidak mengurangi tagihan awal.
    const baseByLabel = new Map(baseRows.map(([label, amount]) => [label, amount]));
    const initialBenefitTotal = benefitRows.reduce((sum, [label, amount]) => {
      const initialCost = baseByLabel.get(label) || 0;
      return sum + Math.min(initialCost, amount);
    }, 0);
    const payableTotal = Math.max(0, baseTotal - initialBenefitTotal);
    const programName = categoryLabels[state.program].title;
    document.getElementById('summaryTitle').textContent = `Rincian ${programName}`;
    document.getElementById('selectionSummary').innerHTML = `<strong>${state.jenjang} Hasanuddin · ${state.gender}</strong>${programName} — ${state.kategori}`;
    renderRows(document.getElementById('normalFeeList'), baseRows);
    renderRows(document.getElementById('benefitList'), benefitRows);
    document.getElementById('normalFeeTotal').textContent = money(baseTotal);
    document.getElementById('benefitTotal').textContent = money(benefitTotal);
    document.getElementById('summaryBaseTotal').textContent = money(baseTotal);
    document.getElementById('summaryInitialBenefit').textContent = `− ${money(benefitTotal)}`;
    document.getElementById('summaryPayableTotal').textContent = money(payableTotal);
    const note = state.jenjang === 'SMP' && benefitRows.some(row => row[0].toLowerCase().includes('infaq'))
      ? 'Pembebasan infaq pada jalur yang dipilih berlaku selama jumlah bulan yang tercantum. Nilai manfaat bukan uang tunai dan tidak langsung dikurangkan dari total biaya awal. Nominal dan ketentuan akan dikonfirmasi panitia.'
      : 'Nilai manfaat merupakan rincian komponen bantuan, bukan uang tunai yang diberikan kepada calon siswa. Ketentuan dan penerapan manfaat akan dikonfirmasi panitia.';
    document.getElementById('feeDisclaimer').textContent = note;
  }

  document.querySelectorAll('#step1 [data-jenjang]').forEach(button => button.addEventListener('click', () => {
    state.jenjang = button.dataset.jenjang; state.program = ''; state.kategori = ''; state.gender = '';
    selectButton('#step1 [data-jenjang]', 'jenjang', state.jenjang);
    trackEvent('registration_jenjang_select', {
      jenjang: state.jenjang,
      form_step: 'jenjang'
    });
    showStep(2);
  }));
  document.querySelectorAll('#step2 [data-program]').forEach(button => button.addEventListener('click', () => {
    state.program = button.dataset.program; state.kategori = '';
    selectButton('#step2 [data-program]', 'program', state.program);
    trackEvent('registration_program_select', {
      jenjang: state.jenjang,
      jalur: state.program,
      form_step: 'jalur'
    });
    categoriesForCurrentSelection(); showStep(3);
  }));
  document.querySelectorAll('#step4 [data-gender]').forEach(button => button.addEventListener('click', () => {
    state.gender = button.dataset.gender;
    selectButton('#step4 [data-gender]', 'gender', state.gender);
    trackEvent('registration_gender_select', {
      jenjang: state.jenjang,
      jalur: state.program,
      kategori: state.kategori,
      gender: state.gender,
      form_step: 'jenis_kelamin'
    });
    renderSummary();
    trackEvent('registration_summary_view', {
      jenjang: state.jenjang,
      jalur: state.program,
      kategori: state.kategori,
      gender: state.gender,
      form_step: 'rincian_biaya'
    });
    showStep(5);
  }));
  document.getElementById('btnTertarik')?.addEventListener('click', () => {
    trackEvent('registration_start', {
      jenjang: state.jenjang,
      jalur: state.program,
      kategori: state.kategori,
      gender: state.gender,
      form_step: 'data_calon_siswa'
    });
    trackEvent('registration_form_view', {
      jenjang: state.jenjang,
      jalur: state.program,
      kategori: state.kategori,
      gender: state.gender,
      form_step: 'formulir'
    });
    showStep('form');
  });
  document.querySelectorAll('.back-btn').forEach(button => button.addEventListener('click', () => {
    const target = button.dataset.back;
    showStep(target === '1' ? 1 : target === '2' ? 2 : target === '3' ? 3 : target === '4' ? 4 : 5);
  }));

  // ---------- Form to WhatsApp ----------
  document.getElementById('interestForm')?.addEventListener('submit', event => {
    event.preventDefault();
    if (!state.jenjang || !state.program || !state.kategori || !state.gender) return;
    const form = event.currentTarget;
    const nama = form.elements.nama.value.trim();
    const asal = form.elements.asal.value.trim();
    const whatsapp = form.elements.whatsapp.value.trim();
    const programName = categoryLabels[state.program].title;
    const benefitRows = state.jenjang === 'SMA'
      ? prepareSmaBenefits(benefitSets[state.jenjang][state.program][state.kategori])
      : benefitSets[state.jenjang][state.program][state.kategori];
    const total = benefitRows.reduce((sum, row) => sum + row[1], 0);
    const baseRows = feeData[state.jenjang].map(row => [...row]);
    baseRows.splice(8, 0, [...apparel[state.jenjang][state.gender]]);
    const baseTotal = baseRows.reduce((sum, row) => sum + row[1], 0);
    const baseByLabel = new Map(baseRows.map(([label, amount]) => [label, amount]));
    const initialBenefitTotal = benefitRows.reduce((sum, [label, amount]) => sum + Math.min(baseByLabel.get(label) || 0, amount), 0);
    const deferredBenefits = benefitRows.filter(([label]) => label.toLowerCase().includes('infaq'));
    const deferredBenefitTotal = deferredBenefits.reduce((sum, row) => sum + row[1], 0);
    const payableTotal = Math.max(0, baseTotal - initialBenefitTotal);
    const message = [
      'Assalamu’alaikum, Panitia SPMB Haswada.', '',
      'Saya ingin meminta informasi pendaftaran dan beasiswa dengan data berikut:',
      `Nama calon siswa: ${nama}`, `Jenjang: ${state.jenjang} Hasanuddin`,
      `Jalur: ${programName}`, `Kategori: ${state.kategori}`, `Jenis kelamin: ${state.gender}`,
      `Asal sekolah: ${asal}`, `WhatsApp orang tua/wali: ${whatsapp}`, '',
      'Rincian biaya dan manfaat beasiswa:',
      `Total biaya awal: ${money(baseTotal)}`,
      `Potongan langsung biaya awal: ${money(initialBenefitTotal)}`,
      ...(deferredBenefits.length ? [`Manfaat pembebasan infaq: ${money(deferredBenefitTotal)} (${deferredBenefits.map(([label]) => label).join(', ')})`] : []),
      `Total nilai manfaat beasiswa: ${money(total)}`,
      `Perkiraan biaya awal yang perlu dibayar: ${money(payableTotal)}`, '',
      'Mohon informasi mengenai persyaratan, bukti prestasi (jika diperlukan), dan tahapan pendaftaran. Terima kasih.'
    ].join('\n');
    // Catat perpindahan dari website ke WhatsApp. Jangan kirim nama,
    // asal sekolah, nomor telepon, atau isi pesan ke GA4.
    trackEvent('whatsapp_handoff', {
      jenjang: state.jenjang,
      jalur: state.program,
      kategori: state.kategori,
      gender: state.gender,
      method: 'whatsapp',
      cta_location: 'registration_form'
    });
    // Pertahankan event lama agar laporan GA4 yang sudah ada tetap berjalan.
    trackEvent('whatsapp_lanjut_click', {
      event_category: 'SPMB',
      event_label: `${state.jenjang} - ${programName} - ${state.kategori}`
    });
    const phone = '628385902900';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });
});
