import React, { useEffect, useState } from 'react';
import profile from '../data/profile.json';
import publications from '../data/publications.json';

const NAME = profile.name;

function externalUrl(url) {
  if (!url?.startsWith('https://')) throw new Error(`External URL must use HTTPS: ${url}`);
  return url;
}

function paperUrl(paper) {
  if (paper.doi) return externalUrl(`https://doi.org/${paper.doi}`);
  return paper.url ? externalUrl(paper.url) : null;
}

function Authors({ text }) {
  return text.split(/(SoYeop Yoo)/g).map((part, i) =>
    part === NAME ? <strong key={i}>{part}</strong> : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

function PaperLink({ paper }) {
  const url = paperUrl(paper);
  return url && <a className="paper-link" href={url} target="_blank" rel="noopener noreferrer">Paper <span aria-hidden="true">↗</span></a>;
}

function PublicationKind({ paper }) {
  const kind = paper.type === 'conference' ? 'Conference paper' : paper.scope === 'korean' ? 'Korean journal' : 'Journal article';
  return <span className={`publication-kind-label${paper.type === 'conference' ? ' publication-kind-conference' : ''}`}>{kind}</span>;
}

function PublicationVenue({ paper, short = false }) {
  const index = paper.index && paper.index !== 'Other' ? paper.index : null;
  return <p className="publication-venue">{short ? paper.short_venue || paper.venue : <em>{paper.venue}</em>}{index && ` · ${index}`}</p>;
}

function ProfileRail({ page }) {
  const [theme, setTheme] = useState('light');
  const [copyLabel, setCopyLabel] = useState('Copy');
  useEffect(() => {
    try { setTheme(localStorage.getItem('cv-theme') === 'dark' ? 'dark' : 'light'); } catch { /* storage may be disabled */ }
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('cv-theme', next); } catch { /* storage may be disabled */ }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(`${profile.email_local}@${profile.email_domain}`);
      setCopyLabel('Copied');
    } catch { setCopyLabel('Select text'); }
    window.setTimeout(() => setCopyLabel('Copy'), 1800);
  }

  const [firstName, lastName] = NAME.split(' ');
  const nav = [['index', 'About'], ['publications', 'Publications'], ['cv', 'CV']];
  return <aside className="profile-rail" aria-label="Researcher profile and navigation">
    <div className="profile-inner">
      <a className="identity" href="./index.html" aria-label={`${NAME} home`}>
        <span className="identity-rule" aria-hidden="true" />
        <span className="identity-kicker">RESEARCH PROFILE</span>
        <span className="identity-name"><span>{firstName}</span> <span>{lastName}<span className="accent-dot">.</span></span></span>
      </a>
      <p className="profile-role">{profile.role}</p>
      <p className="profile-unit">{profile.research_unit}</p>
      <p className="profile-affiliation">{profile.affiliation}</p>
      <p className="profile-location">{profile.location}</p>
      <div className="profile-links" aria-label="External research profiles">
        {profile.links.map(link => <a key={link.label} href={externalUrl(link.url)} target="_blank" rel="noopener noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}
      </div>
      <div className="profile-email">
        <span className="email-text">{profile.email_local} <span>[at]</span> {profile.email_domain}</span>
        <button className="copy-email" type="button" onClick={copyEmail} aria-label="Copy email address">{copyLabel}</button>
      </div>
      <nav className="primary-nav" aria-label="Main navigation">
        {nav.map(([target, label]) => <a key={target} className={page === target ? 'current' : undefined} aria-current={page === target ? 'page' : undefined} href={`./${target}.html`}>{label}</a>)}
      </nav>
      <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'dark'}><span className="theme-glyph" aria-hidden="true">◐</span> <span className="theme-label">{theme === 'dark' ? 'Light' : 'Dark'} mode</span></button>
    </div>
  </aside>;
}

function SectionHeading({ number, title, id }) {
  return <div className="section-heading"><span>{number}</span><h2 id={id}>{title}</h2></div>;
}

function Footer({ href, label }) {
  return <footer className="page-footer"><span suppressHydrationWarning>© {new Date().getFullYear()} {NAME}</span><a href={href}>{label} <span aria-hidden="true">→</span></a></footer>;
}

function Home() {
  const news = [...profile.news].sort((a, b) => b.date.localeCompare(a.date));
  const newsYears = [...new Set(news.map(item => item.date.slice(0, 4)))];
  return <>
    <section className="opening" aria-labelledby="opening-title">
      <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" /> AI RESEARCH · TOKYO, JAPAN</p>
      <h1 id="opening-title">About</h1>
      <p className="opening-lead">{profile.tagline}</p>
      <p className="opening-copy">{profile.bio}</p>
    </section>

    <section className="content-section news-section" aria-labelledby="news-title">
      <SectionHeading number="01" title="News" id="news-title" />
      {newsYears.map(year => <div className="news-year-group" key={year}>
        <h3>{year}</h3>
        <ol className="news-list">{news.filter(item => item.date.startsWith(year)).map(item => {
          const month = new Date(`${item.date}-01T00:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
          const paper = item.paper_id && publications.find(publication => publication.id === item.paper_id);
          const url = paper && paperUrl(paper);
          return <li className="news-item" key={`${item.date}-${item.paper_id || item.text}`}><time className="news-date" dateTime={`${item.date}-01`}>{month}</time><span className="news-marker" aria-hidden="true" /><p>{item.text}{paper && <> {url ? <a className="news-paper-link" href={url} target="_blank" rel="noopener noreferrer">{paper.title}</a> : <strong>{paper.title}</strong>}.</>}</p></li>;
        })}</ol>
      </div>)}
    </section>

    <section className="content-section" aria-labelledby="research-title">
      <SectionHeading number="02" title="Research directions" id="research-title" />
      <div className="research-list">{profile.research.map((item, i) => <article className="research-item" key={item.title}><span className="research-number">{String(i + 1).padStart(2, '0')}</span><div><h3>{item.title}</h3><p>{item.description}</p><span className="research-terms">{item.terms}</span></div></article>)}</div>
    </section>

    <section className="content-section" aria-labelledby="selected-title">
      <SectionHeading number="03" title="Selected papers" id="selected-title" />
      <div className="publication-list selected-list">{publications.filter(paper => paper.selected).map(paper => <article className="publication-item" key={paper.id}>
        <span className="publication-year">{paper.year}</span>
        <div className="publication-info"><PublicationKind paper={paper} /><h3>{paper.title}</h3><p className="publication-authors"><Authors text={paper.authors} /></p><PublicationVenue paper={paper} short /><PaperLink paper={paper} /></div>
      </article>)}</div>
      <a className="all-publications-cta" href="./publications.html"><span>View all {publications.length} publications</span><span aria-hidden="true">→</span></a>
    </section>
    <Footer href="./cv.html" label="View CV" />
  </>;
}

function Publications() {
  const byYear = Object.groupBy ? Object.groupBy(publications, paper => paper.year) : publications.reduce((groups, paper) => { (groups[paper.year] ||= []).push(paper); return groups; }, {});
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));
  return <>
    <header className="page-opening"><p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" /> RESEARCH OUTPUTS</p><h1>Publications</h1><p>Research publications, organized by year. Selected work is highlighted on the home page.</p></header>
    <div className="all-publications">{years.map(year => <section className="publication-year-group" aria-labelledby={`pub-year-${year}`} key={year}>
      <h2 id={`pub-year-${year}`}>{year}</h2>
      <div className="publication-year-entries">{byYear[year].map(paper => <article className="full-publication" key={paper.id}>
        <PublicationKind paper={paper} />
        <h3>{paper.title}</h3>
        <p className="publication-authors"><Authors text={paper.authors} /></p>
        <PublicationVenue paper={paper} />
        <PaperLink paper={paper} />
      </article>)}</div>
    </section>)}</div>
    <Footer href="./index.html" label="Back to profile" />
  </>;
}

function CvRow({ period, title, unit, detail, description, advisor }) {
  return <div className="cv-row"><span className="cv-period">{period}</span><div><h3>{title}</h3>{unit && <p>{unit}</p>}{detail && <p>{detail}</p>}{description && <p className="cv-detail">{description}</p>}{advisor && <p className="cv-advisor">Advised by {advisor}</p>}</div></div>;
}

function CvSection({ number, title, id, children }) {
  return <section className="cv-section" aria-labelledby={id}><SectionHeading number={number} title={title} id={id} />{children}</section>;
}

function Cv() {
  return <>
    <header className="page-opening"><p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" /> ACADEMIC BACKGROUND</p><h1>Curriculum vitae</h1><p>Research appointments, education, selected projects, teaching, and awards.</p></header>
    <CvSection number="01" title="Experience" id="experience-title">{profile.experience.map(item => <CvRow key={`${item.period}-${item.role}`} period={item.period} title={item.role} unit={item.unit} detail={`${item.organization} · ${item.location}`} description={item.description} />)}</CvSection>
    <CvSection number="02" title="Education" id="education-title">{profile.education.map(item => <CvRow key={item.degree} period={item.period} title={item.degree} detail={item.institution} description={item.detail} advisor={item.advisor} />)}</CvSection>
    <CvSection number="03" title="Selected projects" id="projects-title">{profile.projects.map(item => <CvRow key={item.title} period={item.period} title={item.title} detail={`${item.role} · ${item.funder}`} />)}</CvSection>
    <CvSection number="04" title="Teaching" id="teaching-title"><p className="cv-prose">Courses taught at Gachon University include {profile.teaching.join(', ')}.</p></CvSection>
    <CvSection number="05" title="Awards" id="awards-title">{profile.awards.map(item => <CvRow key={item.title} period={item.year} title={item.title} />)}</CvSection>
    <Footer href="./publications.html" label="View publications" />
  </>;
}

export default function App({ page }) {
  const content = page === 'publications' ? <Publications /> : page === 'cv' ? <Cv /> : <Home />;
  return <div className="site-shell"><ProfileRail page={page} /><main id="main" className="main-content">{content}</main></div>;
}
