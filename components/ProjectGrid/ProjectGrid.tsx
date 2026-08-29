'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/sanity/types';
import styles from './ProjectGrid.module.scss';

const CATEGORY_LABELS: Record<string, string> = {
  'album-art': 'ALBUM ART',
  'poster':    'EVENT POSTER',
  'merch':     'MERCH',
  'branding':  'BRANDING',
};

function ProjectCard({ project, frontUrl, backUrl }: {
  project: Project;
  frontUrl: string;
  backUrl?: string;
}) {
  return (
    <Link href={`/projects/${project.slug.current}`} className={styles.card}>
      <div className={styles.flipper}>
        <div className={styles.face}>
          <Image
            src={frontUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={styles.img}
          />
          <div className={styles.faceOverlay}>
            <span className={styles.category}>
              {project.category ? CATEGORY_LABELS[project.category] : ''}
            </span>
          </div>
        </div>

        {backUrl && (
          <div className={`${styles.face} ${styles.back}`}>
            <Image
              src={backUrl}
              alt={`${project.title} — back`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.img}
            />
          </div>
        )}
      </div>

      <div className={styles.meta}>
        <h2 className={styles.title}>{project.title}</h2>
        <div className={styles.sub}>
          <span className={styles.year}>{project.year}</span>
          {project.description && (
            <p className={styles.desc}>{project.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProjectGrid({ projects, urls }: {
  projects: Project[];
  urls: { front: string; back?: string }[];
}) {
  if (projects.length === 0) {
    return (
      <div className={styles.empty}>
        <span>[ NO PROJECTS YET ]</span>
      </div>
    );
  }

  return (
    <section className={styles.grid}>
      {projects.map((project, i) => (
        <ProjectCard
          key={project._id}
          project={project}
          frontUrl={urls[i].front}
          backUrl={urls[i].back}
        />
      ))}
    </section>
  );
}
