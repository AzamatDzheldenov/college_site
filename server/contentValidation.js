import crypto from 'node:crypto'
import { pckDirections } from '../shared/pckDirections.js'
import { seedContent } from './seedContent.js'

const asText = (value, fallback = '', maxLength = 3000) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : fallback

const asArray = (value) => (Array.isArray(value) ? value : [])

const asId = (value, prefix) => {
  const text = asText(value)
  return text || `${prefix}-${crypto.randomUUID()}`
}

export function normalizeContent(input = {}) {
  const newsSource = asArray(input.news).length > 0 ? input.news : seedContent.news
  const gallerySource = asArray(input.gallery).length > 0 ? input.gallery : seedContent.gallery
  const documentsSource = asArray(input.documents).length > 0 ? input.documents : seedContent.documents

  return {
    site: normalizeSite(input.site),
    contacts: normalizeContacts(input.contacts),
    staticPages: normalizeStaticPages(input.staticPages),
    pckDirections,
    pckTeachers: normalizePckTeachers(input.pckTeachers || input.pck),
    documents: documentsSource.slice(0, 100).map(normalizeDocument),
    gallery: gallerySource.slice(0, 200).map(normalizeGalleryItem),
    news: newsSource
      .slice(0, 300)
      .map(normalizeNews)
      .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)),
  }
}

function normalizeSite(site = {}) {
  return {
    name: normalizeBi(site.name, seedContent.site.name),
    tagline: normalizeBi(site.tagline, seedContent.site.tagline),
  }
}

function normalizeContacts(contacts = {}) {
  return {
    phone: asText(contacts.phone, seedContent.contacts.phone, 80),
    whatsapp: asText(contacts.whatsapp, seedContent.contacts.whatsapp, 80),
    email: asText(contacts.email, seedContent.contacts.email, 120),
    web: asText(contacts.web, seedContent.contacts.web, 120),
    address: normalizeBi(contacts.address, seedContent.contacts.address),
    description: normalizeBi(contacts.description, seedContent.contacts.description),
  }
}

function normalizeStaticPages(staticPages = {}) {
  const home = staticPages.home || seedContent.staticPages.home
  const hero = home.hero || seedContent.staticPages.home.hero

  return {
    home: {
      hero: {
        badge: normalizeBi(hero.badge, seedContent.staticPages.home.hero.badge),
        title: normalizeBi(hero.title, seedContent.staticPages.home.hero.title),
        text: normalizeBi(hero.text, seedContent.staticPages.home.hero.text),
        primaryButton: normalizeBi(
          hero.primaryButton,
          seedContent.staticPages.home.hero.primaryButton,
        ),
        secondaryButton: normalizeBi(
          hero.secondaryButton,
          seedContent.staticPages.home.hero.secondaryButton,
        ),
        stats: asArray(hero.stats).slice(0, 4).map((item, index) => ({
          value: asText(item?.value, seedContent.staticPages.home.hero.stats[index]?.value || '', 20),
          label: normalizeBi(item?.label, seedContent.staticPages.home.hero.stats[index]?.label),
        })),
      },
      highlights: asArray(home.highlights).slice(0, 8).map((item, index) => ({
        title: normalizeBi(item?.title, seedContent.staticPages.home.highlights[index]?.title),
        text: normalizeBi(item?.text, seedContent.staticPages.home.highlights[index]?.text),
      })),
      testimonials: asArray(home.testimonials).slice(0, 12).map((item, index) => ({
        name: normalizeBi(item?.name, seedContent.staticPages.home.testimonials[index]?.name),
        program: normalizeBi(item?.program, seedContent.staticPages.home.testimonials[index]?.program),
        text: normalizeBi(item?.text, seedContent.staticPages.home.testimonials[index]?.text),
      })),
    },
  }
}

function normalizePckTeachers(value) {
  const incoming = asArray(value)

  return pckDirections.map((direction) => {
    const existing = incoming.find((item) => item?.slug === direction.slug)
    const legacy = incoming.find((item) => item?.slug === direction.slug)?.teachers || []

    return {
      slug: direction.slug,
      teachers: asArray(existing?.teachers || legacy).slice(0, 80).map((teacher) => ({
        photo: normalizeFile(teacher?.photo, ['image']),
        fullName: normalizeBi(teacher?.fullName || teacher?.name),
        position: normalizeBi(teacher?.position),
      })),
    }
  })
}

function normalizeDocument(item = {}) {
  return {
    id: asId(item.id, 'doc'),
    title: normalizeBi(item.title),
    description: normalizeBi(item.description),
    file: normalizeFile(item.file || (item.url ? { url: item.url, name: item.title?.ru || item.title } : null), [
      'document',
    ]),
  }
}

function normalizeGalleryItem(item = {}) {
  return {
    id: asId(item.id, 'gallery'),
    caption: normalizeBi(item.caption),
    photo: normalizeFile(item.photo, ['image']),
    createdAt: normalizeDateTime(item.createdAt),
  }
}

function normalizeNews(item = {}) {
  return {
    id: asId(item.id, 'news'),
    title: normalizeBi(item.title),
    text: normalizeBi(item.text),
    publishedAt: normalizeDate(item.publishedAt || item.date),
    photos: asArray(item.photos).slice(0, 12).map((file) => normalizeFile(file, ['image'])).filter(Boolean),
    videos: asArray(item.videos).slice(0, 6).map((file) => normalizeVideo(file)).filter(Boolean),
    createdAt: normalizeDateTime(item.createdAt),
  }
}

function normalizeBi(value, fallback = { ru: '', ky: '' }) {
  if (typeof value === 'string') {
    return { ru: asText(value), ky: '' }
  }

  return {
    ru: asText(value?.ru, fallback?.ru || ''),
    ky: asText(value?.ky, fallback?.ky || ''),
  }
}

function normalizeFile(value, types = []) {
  if (!value || typeof value !== 'object') {
    return null
  }

  const url = asText(value.url, '', 1000)
  const name = asText(value.name, 'Файл', 255)
  const type = asText(value.type, types[0] || 'file', 40)
  const mimeType = asText(value.mimeType, '', 120)
  const size = Number.isFinite(Number(value.size)) ? Number(value.size) : null

  if (!url || (types.length && !types.includes(type))) {
    return null
  }

  return { url, name, type, mimeType, size }
}

function normalizeVideo(value) {
  if (!value || typeof value !== 'object') {
    return null
  }

  if (value.type === 'external') {
    const url = asText(value.url, '', 1000)
    return url
      ? {
          url,
          name: asText(value.name, 'Видео', 255),
          type: 'external',
          mimeType: '',
          size: null,
        }
      : null
  }

  return normalizeFile(value, ['video'])
}

function normalizeDate(value) {
  const text = asText(value, '')
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : new Date().toISOString().slice(0, 10)
}

function normalizeDateTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}
