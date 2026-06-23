import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

/* -------------------------------------------------------------------------- */
/*  Scroll reveal hook                                                         */
/* -------------------------------------------------------------------------- */

function useReveal() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = root.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return rootRef;
}

/* -------------------------------------------------------------------------- */
/*  Small subcomponents                                                        */
/* -------------------------------------------------------------------------- */

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function Mark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M16 4 C 9 10, 6 16, 8 22 C 10 28, 20 28, 22 22 C 24 16, 21 10, 16 4 Z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M16 6 L 16 26" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="16" cy="16" r="1.6" fill="currentColor" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Top nav                                                                    */
/* -------------------------------------------------------------------------- */

function TopNav() {
  return (
    <header className="landing-nav">
      <div className="landing-nav-inner">
        <a className="landing-brand" href="#top">
          <Mark />
          <span className="landing-brand-word">CropTrack</span>
        </a>

        <nav className="landing-nav-links" aria-label="Primary">
          <a href="#demo">Demo</a>
          <a href="#value">Por que CropTrack</a>
          <a href="#process">Como funciona</a>
        </nav>

        <Link to="/app" className="landing-nav-cta">
          <span>Abrir plataforma</span>
          <ArrowRight />
        </Link>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-grain" aria-hidden />
      <div className="hero-orb" aria-hidden />
      <div className="hero-numeral" aria-hidden>001</div>
      <div className="hero-grid-lines" aria-hidden>
        <span /><span /><span /><span /><span />
      </div>

      <div className="hero-inner">
        <div className="hero-main">
          <div className="hero-eyebrow">
            <span className="hero-dot" />
            <span>Plataforma de inteligência agrícola</span>
          </div>

          <h1 className="hero-title">
            Proteja cada <span className="hero-title-em">safra</span>.<br />
            Aja antes da <span className="hero-title-wonk">perda</span> aparecer.
          </h1>

          <p className="hero-sub">
            O CropTrack transforma um celular, drone ou câmera de campo em um monitor
            de saúde da lavoura em tempo real. Identifique doenças, pragas e estresse
            dias antes — e decida com a evidência do seu próprio talhão.
          </p>

          <div className="hero-actions">
            <Link to="/app" className="btn-primary">
              <span>Começar a monitorar</span>
              <ArrowRight />
            </Link>
            <a href="#demo" className="btn-ghost">
              <span>Ver a demo</span>
            </a>
          </div>
        </div>

        <aside className="hero-meta" aria-label="Platform highlights">
          <div className="hero-meta-row">
            <span className="hero-meta-label">Detecção precoce média</span>
            <span className="hero-meta-value hero-meta-strong">+12 dias</span>
          </div>
          <div className="hero-meta-row">
            <span className="hero-meta-label">Produção potencial salva</span>
            <span className="hero-meta-value">até 30%</span>
          </div>
          <div className="hero-meta-row">
            <span className="hero-meta-label">Cobertura de campo</span>
            <span className="hero-meta-value">Photo · Video · Drone</span>
          </div>
          <div className="hero-meta-row">
            <span className="hero-meta-label">Status da plataforma</span>
            <span className="hero-meta-value hero-meta-live">
              <span className="pulse-dot" /> Online
            </span>
          </div>

          <div className="hero-meta-chart" aria-hidden>
            {[18, 32, 24, 41, 36, 52, 48, 64, 58, 72, 68, 80, 76, 88, 84, 94].map((h, i) => (
              <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
          <div className="hero-meta-chart-label">
            <span>Tendência de saúde do campo</span>
            <span className="mono">↗ melhorando</span>
          </div>
        </aside>
      </div>

      <div className="hero-scroll-hint" aria-hidden>
        <span className="hero-scroll-line" />
        <span>ROLAR</span>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stats band — business metrics                                              */
/* -------------------------------------------------------------------------- */

function StatsBand() {
  const stats = [
    { value: '12', unit: 'd', label: 'Detecção mais cedo', note: 'Antes dos sintomas visíveis se espalharem' },
    { value: '30', unit: '%', label: 'Produção protegida', note: 'Em campos com monitoramento ativo' },
    { value: '3×', unit: '',  label: 'Inspeção mais rápida', note: 'Comparado à vistoria manual a pé' },
    { value: '24', unit: '/7', label: 'Cobertura contínua', note: 'De qualquer dispositivo conectado' },
  ];

  return (
    <section className="stats-band">
      <div className="stats-band-inner">
        {stats.map((s, i) => (
          <div key={i} className="stat-cell" data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="stat-value">
              <span className="stat-number">{s.value}</span>
              <span className="stat-unit">{s.unit}</span>
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-note">{s.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo video section — live results                                          */
/* -------------------------------------------------------------------------- */

function DemoSection() {
  return (
    <section className="demo-section" id="demo">
      <div className="demo-inner">
        <header className="demo-header" data-reveal>
          <span className="section-marker">§ 01 — VEJA FUNCIONANDO</span>
          <h2 className="demo-heading">
            Resultados ao vivo de uma passada real no campo.
          </h2>
          <p className="demo-sub">
            Uma captura curta de um dos nossos talhões-piloto. Cada detecção abaixo é
            produzida pelo CropTrack automaticamente — sem marcação manual, sem
            pós-processamento.
          </p>
        </header>

        <div className="demo-video-wrap" data-reveal>
          <div className="demo-video-frame">
            <video
              className="demo-video"
              src="/demo.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls
            />
            <div className="demo-video-badge">
              <span className="demo-video-dot" /> ANÁLISE AO VIVO
            </div>
          </div>

          <div className="demo-video-caption">
            <div className="demo-caption-item">
              <span className="demo-caption-label">Detecção</span>
              <span className="demo-caption-value">Tempo real</span>
            </div>
            <div className="demo-caption-item">
              <span className="demo-caption-label">Cobertura</span>
              <span className="demo-caption-value">Quadro a quadro</span>
            </div>
            <div className="demo-caption-item">
              <span className="demo-caption-label">Resultado</span>
              <span className="demo-caption-value">Decisões acionáveis</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Value proposition — why CropTrack                                         */
/* -------------------------------------------------------------------------- */

const VALUE_ITEMS = [
  {
    title: 'Pegue o problema cedo',
    body: 'Identifique sinais de doença, praga e estresse antes que virem perda visível. Cada dia ganho é produção protegida.',
  },
  {
    title: 'Troque achismo por dado',
    body: 'Pare de depender de inspeção subjetiva. Embase cada decisão em evidência objetiva do campo, auditável e compartilhável.',
  },
  {
    title: 'Cubra mais, mais rápido',
    body: 'Um operador com celular ou drone mapeia milhares de plantas em minutos. Seu time foca na intervenção, não na inspeção.',
  },
  {
    title: 'Escale sem contratar',
    body: 'A plataforma cresce com a operação — de um talhão a vários — sem aumentar equipe nem complexidade.',
  },
];

function ValueSection() {
  return (
    <section className="value-section" id="value">
      <div className="value-inner">
        <div className="value-left" data-reveal>
          <span className="section-marker">§ 02 — POR QUE CROPTRACK</span>
          <h2 className="value-heading">
            Feito para quem <em>é dono da safra</em>.
          </h2>
          <p className="value-intro">
            Toda safra, o produtor toma milhares de decisões com informação incompleta.
            O CropTrack muda o que é possível — pra você tratar a planta certa, na hora
            certa, com confiança.
          </p>
        </div>
        <div className="value-right" data-reveal>
          <ul className="value-list">
            {VALUE_ITEMS.map((item, i) => (
              <li key={i} className="value-item">
                <div className="value-item-num">0{i + 1}</div>
                <div className="value-item-body">
                  <h3 className="value-item-title">{item.title}</h3>
                  <p className="value-item-text">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Process — how it works                                                     */
/* -------------------------------------------------------------------------- */

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Mapeie o talhão',
    kicker: 'Desenhe uma vez, acompanhe pra sempre.',
    body: 'Contorne cada talhão no mapa e adicione o que importa: cultura, solo, irrigação, data de plantio. Tudo o que você precisa pras métricas fica registrado de saída.',
  },
  {
    num: '02',
    title: 'Capture no campo',
    kicker: 'Celular, drone ou câmera de campo.',
    body: 'Ande uma linha, sobrevoe um talhão ou suba um lote de imagens. O CropTrack aceita foto e vídeo em qualquer resolução — sem pré-processamento manual.',
  },
  {
    num: '03',
    title: 'Veja o que importa',
    kicker: 'Avaliação de saúde automática.',
    body: 'A plataforma aponta as áreas problemáticas, conta plantas saudáveis e sinaliza anomalias — e coloca o resultado direto no mapa do seu talhão.',
  },
  {
    num: '04',
    title: 'Aja com confiança',
    kicker: 'Dashboards, alertas e relatórios.',
    body: 'Acompanhe tendências ao longo do tempo, priorize intervenções e compartilhe relatórios auditáveis com o time. Cada decisão embasada em evidência do campo.',
  },
];

function Process() {
  return (
    <section className="process-section" id="process">
      <div className="process-inner">
        <header className="process-header" data-reveal>
          <span className="section-marker section-marker-dark">§ 03 — COMO FUNCIONA</span>
          <h2 className="process-heading">Da captura à decisão, em minutos.</h2>
          <p className="process-sub">Quatro passos. Nada mais.</p>
        </header>

        <ol className="process-steps">
          {PROCESS_STEPS.map((step) => (
            <li key={step.num} className="process-step" data-reveal>
              <div className="process-step-num">
                <span>{step.num}</span>
              </div>
              <div className="process-step-body">
                <h3 className="process-step-title">{step.title}</h3>
                <p className="process-step-kicker">{step.kicker}</p>
                <p className="process-step-text">{step.body}</p>
              </div>
              <div className="process-step-rule" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Outcomes — what you get                                                    */
/* -------------------------------------------------------------------------- */

function Outcomes() {
  const outcomes = [
    {
      tag: 'Para o produtor',
      title: 'Cada planta, toda semana.',
      body: 'Monte um mapa vivo da operação. Veja a saúde evoluir ao longo do tempo e identifique as áreas que precisam de atenção imediata.',
    },
    {
      tag: 'Para o agrônomo',
      title: 'Evidência objetiva e compartilhável.',
      body: 'Quadros anotados, detecções com localização e relatórios exportáveis. Suas recomendações, embasadas em dado concreto.',
    },
    {
      tag: 'Para o operador',
      title: 'Uma ferramenta que respeita seu tempo.',
      body: 'Sem treinamento. Sem configuração complexa. Abra a plataforma, capture e aja. A interface foi feita pro campo, não pro laboratório.',
    },
  ];

  return (
    <section className="outcomes-section">
      <div className="outcomes-inner">
        <header className="outcomes-header" data-reveal>
          <span className="section-marker">§ 04 — RESULTADOS</span>
          <h2 className="outcomes-heading">
            Uma plataforma. <em>Três</em> formas de valer a pena.
          </h2>
        </header>

        <div className="outcomes-grid">
          {outcomes.map((o, i) => (
            <div key={i} className="outcome-card" data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="outcome-tag">{o.tag}</span>
              <h3 className="outcome-title">{o.title}</h3>
              <p className="outcome-body">{o.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Closing CTA                                                                */
/* -------------------------------------------------------------------------- */

function ClosingCTA() {
  return (
    <section className="cta-section">
      <div className="cta-inner" data-reveal>
        <span className="section-marker">§ 05 — COMECE AGORA</span>
        <h2 className="cta-heading">
          Seus talhões, finalmente<br />sob o seu controle.
        </h2>
        <p className="cta-sub">
          Comece a monitorar hoje. Sem instalação, sem onboarding — é só abrir a plataforma e mapear o primeiro talhão.
        </p>
        <Link to="/app" className="btn-primary btn-primary-lg">
          <span>Abrir o CropTrack</span>
          <ArrowRight />
        </Link>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                     */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-brand">
          <Mark />
          <div>
            <div className="landing-footer-wordmark">CropTrack</div>
            <div className="landing-footer-tag">Inteligência agrícola · 2026</div>
          </div>
        </div>
        <div className="landing-footer-meta">
          <span>Protegendo safras, um talhão por vez</span>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main export                                                                */
/* -------------------------------------------------------------------------- */

export default function Landing() {
  const rootRef = useReveal();

  return (
    <div className="landing" ref={rootRef}>
      <TopNav />
      <Hero />
      <StatsBand />
      <DemoSection />
      <ValueSection />
      <Process />
      <Outcomes />
      <ClosingCTA />
      <Footer />
    </div>
  );
}
