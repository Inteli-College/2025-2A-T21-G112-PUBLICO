import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const features = [
  {
    icon: '🔍',
    title: 'Detecção YOLOv8',
    description:
      '4 detectores especializados: doenças do café, multi-espécies, multi-culturas e contagem de árvores. Inferência em tempo real via API REST unificada.',
  },
  {
    icon: '🗺️',
    title: 'Mapeamento de Talhões',
    description:
      'Desenhe polígonos de talhões diretamente no mapa. Crie spots de análise georreferenciados e acompanhe a saúde do campo por área.',
  },
  {
    icon: '🎥',
    title: 'Análise de Vídeo',
    description:
      'Processe vídeos de drone frame a frame. Re-encoding em H.264 para browser, estatísticas agregadas e persistência dos resultados no dashboard.',
  },
  {
    icon: '📊',
    title: 'Dashboard Agronômico',
    description:
      'Heatmap de saúde por spot, distribuição de classes detectadas, histórico temporal e integração com dados climáticos da região.',
  },
  {
    icon: '📈',
    title: 'Roadmap de Business',
    description:
      'TAM/SAM/SOM, análise competitiva, modelo de pricing, projeções P&L e análise de impacto financeiro e ambiental documentados.',
  },
  {
    icon: '🌱',
    title: 'Impacto Real',
    description:
      'ROI estimado de 4–12× por fazenda. Redução de 40% em aplicações de fungicida. Habilitação de certificações Rainforest Alliance e UTZ.',
  },
];

const sprints = [
  {
    phase: 'tech',
    num: 'Sprint 1',
    name: 'Exploração',
    desc: 'Dataset, primeiros modelos, baseline de classificação',
    href: '/docs/sprint-1/',
  },
  {
    phase: 'tech',
    num: 'Sprint 2',
    name: 'Pipeline de Treino',
    desc: 'Modelos base, CLAHE, balanceamento de dataset',
    href: '/docs/sprint-2/em-progresso',
  },
  {
    phase: 'tech',
    num: 'Sprint 3',
    name: 'Otimização',
    desc: 'CustomCNN_SE, alta acurácia em dataset público',
    href: '/docs/sprint-3/em-progresso',
  },
  {
    phase: 'tech',
    num: 'Sprint 4',
    name: 'Integração',
    desc: 'Backend Flask, Grid Scan em imagem e vídeo',
    href: '/docs/sprint-4/em-progresso',
  },
  {
    phase: 'tech',
    num: 'Sprint 5',
    name: 'Pivot YOLOv8',
    desc: 'Detecção de objetos, mapa de talhões, plataforma de campo',
    href: '/docs/sprint-5/em-progresso',
  },
  {
    phase: 'business',
    num: 'Sprint 6',
    name: 'Planejamento',
    desc: 'Roadmap estratégico, mercado-alvo, modelo de negócio inicial',
    href: '/docs/roadmap/sprint-6',
  },
  {
    phase: 'business',
    num: 'Sprint 7',
    name: 'Análise de Mercado',
    desc: 'TAM/SAM/SOM, análise competitiva, pricing fundamentado',
    href: '/docs/roadmap/sprint-7',
  },
  {
    phase: 'business',
    num: 'Sprint 8',
    name: 'Go-to-Market',
    desc: 'Pitch deck, one-pager, case de ROI, estratégia de canal',
    href: '/docs/roadmap/sprint-8',
  },
  {
    phase: 'business',
    num: 'Sprint 9',
    name: 'Análise de Impacto',
    desc: 'Modelo financeiro, impacto ambiental, projeções P&L',
    href: '/docs/roadmap/sprint-9',
  },
  {
    phase: 'business',
    num: 'Sprint 10',
    name: 'Entrega Final',
    desc: 'Business plan, relatório de impacto, apresentação final',
    href: '/docs/roadmap/sprint-10',
  },
];

function Hero() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroEyebrow}>Inteli · Módulo XV · AgTech</div>
        <Heading as="h1" className={styles.heroTitle}>
          Crop <span className={styles.heroAccent}>Track</span>
        </Heading>
        <p className={styles.heroSubtitle}>
          Plataforma de monitoramento de campos agrícolas com detecção de doenças por visão computacional, mapeamento de talhões e análise de vídeo de drone.
        </p>
        <div className={styles.buttons}>
          <Link className={styles.btnPrimary} to="/docs/">
            Ver Documentação
          </Link>
          <Link className={styles.btnOutline} to="/docs/roadmap/visao-geral">
            Roadmap de Business
          </Link>
        </div>
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>4</span>
            <span className={styles.statLabel}>Detectores</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>10</span>
            <span className={styles.statLabel}>Sprints</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>4–12×</span>
            <span className={styles.statLabel}>ROI estimado</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>330K</span>
            <span className={styles.statLabel}>Produtores no Brasil</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Features() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <p className={styles.sectionLabel}>O que foi construído</p>
        <Heading as="h2" className={styles.sectionTitle}>
          Tecnologia e estratégia em um só projeto
        </Heading>
        <p className={styles.sectionSubtitle}>
          5 sprints técnicas entregaram a plataforma. 5 sprints de business estão documentando o caminho para o mercado.
        </p>
        <div className="row">
          {features.map((f, i) => (
            <div key={i} className="col col--4" style={{ marginBottom: '1.5rem' }}>
              <div className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <div className={styles.featureTitle}>{f.title}</div>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SprintTimeline() {
  const techSprints = sprints.filter(s => s.phase === 'tech');
  const bizSprints = sprints.filter(s => s.phase === 'business');

  return (
    <section className={styles.timelineSection}>
      <div className="container">
        <p className={styles.sectionLabel}>Cronograma</p>
        <Heading as="h2" className={styles.sectionTitle}>
          10 sprints · 20 semanas
        </Heading>
        <p className={styles.sectionSubtitle}>
          Da exploração do dataset ao business plan completo.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <p className={styles.timelinePhaseLabel}>Fase Técnica · Sprints 1–5</p>
          <div className={styles.timelineGrid}>
            {techSprints.map((s, i) => (
              <Link key={i} to={s.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={clsx(styles.sprintCard, styles.tech)}>
                  <div className={styles.sprintNum}>{s.num}</div>
                  <div className={styles.sprintName}>{s.name}</div>
                  <p className={styles.sprintDesc}>{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className={styles.timelinePhaseLabel}>Fase de Business · Sprints 6–10</p>
          <div className={styles.timelineGrid}>
            {bizSprints.map((s, i) => (
              <Link key={i} to={s.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={clsx(styles.sprintCard, styles.business)}>
                  <div className={styles.sprintNum}>{s.num}</div>
                  <div className={styles.sprintName}>{s.name}</div>
                  <p className={styles.sprintDesc}>{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Crop Track · Monitoramento Agrícola com IA"
      description="Plataforma de detecção de doenças em culturas com YOLOv8, mapeamento de talhões e análise de vídeo de drone.">
      <Hero />
      <main>
        <Features />
        <SprintTimeline />
      </main>
    </Layout>
  );
}
