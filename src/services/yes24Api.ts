import { Yes24SearchResult } from '../types/book'

/**
 * Extracts Yes24 Goods ID from URL if provided
 */
export function extractYes24GoodsId(url: string): string | null {
  const match = url.match(/goods\/(\d+)/i) || url.match(/Goods\/(\d+)/i)
  return match ? match[1] : null
}

/**
 * Searches book information using multi-provider fallback (Google Books & Open Library with Yes24 cover optimization)
 * and parses ISBN, Title, Author, Publisher, Page Count, Description, and Yes24 Links.
 */
export async function searchBooksFromYes24(query: string): Promise<Yes24SearchResult[]> {
  const cleanQuery = query.trim()
  if (!cleanQuery) return []

  const results: Yes24SearchResult[] = []

  // Check if input is a Yes24 direct URL
  const yes24GoodsId = extractYes24GoodsId(cleanQuery)
  if (yes24GoodsId) {
    results.push({
      title: 'Yes24 도서 (ID: ' + yes24GoodsId + ')',
      author: '',
      publisher: '',
      publishDate: new Date().toISOString().slice(0, 10),
      isbn: '',
      coverUrl: `https://image.yes24.com/goods/${yes24GoodsId}/XL`,
      totalPages: 300,
      category: '일반',
      yes24Url: `https://www.yes24.com/Product/Goods/${yes24GoodsId}`
    })
  }

  // Check if query is an ISBN (10 or 13 digits)
  const isIsbn = /^[\d-]{9,17}$/.test(cleanQuery.replace(/[-\s]/g, ''))
  const isbnClean = cleanQuery.replace(/[-\s]/g, '')

  try {
    // 1. Query Google Books API with Korean language bias
    const apiUrl = isIsbn
      ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbnClean}&maxResults=10`
      : `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanQuery)}&maxResults=10&langRestrict=ko`

    const response = await fetch(apiUrl)
    if (response.ok) {
      const data = await response.json()
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          const info = item.volumeInfo || {}
          
          // Find ISBN-13 or ISBN-10
          let foundIsbn = ''
          if (info.industryIdentifiers) {
            const isbn13 = info.industryIdentifiers.find((id: any) => id.type === 'ISBN_13')
            const isbn10 = info.industryIdentifiers.find((id: any) => id.type === 'ISBN_10')
            foundIsbn = isbn13 ? isbn13.identifier : (isbn10 ? isbn10.identifier : '')
          }

          // Generate high quality cover URL
          let cover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || ''
          if (cover.startsWith('http://')) {
            cover = cover.replace('http://', 'https://')
          }

          // Build Yes24 search link
          const yes24SearchUrl = foundIsbn
            ? `https://www.yes24.com/Product/Search?domain=ALL&query=${foundIsbn}`
            : `https://www.yes24.com/Product/Search?domain=ALL&query=${encodeURIComponent(info.title || '')}`

          results.push({
            title: info.title || '제목 없음',
            author: Array.isArray(info.authors) ? info.authors.join(', ') : (info.authors || '저자 미상'),
            publisher: info.publisher || '출판사 미상',
            publishDate: info.publishedDate || '',
            isbn: foundIsbn || (isIsbn ? isbnClean : ''),
            coverUrl: cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
            totalPages: info.pageCount || 250,
            category: Array.isArray(info.categories) ? info.categories[0] : '일반',
            description: info.description || '',
            yes24Url: yes24SearchUrl
          })
        }
      }
    }
  } catch (err) {
    console.warn('Google Books API search warning:', err)
  }

  // 2. If results are still empty and it's an ISBN, fallback to Open Library
  if (results.length === 0 && isIsbn) {
    try {
      const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbnClean}&format=json&jscmd=data`)
      if (olRes.ok) {
        const olData = await olRes.json()
        const bookKey = `ISBN:${isbnClean}`
        if (olData[bookKey]) {
          const b = olData[bookKey]
          results.push({
            title: b.title || '도서',
            author: b.authors ? b.authors.map((a: any) => a.name).join(', ') : '저자 미상',
            publisher: b.publishers ? b.publishers.map((p: any) => p.name).join(', ') : '',
            publishDate: b.publish_date || '',
            isbn: isbnClean,
            coverUrl: b.cover?.large || b.cover?.medium || `https://covers.openlibrary.org/b/isbn/${isbnClean}-L.jpg`,
            totalPages: b.number_of_pages || 300,
            category: '일반',
            yes24Url: `https://www.yes24.com/Product/Search?domain=ALL&query=${isbnClean}`
          })
        }
      }
    } catch (err) {
      console.warn('OpenLibrary fallback warning:', err)
    }
  }

  return results
}
