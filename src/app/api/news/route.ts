import Parser from 'rss-parser';
import { NextResponse } from 'next/server';

const parser = new Parser({
    customFields: {
        item: ['media:content'],
    }
});

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        // Yahoo Finance generic financial news
        const feed = await parser.parseURL('https://finance.yahoo.com/news/rssindex');

        const articles = feed.items.slice(0, 5).map(item => {
            // Extract image if available in media:content
            let imageUrl = null;
            if (item['media:content'] && item['media:content'].$) {
                imageUrl = item['media:content'].$.url;
            }

            return {
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                contentSnippet: item.contentSnippet,
                imageUrl,
                source: "Yahoo Finance"
            };
        });

        return NextResponse.json(articles);
    } catch (error) {
        console.error("RSS Fetch Error:", error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
