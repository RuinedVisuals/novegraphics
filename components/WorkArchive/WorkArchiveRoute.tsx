'use client';

import { useSearchParams } from 'next/navigation';
import WorkArchive, { type WorkItem } from './WorkArchive';

type Props = {
  items: WorkItem[];
  categories: string[];
  /** category slug (?category=merch) -> display label */
  labelsBySlug: Record<string, string>;
};

// Reads ?category=<slug> (set by the menu's WORK sub-menu) and opens the archive pre-filtered.
export default function WorkArchiveRoute({ items, categories, labelsBySlug }: Props) {
  const slug = useSearchParams().get('category');
  const label = slug ? labelsBySlug[slug] : undefined;

  // key: switching category from the menu while already on /projects remounts with the new filter
  return <WorkArchive key={label ?? 'ALL'} items={items} categories={categories} initialFilter={label} />;
}
