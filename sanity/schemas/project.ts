import { defineField, defineType } from 'sanity'

export const projectSchema = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Album Art', value: 'album-art' },
          { title: 'Event Poster', value: 'poster' },
          { title: 'Merch', value: 'merch' },
          { title: 'Branding', value: 'branding' },
        ],
      },
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Position in the archive and for prev/next links (lower first).',
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g. ART DIRECTION · TYPE',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'frontImage',
      title: 'Front Image',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'backImage',
      title: 'Back Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'spineImage',
      title: 'Spine Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Full-bleed project hero. Falls back to the front image.',
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero Video',
      type: 'file',
      options: { accept: 'video/*' },
    }),
    defineField({
      name: 'brief',
      title: 'Brief statement',
      type: 'text',
      rows: 3,
      description: 'Big statement on the project page. Use " / " to split it into tone steps.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'text', rows: 4 }],
      validation: (r) => r.max(2),
      description: 'Up to two paragraphs shown under the brief.',
    }),
    defineField({
      name: 'accent',
      title: 'Accent line',
      type: 'string',
      description: 'Short italic line appended to the last paragraph.',
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'galleryItem',
          fields: [
            defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, validation: (r) => r.required() }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
            defineField({
              name: 'layout',
              title: 'Layout',
              type: 'string',
              options: { list: ['wide', 'tall', 'square'] },
            }),
          ],
          preview: { select: { title: 'caption', media: 'image' } },
        },
      ],
      validation: (r) => r.max(7),
      description: 'Frames 1–6 fill the editorial grid; frame 7 sits tilted under frame 1.',
    }),
    defineField({
      name: 'process',
      title: 'Process (contact sheet)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'credits',
      title: 'Credits',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'credit',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'value', title: 'Value', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'year',
      media: 'frontImage',
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? String(subtitle) : '',
        media,
      }
    },
  },
})
