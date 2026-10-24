/* Yelkovan · yelkovan.ai — küçük etkileşimler: tema, üst şerit, görünme, imleç ışığı, açılış animasyonu, vitrin. */
(function () {
  'use strict';
  var kok = document.documentElement;
  var azHareket = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* tema: varsayılan koyu, seçim saklanır; destekleyen tarayıcıda düğmeden açılan daire geçişi */
  var temaDugme = document.querySelector('.tema');
  function temaYaz(t) {
    kok.dataset.theme = t;
    try { localStorage.setItem('yk-tema', t); } catch (e) {}
    var renk = t === 'light' ? '#F3F6F5' : '#0B1419';
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.setAttribute('content', renk); });
  }
  if (temaDugme) {
    temaDugme.addEventListener('click', function (e) {
      var yeni = kok.dataset.theme === 'light' ? 'dark' : 'light';
      if (!document.startViewTransition || azHareket) { temaYaz(yeni); return; }
      var r = temaDugme.getBoundingClientRect();
      var x = r.left + r.width / 2, y = r.top + r.height / 2;
      var yaricap = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      kok.style.setProperty('--tx', x + 'px'); kok.style.setProperty('--ty', y + 'px'); kok.style.setProperty('--tr', yaricap + 'px');
      document.startViewTransition(function () { temaYaz(yeni); });
    });
  }

  /* üst şerit: kaydırınca buzlu zemin */
  var ust = document.getElementById('ust');
  function ustGuncelle() { if (ust) ust.classList.toggle('kaydi', window.scrollY > 12); }
  ustGuncelle();
  window.addEventListener('scroll', ustGuncelle, { passive: true });

  /* görünme */
  var gozlenenler = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !azHareket) {
    var gozcu = new IntersectionObserver(function (girdiler) {
      girdiler.forEach(function (g) { if (g.isIntersecting) { g.target.classList.add('gorundu'); gozcu.unobserve(g.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    gozlenenler.forEach(function (el) { gozcu.observe(el); });
  } else {
    gozlenenler.forEach(function (el) { el.classList.add('gorundu'); });
  }

  /* uygulama satırlarında imleci izleyen ışık */
  document.querySelectorAll('.uyg').forEach(function (s) {
    s.addEventListener('pointermove', function (e) {
      var r = s.getBoundingClientRect();
      s.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      s.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* açılış: ortada katlanan kuş, yazıyla birleşip başlıktaki logonun yerine uçar.
     Sayfa ilk açılışta (sekme başına bir kez) ve başlıktaki logoya tıklanınca oynar. */
  // JS yüklendi: açılışı kendimiz yöneteceğiz, sayfadaki yedek zamanlayıcı (JS yüklenmezse açılışı kapatır) gereksiz
  if (window.ykAcilisYedek) clearTimeout(window.ykAcilisYedek);
  var sahne = document.querySelector('.acilis-sahne');
  var hedef = document.querySelector('.ust .logo');
  var calisiyor = false;
  function acilisiOynat(tekrar) {
    if (!sahne || !hedef || calisiyor) return;
    calisiyor = true;
    var kilit = sahne.querySelector('.acilis-kilit');
    var ic = sahne.querySelector('.acilis-ic');
    var isaret = sahne.querySelector('.acilis-isaret');
    if (tekrar) {
      // hero animasyonlarını başa sar, kuş yeniden katlanırken beklesinler
      kok.classList.add('sifirla');
      void kok.offsetWidth;
      kok.classList.remove('sifirla', 'ucus', 'hemen');
      kok.style.setProperty('--S', Math.min(3, (window.innerWidth - 48) / 150).toFixed(2));
      kok.classList.add('acilis', 'bekle');
    }
    // işaret önce ekranın ortasında katlansın; yazı açılırken sola kayar
    ic.style.setProperty('--kay', ((ic.offsetWidth - isaret.offsetWidth) / 2) + 'px');
    var bitti = false, ucus = null;
    var atlat = new AbortController();
    // katlama + yazının açılması bitince uçuş başlar
    var zaman = setTimeout(function () { uc(false); }, 2550);
    function kapat() {
      kok.classList.remove('acilis', 'ucus', 'hemen', 'bekle', 'iniyor');
      if (ucus) { ucus.cancel(); ucus = null; }
      atlat.abort();
      calisiyor = false;
    }
    function uc(hizli) {
      if (bitti) return;
      bitti = true; clearTimeout(zaman);
      try { sessionStorage.setItem('yk-acilis', '1'); } catch (e) {}
      if (hizli) { kok.classList.add('hemen'); void kilit.offsetWidth; }
      var h = hedef.getBoundingClientRect(), k = kilit.getBoundingClientRect();
      var olcek = h.height / k.height;
      var dx = h.left - k.left, dy = h.top - k.top;
      var sure = hizli ? 550 : 1100;
      // yay: önce hafifçe yükselir, sonra sola süzülür; küçülme yolculuğun biraz önünden gider
      var kx = dx * 0.18, ky = dy * 1.12, kareler = [];
      for (var i = 0; i <= 14; i++) {
        var u = i / 14, v = 1 - u;
        var x = 2 * v * u * kx + u * u * dx, y = 2 * v * u * ky + u * u * dy;
        var w = Math.min(1, u * 1.15), o = 1 + (olcek - 1) * (w * w * (3 - 2 * w));
        kareler.push({ offset: u, transform: 'translate(' + x.toFixed(2) + 'px, ' + y.toFixed(2) + 'px) scale(' + o.toFixed(4) + ')' });
      }
      kok.classList.add('ucus');
      ucus = kilit.animate(kareler, { duration: sure, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' });
      // hero, uçan logo başlığın üstünden geçmesin diye uçuşun sonuna doğru başlar
      setTimeout(function () { kok.classList.remove('bekle'); }, sure * (hizli ? 0.4 : 0.7));
      // kilit tam yerine oturduğu an başlıktaki logoyla yer değiştirir (üst üste kayık iki logo görünmesin diye uçuş bitmeden değil)
      var indi = false;
      function in_() { if (indi) return; indi = true; kok.classList.add('iniyor'); setTimeout(kapat, 200); }
      ucus.onfinish = in_;
      setTimeout(in_, sure + 120);
    }
    // tıklama, tuş ya da kaydırma açılışı hızlıca bitirir (başlatan tıklama sayılmasın diye kısa gecikmeyle)
    setTimeout(function () {
      ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (olay) {
        window.addEventListener(olay, function () { uc(true); }, { once: true, passive: true, signal: atlat.signal });
      });
    }, tekrar ? 350 : 0);
  }
  if (kok.classList.contains('acilis')) acilisiOynat(false);
  if (hedef) {
    hedef.addEventListener('click', function (e) {
      if (azHareket || !sahne || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'instant' });
      acilisiOynat(true);
    });
  }
  /* hero sağındaki uygulama vitrini: solda adlar, sağda seçilen uygulamanın mağaza görseli; sırayla döner, ada gelince o uygulamaya geçer */
  var vitrin = document.querySelector('.vitrin');
  if (vitrin) {
    var bannerlar = Array.prototype.slice.call(vitrin.querySelectorAll('.banner'));
    var sekmeler = Array.prototype.slice.call(vitrin.querySelectorAll('.vitrin-sekmeler button'));
    var n = bannerlar.length, aktif = 0, sira = null, uzerinde = false, SURE = 4200;
    vitrin.style.setProperty('--sure', SURE + 'ms');
    function yerlestir() {
      bannerlar.forEach(function (b, i) { b.dataset.poz = (i - aktif + n) % n; b.tabIndex = i === aktif ? 0 : -1; });
      sekmeler.forEach(function (sk, i) { sk.classList.remove('aktif'); sk.setAttribute('aria-selected', i === aktif ? 'true' : 'false'); });
      void vitrin.offsetWidth;  // ilerleme çizgisi baştan başlasın
      if (sekmeler[aktif]) sekmeler[aktif].classList.add('aktif');
    }
    function planla() {
      clearTimeout(sira);
      if (uzerinde || azHareket || kok.classList.contains('bekle')) return;
      sira = setTimeout(function () { git((aktif + 1) % n); }, SURE);
    }
    function git(i) { aktif = i; yerlestir(); planla(); }
    sekmeler.forEach(function (sk, i) {
      sk.addEventListener('click', function () { git(i); });
      sk.addEventListener('mouseenter', function () { if (i !== aktif) git(i); });
    });
    vitrin.addEventListener('mouseenter', function () { uzerinde = true; clearTimeout(sira); });
    vitrin.addEventListener('mouseleave', function () { uzerinde = false; yerlestir(); planla(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(sira); else planla(); });
    // vitrin her açılışta Sorula'yla başlar (logoya basıp açılışı yeniden oynatınca da); açılış bitene kadar bekler, sonra döner
    var bekliyordu = kok.classList.contains('bekle');
    new MutationObserver(function () {
      var bekliyor = kok.classList.contains('bekle');
      if (bekliyor && !bekliyordu) { clearTimeout(sira); aktif = 0; yerlestir(); }  // açılış yeniden başladı
      if (bekliyordu && !bekliyor) yerlestir();  // ilerleme çizgisi dönüşle birlikte baştan başlasın
      if (!bekliyor) planla();
      bekliyordu = bekliyor;
    }).observe(kok, { attributes: true, attributeFilter: ['class'] });
    yerlestir(); planla();
  }
})();
