#!/usr/bin/env node

/**
 * Generate sitemap.xml for the weather comparison app
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

const baseUrl = 'https://YourCrush.github.io/weather-compare';
const currentDate = new Date().toISOString().split('T')[0];

// Define the routes in the application
const routes = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'daily',
    lastmod: currentDate,
  },
  {
    path: '/summary',
    priority: '0.9',
    changefreq: 'daily',
    lastmod: currentDate,
  },
  {
    path: '/cards',
    priority: '0.9',
    changefreq: 'daily',
    lastmod: currentDate,
  },
  {
    path: '/charts',
    priority: '0.9',
    changefreq: 'daily',
    lastmod: currentDate,
  },
  {
    path: '/seasonal',
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: currentDate,
  },
];

// Generate sitemap XML
const generateSitemap = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    route => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return sitemap;
};

// Write sitemap to public directory
const sitemapPath = resolve(process.cwd(), 'public', 'sitemap.xml');
const sitemapContent = generateSitemap();

try {
  writeFileSync(sitemapPath, sitemapContent, 'utf8');
  console.log('✅ Sitemap generated successfully at:', sitemapPath);
  console.log(`📊 Generated ${routes.length} URLs`);
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}