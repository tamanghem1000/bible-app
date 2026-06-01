export default async function handler(req, res) {
  let { book, chapter } = req.query;
  
  if (!book || !chapter) {
    return res.status(400).json({ error: 'Book and chapter are required' });
  }

  // Normalize book names for universal API routing if needed
  // e.g., "John" -> "john", "1 John" -> "1john"
  const normalizedBook = book.toLowerCase().replace(/\s+/g, '');

  try {
    // 1. Fetch English (KJV) from bible-api.com
    const enUrl = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=kjv`;
    
    // 2. Fetch Nepali from an open-source raw JSON Bible API mirror (e.g., modular bibles)
    // Most public mirrors use standardized book abbreviations or numbers (e.g., 'jhn' for John)
    // For a highly reliable open API fallback, we map or fetch from a public multi-language raw engine:
    const neUrl = `https://cdn.jsdelivr.net/gh/ayushsubedi/nepali-bible-json@master/database/${normalizedBook}/${chapter}.json`;

    // Fetch both in parallel to keep your Vercel function blazing fast
    const [enResponse, neResponse] = await Promise.allSettled([
      fetch(enUrl).then(res => res.ok ? res.json() : null),
      fetch(neUrl).then(res => res.ok ? res.json() : null)
    ]);

    const enData = enResponse.status === 'fulfilled' ? enResponse.value : null;
    const neData = neResponse.status === 'fulfilled' ? neResponse.value : null;

    if (!enData && !neData) {
      throw new Error('Failed to fetch from both English and Nepali translation sources.');
    }

    // 3. Zip/Merge the verses together by verse number
    const totalVerses = Math.max(
      enData?.verses?.length || 0, 
      neData?.verses?.length || Object.keys(neData || {}).length || 0
    );

    const parallelVerses = [];

    for (let i = 0; i < totalVerses; i++) {
      // bible-api.com uses array elements
      const enVerse = enData?.verses?.[i];
      
      // Handle varying structure of open-source Nepali JSON formats 
      // (Some use arrays, some use object keys like {"1": "text"})
      let neVerseText = "";
      if (neData) {
        if (Array.isArray(neData)) {
          neVerseText = neData[i]?.text || neData[i];
        } else {
          neVerseText = neData[i + 1] || neData[String(i + 1)]; // 1-indexed verse keys
        }
      }

      parallelVerses.push({
        verse: enVerse?.verse || (i + 1),
        text_en: enVerse?.text?.trim() || "Translation unavailable",
        text_ne: neVerseText?.trim() || "अनुवाद उपलब्ध छैन"
      });
    }

    // Return the combined parallel payload
    return res.status(200).json({
      book: book,
      chapter: parseInt(chapter),
      translations: {
        english: "King James Version (KJV)",
        nepali: "Nepali Bible"
      },
      verses: parallelVerses
    });

  } catch (e) {
    return res.status(500).json({ error: 'Failed to stitch translations', message: e.message });
  }
}