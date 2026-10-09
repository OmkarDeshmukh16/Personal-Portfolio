import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IconSearch, IconBrandGithub, IconArrowUpRight } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectModal from '@/components/projects/ProjectModal';
import Magnetic from '@/components/core/Magnetic';
import { useGetProjects } from '@/hooks/useGetProjects';
import { resolveAssetPath } from '@/components/utils/paths';

const CATEGORY_LABELS = {
  all: 'All',
  web: 'Web',
  ai: 'AI / ML',
  mobile: 'Mobile',
  game: 'Games',
  tool: 'Tools',
};

const Projects = () => {
  const { projects } = useGetProjects();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [active, setActive] = useState(null);
  const [params, setParams] = useSearchParams();

  const ongoingProjects = useMemo(() => {
    return projects.filter(p => p.ongoing);
  }, [projects]);

  const categories = useMemo(() => {
    const set = new Set(projects.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter(p => {
      const matchCat = category === 'all' || p.category === category;
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.technologies || []).some(t => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [projects, category, search]);

  // Deep-link support: ?project=id opens the modal.
  useEffect(() => {
    const id = params.get('project');
    if (id && projects.length) {
      const found = projects.find(p => p.id === id);
      if (found) setActive(found);
    }
  }, [params, projects]);

  const openProject = project => {
    setActive(project);
    setParams({ project: project.id }, { replace: true });
  };

  const closeProject = () => {
    setActive(null);
    setParams({}, { replace: true });
  };

  return (
    <>
      <div className="aurora" aria-hidden="true" />

      <section className="section container page-top">
        <div className="page-head">
          <span className="eyebrow" data-reveal>
            Portfolio — {projects.length} projects
          </span>
          <h1 className="page-title display" data-reveal data-reveal-delay={80}>
            Selected <span className="gradient-text">work</span>
          </h1>
          <p className="page-lead" data-reveal data-reveal-delay={140}>
            A collection of things I&rsquo;ve designed, engineered, and shipped — spanning AI,
            full-stack web, computer vision, and ongoing initiatives.
          </p>
        </div>

        {/* Ongoing projects / currently working on */}
        {ongoingProjects.length > 0 && (
          <div className="ongoing-section" data-reveal>
            <div className="ongoing-section__head">
              <div className="ongoing-badge">
                <span className="ongoing-pulse" />
                <span className="ongoing-badge__text">Currently Working On</span>
              </div>
              <h2 className="ongoing-section__title display">
                Ongoing <span className="gradient-text">projects</span>
              </h2>
              <p className="ongoing-section__desc">
                Active engineering initiatives, incubation products, and platforms currently in active development.
              </p>
            </div>

            <div className="ongoing-grid">
              {ongoingProjects.map((project, idx) => (
                <article
                  key={project.id}
                  className="ongoing-card"
                  data-reveal
                  data-reveal-delay={idx * 70}
                  onClick={() => openProject(project)}
                  data-cursor-label="View"
                >
                  <div className="ongoing-card__top">
                    <div className="ongoing-card__status">
                      <span className="ongoing-pulse ongoing-pulse--sm" />
                      <span>{project.status || 'In Active Development'}</span>
                    </div>
                    <span className="tag tag--accent">{CATEGORY_LABELS[project.category] || project.category}</span>
                  </div>

                  {project.image && (
                    <div className="ongoing-card__media">
                      <img
                        src={resolveAssetPath(project.image)}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        onError={e => {
                          if (project.fallbackImage) e.currentTarget.src = project.fallbackImage;
                        }}
                      />
                      <div className="ongoing-card__shine" />
                    </div>
                  )}

                  <h3 className="ongoing-card__title">{project.title}</h3>
                  <p className="ongoing-card__desc">{project.description}</p>

                  <div className="ongoing-card__tech">
                    {project.technologies.slice(0, 4).map(tech => (
                      <span key={tech} className="ongoing-tech-pill">{tech}</span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="ongoing-tech-pill ongoing-tech-pill--more">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="ongoing-card__footer">
                    <span className="ongoing-card__action">
                      <span>Explore details & architecture</span>
                      <IconArrowUpRight size={17} />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="ongoing-divider" data-reveal>
          <div className="ongoing-divider__line" />
          <span className="ongoing-divider__text">All Projects &amp; Archives</span>
          <div className="ongoing-divider__line" />
        </div>

        <div className="filters" data-reveal>
          <div className="filters__cats">
            {categories.map(cat => (
              <button
                key={cat}
                className={`chip ${category === cat ? 'is-active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
          <div className="filters__search">
            <IconSearch size={18} />
            <input
              type="text"
              placeholder="Search projects…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length > 0 ? (
          <motion.div layout className="grid-3">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} onOpen={openProject} />
            ))}
          </motion.div>
        ) : (
          <div className="empty">
            <p>No projects match your filters.</p>
            <button
              className="btn btn--ghost"
              onClick={() => {
                setSearch('');
                setCategory('all');
              }}
            >
              <span>Reset filters</span>
            </button>
          </div>
        )}

        <div className="gh-cta" data-reveal>
          <div className="gh-cta__text">
            <IconBrandGithub size={26} className="gh-cta__icon" />
            <div>
              <h3 className="gh-cta__title">This is just a slice.</h3>
              <p className="gh-cta__sub">
                Explore the repositories, live deployments, and ongoing experiments on GitHub.
              </p>
            </div>
          </div>
          <Magnetic strength={0.35}>
            <a
              href="https://github.com/OmkarDeshmukh16"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary btn--lg"
              data-cursor-label="GitHub"
            >
              <span>See more on GitHub</span>
              <IconArrowUpRight size={19} />
            </a>
          </Magnetic>
        </div>
      </section>

      <ProjectModal project={active} onClose={closeProject} />

      <style>{`
        .page-top {
          padding-top: clamp(7rem, 14vh, 11rem);
        }
        .page-head {
          max-width: 720px;
          margin-bottom: 3rem;
        }
        .page-title {
          font-size: clamp(3rem, 11vw, 7rem);
          letter-spacing: -0.04em;
          margin-block: 1rem 1.4rem;
          line-height: 0.95;
        }
        .page-lead {
          color: var(--ink-dim);
          font-size: clamp(1rem, 2.2vw, 1.2rem);
          max-width: 56ch;
        }

        /* Ongoing Section */
        .ongoing-section {
          margin-bottom: clamp(3.5rem, 7vw, 5rem);
          padding: clamp(1.8rem, 4vw, 2.8rem);
          border-radius: var(--radius-lg);
          border: 1px solid var(--line);
          background:
            radial-gradient(90% 120% at 0% 0%, rgba(91, 233, 255, 0.08), transparent 60%),
            radial-gradient(90% 120% at 100% 100%, rgba(255, 184, 77, 0.06), transparent 60%),
            var(--bg-elev);
          position: relative;
          overflow: hidden;
        }
        .ongoing-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--cyan), transparent);
          opacity: 0.6;
        }
        .ongoing-section__head {
          margin-bottom: 2rem;
        }
        .ongoing-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.35rem 0.85rem;
          border-radius: 99px;
          background: rgba(91, 233, 255, 0.1);
          border: 1px solid rgba(91, 233, 255, 0.28);
          margin-bottom: 0.85rem;
        }
        .ongoing-badge__text {
          font-family: var(--font-mono);
          font-size: 0.74rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cyan);
          font-weight: 600;
        }
        .ongoing-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 10px var(--cyan);
          animation: ongoingPulse 2s infinite ease-in-out;
        }
        .ongoing-pulse--sm {
          width: 6px;
          height: 6px;
        }
        @keyframes ongoingPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(0.85);
          }
        }
        .ongoing-section__title {
          font-size: clamp(2rem, 5vw, 3.2rem);
          line-height: 1.05;
          margin-bottom: 0.6rem;
        }
        .ongoing-section__desc {
          color: var(--ink-dim);
          font-size: 0.98rem;
          max-width: 60ch;
          line-height: 1.6;
        }
        .ongoing-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.4rem;
        }
        .ongoing-card {
          padding: 1.6rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--line);
          background: rgba(18, 22, 34, 0.65);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          cursor: pointer;
          transition: transform 0.35s var(--ease-out), border-color 0.35s var(--ease-out), background 0.35s var(--ease-out), box-shadow 0.35s var(--ease-out);
          position: relative;
        }
        .ongoing-card:hover {
          transform: translateY(-4px);
          border-color: rgba(91, 233, 255, 0.45);
          background: rgba(22, 28, 44, 0.9);
          box-shadow: 0 16px 36px -12px rgba(0, 0, 0, 0.5), 0 0 24px -6px rgba(91, 233, 255, 0.15);
        }
        .ongoing-card__media {
          position: relative;
          width: 100%;
          height: 190px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: rgba(8, 10, 16, 0.8);
          border: 1px solid var(--line);
        }
        .ongoing-card__media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          transition: transform 0.6s var(--ease-out);
        }
        .ongoing-card:hover .ongoing-card__media img {
          transform: scale(1.05);
        }
        .ongoing-card__shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(7, 8, 13, 0.6) 100%);
          pointer-events: none;
        }
        .ongoing-card__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
        }
        .ongoing-card__status {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--cyan);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .ongoing-card__title {
          font-family: var(--font-display);
          font-size: clamp(1.2rem, 2.5vw, 1.45rem);
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.01em;
          line-height: 1.25;
        }
        .ongoing-card__desc {
          color: var(--ink-dim);
          font-size: 0.9rem;
          line-height: 1.6;
          flex-grow: 1;
        }
        .ongoing-card__tech {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .ongoing-tech-pill {
          font-family: var(--font-mono);
          font-size: 0.73rem;
          padding: 0.25rem 0.6rem;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--line);
          color: var(--ink-dim);
        }
        .ongoing-tech-pill--more {
          color: var(--amber);
          border-color: rgba(255, 184, 77, 0.25);
        }
        .ongoing-card__footer {
          padding-top: 0.6rem;
          border-top: 1px solid var(--line);
          margin-top: 0.2rem;
        }
        .ongoing-card__action {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--cyan);
          transition: gap 0.25s ease;
        }
        .ongoing-card:hover .ongoing-card__action {
          gap: 0.6rem;
          color: var(--ink);
        }
        .ongoing-divider {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          margin-bottom: 2rem;
        }
        .ongoing-divider__line {
          flex: 1;
          height: 1px;
          background: var(--line);
        }
        .ongoing-divider__text {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--ink-mute);
          white-space: nowrap;
        }
        @media (max-width: 820px) {
          .ongoing-grid {
            grid-template-columns: 1fr;
          }
        }

        .filters {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
        }
        .filters__cats {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .chip {
          padding: 0.55rem 1.1rem;
          border-radius: 99px;
          border: 1px solid var(--line);
          color: var(--ink-dim);
          font-size: 0.88rem;
          font-weight: 500;
          transition: all 0.25s ease;
        }
        .chip:hover {
          color: var(--ink);
          border-color: var(--line-strong);
        }
        .chip.is-active {
          background: var(--ink);
          color: #07080d;
          border-color: var(--ink);
        }
        .filters__search {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 1rem;
          border-radius: 99px;
          border: 1px solid var(--line);
          color: var(--ink-mute);
          min-width: 240px;
        }
        .filters__search:focus-within {
          border-color: var(--cyan);
          color: var(--cyan);
        }
        .filters__search input {
          background: none;
          border: none;
          outline: none;
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 0.92rem;
          width: 100%;
        }
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.6rem;
        }
        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.2rem;
          padding: 5rem 0;
          color: var(--ink-mute);
        }
        .gh-cta {
          margin-top: clamp(3rem, 7vw, 5rem);
          padding: clamp(1.6rem, 4vw, 2.6rem);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          background:
            radial-gradient(120% 140% at 0% 0%, rgba(91, 233, 255, 0.08), transparent 55%),
            radial-gradient(120% 140% at 100% 100%, rgba(255, 184, 77, 0.08), transparent 55%),
            var(--bg-elev);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.8rem;
          flex-wrap: wrap;
        }
        .gh-cta__text {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          max-width: 60ch;
        }
        .gh-cta__icon { color: var(--cyan); flex-shrink: 0; margin-top: 0.2rem; }
        .gh-cta__title {
          font-family: var(--font-display);
          font-size: clamp(1.3rem, 3vw, 1.8rem);
          letter-spacing: -0.01em;
          margin-bottom: 0.35rem;
        }
        .gh-cta__sub { color: var(--ink-dim); line-height: 1.55; }
        @media (max-width: 640px) {
          .gh-cta { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 980px) {
          .grid-3 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .grid-3 { grid-template-columns: 1fr; }
          .filters__search { width: 100%; }
        }
      `}</style>
    </>
  );
};

export default Projects;
