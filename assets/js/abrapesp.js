/* ============================================================
   ABRAPESP — App JS · navegação, dados e interações
   Associação Brasileira de Psicologia do Esporte
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Ícones (feather-style) ---------- */
  var I = {
    home:'<path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    handshake:'<path d="m11 17 2 2a1 1 0 0 0 1.4 0l3.6-3.6a2 2 0 0 0 0-2.8l-4.6-4.6a2 2 0 0 0-1.4-.6H8L3 12"/><path d="m14 8-3.5 3.5a1.4 1.4 0 0 0 0 2 1.4 1.4 0 0 0 2 0L18 9"/><path d="m2 15 3 3"/><path d="m21 13 1-1"/>',
    scroll:'<path d="M8 21h9a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7"/><path d="M5 3a2 2 0 0 0-2 2v3h4V5a2 2 0 0 0-2-2z"/><path d="M3 8v9a2 2 0 0 0 2 2h3"/><path d="M11 8h5M11 12h5M11 16h3"/>',
    calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    news:'<path d="M4 4h13v16H5a2 2 0 0 1-2-2V4z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><path d="M7 8h6M7 12h6M7 16h4"/>',
    pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7L22 6"/>',
    phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.8 2.1z"/>',
    pin:'<path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrow:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    ext:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>',
    down:'<path d="M12 3v14"/><path d="m6 11 6 6 6-6"/><path d="M5 21h14"/>',
    up:'<path d="m18 15-6-6-6 6"/>',
    chev:'<path d="m6 9 6 6 6-6"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    quote:'<path d="M10 11H6a1 1 0 0 1-1-1V7a3 3 0 0 1 3-3M20 11h-4a1 1 0 0 1-1-1V7a3 3 0 0 1 3-3"/>',
    trophy:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/>',
    brain:'<path d="M12 5a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 1 5.6V19a2 2 0 0 0 4 0M12 5a3 3 0 0 1 3 3 3 3 0 0 1 3 3 3 3 0 0 1-1 5.6V19a2 2 0 0 1-4 0M12 5v14"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
    activity:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    medal:'<circle cx="12" cy="15" r="6"/><path d="M12 12v3l2 1"/><path d="M8.5 9 5 2h5l2 4M15.5 9 19 2h-5l-2 4"/>',
    star:'<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/>',
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
    play:'<path d="M6 4l14 8-14 8z" fill="currentColor" stroke="none"/>',
    doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/>',
    users2:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    lightbulb:'<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
    ig:'<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>',
    fb:'<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    yt:'<path d="M22 8a3 3 0 0 0-2.1-2.1C18 5.4 12 5.4 12 5.4s-6 0-7.9.5A3 3 0 0 0 2 8a31 31 0 0 0 0 8 3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5A3 3 0 0 0 22 16a31 31 0 0 0 0-8z"/><path d="m10 15 5-3-5-3z" fill="currentColor" stroke="none"/>',
    linkedin:'<rect x="2" y="2" width="20" height="20" rx="4"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7" stroke-width="2"/>',
    x:'<path d="M4 3l7.5 9.5L4.5 21H7l6-6.8L18 21h2.5L13 11.5 19.5 3H17l-5.3 6.1L7 3z" fill="currentColor" stroke="none"/>'
  };
  function svg(name, cls){ return '<svg class="'+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+(I[name]||'')+'</svg>'; }

  /* ---------- Configuração global ---------- */
  var SOCIAL = {
    instagram: 'https://www.instagram.com/abrapesp_oficial/',
    youtube:   'https://www.youtube.com/@abrapesp3878',
    facebook:  'https://www.facebook.com/abrapesp',
    linkedin:  'https://www.linkedin.com/company/abrapespoficial/',
    twitter:   'https://twitter.com/abrapesp',
    email:     'tesouraria@abrapesp.org.br'
  };
  var LOGIN = 'https://associacoes.softaliza.com.br/login/abrapesp';
  var CONGRESSO = 'https://app.ciente.studio/abrapesp2025';
  var REVISTA = 'https://portalrevistas.ucb.br/index.php/RBPE';
  var CNPJ = '08.281.609/0001-98';

  var NAV = [
    { label:'Início', href:'/' },
    { label:'A ABRAPESP', mega:[
      { t:'Quem somos',      d:'Missão, história e propósito',        href:'quem-somos.html',    icon:'info' },
      { t:'Diretoria',       d:'Gestão 2024/2026',                    href:'diretoria.html',     icon:'users' },
      { t:'Parceiros · CRE', d:'Comitê de Relacionamento Externo',    href:'parceiros-cre.html', icon:'handshake' },
      { t:'Estatuto',        d:'Documento oficial (PDF)',             href:'estatuto.html',      icon:'scroll' }
    ]},
    { label:'Eventos', mega:[
      { t:'Eventos & Congressos', d:'Nossa trajetória de encontros',  href:'eventos.html',   icon:'calendar' },
      { t:'Congresso ABRAPESP',   d:'X Congresso · plataforma oficial', href:CONGRESSO,      icon:'trophy', ext:true }
    ]},
    { label:'Publicações', mega:[
      { t:'Notícias',            d:'Novidades da psicologia do esporte', href:'noticias.html',            icon:'news' },
      { t:'Coluna de Associados',d:'Artigos e reflexões dos associados', href:'coluna-de-associados.html',icon:'pen' },
      { t:'Revista RBPE',        d:'Revista Brasileira de Psic. do Esporte', href:REVISTA,           icon:'book', ext:true }
    ]},
    { label:'Associe-se', href:'associe-se.html' },
    { label:'Contato', href:'fale-conosco.html' }
  ];

  /* ---------- Diretoria (gestão atual) ---------- */
  var DIRETORIA = [
    { nome:'Marina Gusson',       cargo:'Presidente',          foto:'assets/img/diretoria/marina-gusson.jpeg' },
    { nome:'Matheus Vasconcelos', cargo:'Vice-Presidente',     foto:'assets/img/diretoria/matheus-vasconcelos.png' },
    { nome:'Marina Mattos',       cargo:'Primeira Secretária', foto:'assets/img/diretoria/marina-mattos.png' },
    { nome:'Gustavo Baroni',      cargo:'Segundo Secretário',  foto:'assets/img/diretoria/gustavo-baroni.png' },
    { nome:'Aline Lobo',          cargo:'Primeira Tesoureira', foto:'assets/img/diretoria/aline-lobo.jpeg' },
    { nome:'Ariel Murlik',        cargo:'Segundo Tesoureiro',  foto:'assets/img/diretoria/ariel-murlik.jpeg' }
  ];

  /* ---------- Parceiros (CRE) ---------- */
  var PARCEIROS = [
    { nome:'Flow Psicologia',   logo:'assets/img/parceiros/flow-psicologia.png',   url:'https://www.flowpsicologia.com.br/' },
    { nome:'REMS',              logo:'assets/img/parceiros/rems.png',              url:'https://rems.org.br/brasil-em-campo-glasgow-2016-homeless-world-cup/' },
    { nome:'Mundus Esportivus', logo:'assets/img/parceiros/mundus-esportivus.png', url:'https://www.mundusesportivus.com.br/' },
    { nome:'IESF AFÉ',          logo:'assets/img/parceiros/iesf-afe.png',          url:'https://www.iesfafe.pt/' },
    { nome:'Ludopédio',         logo:'assets/img/parceiros/ludopedio.png',         url:'https://ludopedio.com.br/' }
  ];

  /* ---------- Eventos & Congressos ---------- */
  var EVENTOS = [
    { tag:'Encontro', titulo:'Encontro Interinstitucional — Psicologia do Esporte e Coaching Esportivo', data:'16 de agosto de 2025', local:'ABRAPESP + ABEPEEx', img:'assets/img/eventos/encontro-interinstitucional.jpeg', desc:'Pela primeira vez na história, ABRAPESP e ABEPEEx uniram-se em um evento interinstitucional, com Marina Gusson, Matheus Vasconcelos, André Aroni e Franco Noce.', link:'https://youtu.be/RoMQhnYf25A' },
    { tag:'X Congresso · 2025', titulo:'X Congresso Brasileiro de Psicologia do Esporte', data:'03 a 06 de setembro de 2025', local:'Uni7 · Fortaleza — CE', img:'assets/img/eventos/x-congresso-2025.png', desc:'A décima edição do principal congresso brasileiro da área, reunindo pesquisadores e profissionais em Fortaleza.', link:CONGRESSO },
    { tag:'IX Congresso · 2023', titulo:'IX Congresso da ABRAPESP', data:'15 a 18 de novembro de 2023', local:'UNIFASE · Petrópolis — RJ', img:'assets/img/eventos/ix-congresso-2023.png', desc:'“A Psicologia do Esporte no Brasil no século XXI — 20 anos de ABRAPESP”.' },
    { tag:'VIII Congresso · 2021', titulo:'VIII Congresso da ABRAPESP', data:'19 a 21 de novembro de 2021', local:'Formato remoto', img:'assets/img/eventos/viii-congresso-2021.png', desc:'Evento bianual dedicado a debater temas emergentes em Psicologia do Esporte e Exercício Físico.' },
    { tag:'VII Congresso · 2019', titulo:'VII Congresso da ABRAPESP', data:'2019', local:'SESC · EEFERP-USP · Ribeirão Preto — SP', img:'assets/img/eventos/vii-congresso-2019.jpg', desc:'Encontro realizado entre o SESC Ribeirão Preto, a EEFERP-USP e o Teatro do Campus-USP.' },
    { tag:'VI Congresso · 2017', titulo:'VI Congresso da ABRAPESP', data:'2017', local:'Universidade Católica de Brasília', img:'assets/img/eventos/vi-congresso-2017.jpeg', desc:'Edição realizada na Universidade Católica de Brasília.' },
    { tag:'V Congresso · 2015', titulo:'V Congresso da ABRAPESP', data:'2015', local:'Universidade Católica de Brasília', img:'assets/img/eventos/v-congresso-2015.png', desc:'Quinta edição do congresso nacional da associação.' }
  ];

  /* ---------- Notícias / Coluna (fonte: window.ABRAPESP_NEWS) ---------- */
  function allNews(){ return Array.isArray(window.ABRAPESP_NEWS) ? window.ABRAPESP_NEWS : []; }

  /* ---------- Utilidades ---------- */
  function el(html){ var t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }
  function currentPage(){ var p=location.pathname.split('/').pop(); return p || 'index.html'; }
  function escq(s){ return String(s).replace(/"/g,'&quot;'); }
  function initials(name){ return name.split(/\s+/).slice(0,2).map(function(w){return w[0];}).join('').toUpperCase(); }

  /* ---------- Header ---------- */
  function buildHeader() {
    var cur = currentPage();
    function norm(p){ return (p==='/'||p===''||p==='index.html') ? 'index.html' : p; }
    var itemsHtml = NAV.map(function (item) {
      var active = false;
      if (item.href && norm(item.href) === norm(cur)) active = true;
      if (item.mega && item.mega.some(function(s){ return !s.ext && norm(s.href) === norm(cur); })) active = true;
      if (item.mega) {
        var links = item.mega.map(function (s) {
          var ext = s.ext ? ' target="_blank" rel="noopener"' : '';
          return '<a class="mega__link" href="'+s.href+'"'+ext+'><span class="mega__ico">'+svg(s.icon)+'</span>'+
                 '<span><span class="mega__t">'+s.t+(s.ext?' '+svg('ext','chev'):'')+'</span><span class="mega__d">'+s.d+'</span></span></a>';
        }).join('');
        var firstInternal = item.mega.find(function(s){ return !s.ext; }) || item.mega[0];
        return '<li class="nav__item has-mega'+(active?' is-active':'')+'">'+
               '<a class="nav__link" href="'+firstInternal.href+'">'+item.label+svg('chev','chev')+'</a>'+
               '<div class="mega'+(item.mega.length>3?' mega--wide':'')+'">'+links+'</div></li>';
      }
      return '<li class="nav__item'+(active?' is-active':'')+'"><a class="nav__link" href="'+item.href+'">'+item.label+'</a></li>';
    }).join('');
    return el(
      '<header class="site-header" id="siteHeader">'+
        '<div class="container site-header__inner">'+
          '<a class="brand" href="/" aria-label="ABRAPESP — Início">'+
            '<img src="assets/img/logo-abrapesp.png" alt="ABRAPESP">'+
            '<span class="brand__name"><b>ABRAPESP</b><span>Psicologia do Esporte</span></span>'+
          '</a>'+
          '<nav class="nav" aria-label="Menu principal"><ul>'+itemsHtml+'</ul></nav>'+
          '<div class="header-cta">'+
            '<a class="btn btn--ghost btn--sm" href="'+LOGIN+'" target="_blank" rel="noopener">Área do associado</a>'+
            '<a class="btn btn--brand btn--sm" href="associe-se.html">Associe-se</a>'+
            '<button class="burger" id="burger" aria-label="Abrir menu" aria-expanded="false"><span></span><span></span><span></span></button>'+
          '</div>'+
        '</div>'+
      '</header>'
    );
  }

  function buildMobileNav() {
    var groups = NAV.map(function (item) {
      if (item.mega) {
        var subs = item.mega.map(function (s) {
          var ext = s.ext ? ' target="_blank" rel="noopener"' : '';
          return '<a href="'+s.href+'"'+ext+'>'+s.t+'</a>';
        }).join('');
        return '<div class="m-group"><button class="m-top" type="button">'+item.label+svg('chev','chev')+'</button>'+
               '<div class="m-sub"><div>'+subs+'</div></div></div>';
      }
      return '<div class="m-group"><a class="m-top" href="'+item.href+'" style="text-decoration:none">'+item.label+'</a></div>';
    }).join('');
    return el('<div class="mobile-nav" id="mobileNav">'+groups+
      '<a class="btn btn--ghost" href="'+LOGIN+'" target="_blank" rel="noopener">Área do associado</a>'+
      '<a class="btn btn--brand" href="associe-se.html">Associe-se à ABRAPESP</a></div>');
  }

  /* ---------- Footer ---------- */
  function footerCol(title, links) {
    return '<div class="footer-col"><h4>'+title+'</h4><ul>'+
      links.map(function(l){ var ext=l.ext?' target="_blank" rel="noopener"':''; return '<li><a href="'+l.href+'"'+ext+'>'+l.t+'</a></li>'; }).join('')+'</ul></div>';
  }
  function buildFooter() {
    return el(
      '<footer class="site-footer">'+
        '<div class="container">'+
          '<div class="footer-grid">'+
            '<div class="footer-brand">'+
              '<a class="brand" href="/" aria-label="ABRAPESP"><img src="assets/img/logo-abrapesp.png" alt="ABRAPESP" style="width:52px;height:52px"><span class="brand__name"><b>ABRAPESP</b><span>Psicologia do Esporte</span></span></a>'+
              '<p>A Associação Brasileira de Psicologia do Esporte zela e incentiva o crescimento da ciência e da profissão de psicólogo do esporte, promovendo o bem-estar e o desenvolvimento humano por meio do esporte e da atividade física.</p>'+
              '<div class="footer-social">'+
                '<a href="'+SOCIAL.instagram+'" target="_blank" rel="noopener" aria-label="Instagram">'+svg('ig')+'</a>'+
                '<a href="'+SOCIAL.youtube+'" target="_blank" rel="noopener" aria-label="YouTube">'+svg('yt')+'</a>'+
                '<a href="'+SOCIAL.facebook+'" target="_blank" rel="noopener" aria-label="Facebook">'+svg('fb')+'</a>'+
                '<a href="'+SOCIAL.linkedin+'" target="_blank" rel="noopener" aria-label="LinkedIn">'+svg('linkedin')+'</a>'+
                '<a href="'+SOCIAL.twitter+'" target="_blank" rel="noopener" aria-label="X">'+svg('x')+'</a>'+
              '</div>'+
            '</div>'+
            footerCol('A ABRAPESP', [
              {t:'Quem somos', href:'quem-somos.html'}, {t:'Diretoria', href:'diretoria.html'},
              {t:'Parceiros · CRE', href:'parceiros-cre.html'}, {t:'Estatuto', href:'estatuto.html'},
              {t:'Associe-se', href:'associe-se.html'}
            ])+
            footerCol('Conteúdo', [
              {t:'Notícias', href:'noticias.html'}, {t:'Coluna de Associados', href:'coluna-de-associados.html'},
              {t:'Eventos & Congressos', href:'eventos.html'}, {t:'Congresso ABRAPESP', href:CONGRESSO, ext:true},
              {t:'Revista RBPE', href:REVISTA, ext:true}
            ])+
            '<div class="footer-col">'+
              '<h4>Contato</h4>'+
              '<ul class="footer-contact">'+
                '<li><strong>E-mail</strong><a href="mailto:'+SOCIAL.email+'">'+SOCIAL.email+'</a></li>'+
                '<li><strong>Área do associado</strong><a href="'+LOGIN+'" target="_blank" rel="noopener">Acessar plataforma</a></li>'+
                '<li><strong>CNPJ</strong>'+CNPJ+'</li>'+
              '</ul>'+
              '<a class="btn btn--gold btn--sm" href="fale-conosco.html" style="margin-top:6px">Fale conosco</a>'+
            '</div>'+
          '</div>'+
          '<div class="footer-bottom">'+
            '<span>© <span data-year>2026</span> ABRAPESP — Associação Brasileira de Psicologia do Esporte.</span>'+
            '<span>Ciência · Esporte · Bem-estar</span>'+
          '</div>'+
        '</div>'+
      '</footer>'
    );
  }

  /* ---------- Interações ---------- */
  function initHeaderBehaviour() {
    var header = document.getElementById('siteHeader');
    var hero = document.body.getAttribute('data-hero') === 'true';
    function apply() {
      var scrolled = window.scrollY > 30;
      if (hero && !scrolled) { header.classList.add('is-transparent'); header.classList.remove('is-solid'); }
      else { header.classList.add('is-solid'); header.classList.remove('is-transparent'); }
    }
    apply();
    window.addEventListener('scroll', apply, { passive:true });
    var burger = document.getElementById('burger');
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true':'false');
    });
    document.querySelectorAll('#mobileNav .m-top').forEach(function (btn) {
      if (btn.tagName === 'BUTTON') btn.addEventListener('click', function(){ btn.parentElement.classList.toggle('open'); });
    });
    document.querySelectorAll('#mobileNav a').forEach(function(a){ a.addEventListener('click', function(){ document.body.classList.remove('menu-open'); }); });
  }

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) { els.forEach(function(e){ e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  function initCounters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var node = e.target, target = parseInt(node.getAttribute('data-count'), 10), suf = node.getAttribute('data-suffix')||'', pre = node.getAttribute('data-prefix')||'';
        var start = null, dur = 1700;
        function step(ts){ if(!start) start=ts; var p=Math.min((ts-start)/dur,1); var val=Math.floor((1-Math.pow(1-p,3))*target); node.textContent=pre+val.toLocaleString('pt-BR')+suf; if(p<1) requestAnimationFrame(step); }
        requestAnimationFrame(step); io.unobserve(node);
      });
    }, { threshold: 0.5 });
    nums.forEach(function(n){ io.observe(n); });
  }

  function initToTop() {
    var btn = el('<button class="to-top" aria-label="Voltar ao topo">'+svg('up')+'</button>');
    document.body.appendChild(btn);
    btn.addEventListener('click', function(){ window.scrollTo({ top:0, behavior:'smooth' }); });
    window.addEventListener('scroll', function(){ btn.classList.toggle('show', window.scrollY > 600); }, { passive:true });
  }

  /* ---------- Renderizadores ---------- */
  function newsCard(n, i){
    var isCol = n.catSlug === 'coluna';
    var media = n.img
      ? '<div class="news-card__media"><span class="news-card__tag'+(isCol?' news-card__tag--coluna':'')+'">'+n.cat+'</span><img src="'+n.img+'" alt="'+escq(n.title)+'" loading="lazy"></div>'
      : '<div class="news-card__media"><span class="news-card__tag'+(isCol?' news-card__tag--coluna':'')+'">'+n.cat+'</span></div>';
    return '<a class="news-card reveal" data-delay="'+(i%4+1)+'" href="'+n.slug+'.html">'+
      media+
      '<div class="news-card__body">'+
        '<div class="news-card__date">'+n.date+'</div>'+
        '<h3 class="news-card__title">'+n.title+'</h3>'+
        '<p class="news-card__excerpt">'+(n.excerpt||'')+'</p>'+
        '<span class="news-card__more">Ler '+(isCol?'coluna':'notícia')+' '+svg('arrow')+'</span>'+
      '</div>'+
    '</a>';
  }

  function renderNews() {
    var host = document.querySelector('[data-news-grid]');
    if (!host) return;
    var limit = parseInt(host.getAttribute('data-limit'), 10) || 4;
    var list = allNews().filter(function(n){ return n.catSlug==='noticia'; }).slice(0, limit);
    host.innerHTML = list.map(newsCard).join('');
  }

  function renderColunaHome() {
    var host = document.querySelector('[data-coluna-grid]');
    if (!host) return;
    var limit = parseInt(host.getAttribute('data-limit'), 10) || 3;
    var list = allNews().filter(function(n){ return n.catSlug==='coluna'; }).slice(0, limit);
    host.innerHTML = list.map(function(c,i){
      var author = (c.excerpt||'').split(/[\.\n–—-]/)[0].trim();
      if(author.length>34 || author.split(' ').length>4) author='';
      return '<a class="col-card reveal" data-delay="'+(i%3+1)+'" href="'+c.slug+'.html">'+
        svg('quote','col-card__quote')+
        '<h3>'+c.title+'</h3>'+
        '<div class="col-card__meta"><span class="col-card__av">'+svg('pen')+'</span>'+
        '<span class="col-card__by"><b>Coluna de Associados</b><span>'+c.date+'</span></span></div>'+
      '</a>';
    }).join('');
  }

  /* Arquivo (noticias.html / coluna-de-associados.html) */
  function initArchive(){
    var host = document.querySelector('[data-news-archive]');
    if(!host) return;
    var cat = host.getAttribute('data-cat') || 'all';
    var PER = 12, shown = PER;
    var list = allNews().filter(function(n){ return cat==='all' ? true : n.catSlug===cat; });
    var filter = 'all';
    function view(){
      var f = list.filter(function(n){ return filter==='all'?true:n.catSlug===filter; });
      host.innerHTML = f.slice(0,shown).map(newsCard).join('');
      var more = document.querySelector('[data-load-more]');
      if(more) more.style.display = shown < f.length ? '' : 'none';
      // reativar reveal
      host.querySelectorAll('.reveal').forEach(function(e){ e.classList.add('in'); });
    }
    var moreBtn = document.querySelector('[data-load-more]');
    if(moreBtn) moreBtn.addEventListener('click', function(){ shown += PER; view(); });
    document.querySelectorAll('[data-filter]').forEach(function(chip){
      chip.addEventListener('click', function(){
        document.querySelectorAll('[data-filter]').forEach(function(c){ c.classList.remove('is-active'); });
        chip.classList.add('is-active'); filter = chip.getAttribute('data-filter'); shown = PER; view();
      });
    });
    view();
  }

  function renderDiretoria(){
    var host = document.querySelector('[data-diretoria]');
    if(!host) return;
    host.innerHTML = DIRETORIA.map(function(p,i){
      return '<div class="person reveal" data-delay="'+(i%3+1)+'">'+
        '<div class="person__photo"><img src="'+p.foto+'" alt="'+escq(p.nome)+'" loading="lazy"></div>'+
        '<div class="person__body"><div class="person__role">'+p.cargo+'</div><div class="person__name">'+p.nome+'</div></div>'+
      '</div>';
    }).join('');
  }

  function renderParceiros(){
    var host = document.querySelector('[data-parceiros]');
    if(host){
      host.innerHTML = PARCEIROS.map(function(p,i){
        return '<a class="partner reveal" data-delay="'+(i%4+1)+'" href="'+p.url+'" target="_blank" rel="noopener">'+
          '<div class="partner__logo"><img src="'+p.logo+'" alt="'+escq(p.nome)+'" loading="lazy"></div>'+
          '<div class="partner__name">'+p.nome+'</div>'+
          '<span class="partner__ext">Visitar '+svg('ext')+'</span>'+
        '</a>';
      }).join('');
    }
    var mq = document.querySelector('[data-parceiros-marquee]');
    if(mq){
      var chips = PARCEIROS.map(function(p){ return '<a class="logo-chip" href="'+p.url+'" target="_blank" rel="noopener"><img src="'+p.logo+'" alt="'+escq(p.nome)+'"></a>'; }).join('');
      mq.innerHTML = '<div class="logo-track">'+chips+chips+chips+'</div>';
    }
  }

  function renderEventos(){
    var host = document.querySelector('[data-eventos]');
    if(!host) return;
    var limit = parseInt(host.getAttribute('data-limit'),10) || EVENTOS.length;
    host.innerHTML = EVENTOS.slice(0,limit).map(function(e,i){
      var link = e.link ? '<a class="card__link" href="'+e.link+'" target="_blank" rel="noopener" style="margin-top:16px">Saiba mais '+svg('ext')+'</a>' : '';
      return '<article class="event reveal" data-delay="'+(i%2+1)+'">'+
        '<div class="event__media"><img src="'+e.img+'" alt="'+escq(e.titulo)+'" loading="lazy"></div>'+
        '<div class="event__body">'+
          '<span class="event__tag">'+svg('trophy')+e.tag+'</span>'+
          '<h3 class="event__title">'+e.titulo+'</h3>'+
          '<div class="event__meta"><span>'+svg('calendar')+e.data+'</span><span>'+svg('pin')+e.local+'</span></div>'+
          '<p>'+e.desc+'</p>'+link+
        '</div>'+
      '</article>';
    }).join('');
  }

  function initYear(){ document.querySelectorAll('[data-year]').forEach(function(e){ e.textContent=new Date().getFullYear(); }); }

  /* ---------- Boot ---------- */
  function boot() {
    var header = buildHeader();
    document.body.insertBefore(header, document.body.firstChild);
    document.body.insertBefore(buildMobileNav(), header.nextSibling);
    document.body.appendChild(buildFooter());

    initHeaderBehaviour();
    renderNews();
    renderColunaHome();
    renderDiretoria();
    renderParceiros();
    renderEventos();
    initArchive();
    initReveal();
    initCounters();
    initToTop();
    initYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.ABRAPESP = { NAV:NAV, SOCIAL:SOCIAL, DIRETORIA:DIRETORIA, PARCEIROS:PARCEIROS, EVENTOS:EVENTOS, svg:svg, LOGIN:LOGIN, CONGRESSO:CONGRESSO, REVISTA:REVISTA };
})();
