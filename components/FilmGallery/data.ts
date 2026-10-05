export interface Film {
  id: string;
  slug: string;
  title: string;
  subTitle: string;
  year: string;
  category: string;
  image: string;
  spine?: string;
  back?: string;
  accent: string;
  description: string;
}

// VHS spine proportions (width / height). Spine uploads should be 400 × 3000 px.
export const SPINE_W = 400;
export const SPINE_H = 3000;
export const SPINE_ASPECT = SPINE_W / SPINE_H;
