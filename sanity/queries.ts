import { groq } from 'next-sanity'

// Archive order: manual `order` first, then newest.
export const PROJECT_ORDER = 'order(coalesce(order, 9999) asc, year desc)'

export const projectListQuery = groq`
  *[_type == "project"] | ${PROJECT_ORDER} {
    _id,
    title,
    slug { current },
    year,
    category,
    client,
    frontImage,
  }
`

export const projectQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug { current },
    year,
    category,
    description,
    client,
    role,
    frontImage,
    backImage,
    spineImage,
    heroImage,
    "heroVideoUrl": heroVideo.asset->url,
    brief,
    body,
    accent,
    gallery,
    process,
    credits,
  }
`
