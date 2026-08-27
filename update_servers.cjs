const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/tmdb.ts');
let content = fs.readFileSync(filePath, 'utf8');

const newMovieServers = `export const MOVIE_SERVERS: VideoServer[] = [
  { id: 'vidsrc_sbs', name: 'سيرفر 1', movieUrl: 'https://vidsrc.sbs/embed/movie/', tvUrl: 'https://vidsrc.sbs/embed/tv/', quality: 'HD', icon: 'star', color: '#16a085', useIdType: 'tmdb', subtitles: 'ar' },
  { id: 'vidsrc2_ru', name: 'سيرفر 2', movieUrl: 'https://vidsrc2.ru/embed/movie/', tvUrl: 'https://vidsrc2.ru/embed/tv/', quality: 'HD', icon: 'star', color: '#16a085', useIdType: 'tmdb', subtitles: 'ar' },
  { id: 'vidsrc_ir', name: 'سيرفر 3', movieUrl: 'https://vidsrc.ir/embed/movie/', tvUrl: 'https://vidsrc.ir/embed/tv/', quality: 'HD', icon: 'film', color: '#16a085', useIdType: 'tmdb', subtitles: 'ar' },
  { id: 'vidsrcme_ru', name: 'سيرفر 4', movieUrl: 'https://vidsrcme.ru/embed/movie/', tvUrl: 'https://vidsrcme.ru/embed/tv/', quality: 'HD', icon: 'film', color: '#16a085', useIdType: 'tmdb', subtitles: 'ar' },
  { id: 'vidsrcme_su', name: 'سيرفر 5', movieUrl: 'https://vidsrcme.su/embed/movie/', tvUrl: 'https://vidsrcme.su/embed/tv/', quality: 'HD', icon: 'film', color: '#e74c3c', useIdType: 'tmdb', subtitles: 'ar' },
  { id: 'vidsrc_me_ru', name: 'سيرفر 6', movieUrl: 'https://vidsrc-me.ru/embed/movie/', tvUrl: 'https://vidsrc-me.ru/embed/tv/', quality: 'HD', icon: 'video', color: '#e74c3c', useIdType: 'tmdb', subtitles: 'ar' },
  { id: 'vidsrc_me_su', name: 'سيرفر 7', movieUrl: 'https://vidsrc-me.su/embed/movie/', tvUrl: 'https://vidsrc-me.su/embed/tv/', quality: 'HD', icon: 'video', color: '#e74c3c', useIdType: 'tmdb', subtitles: 'ar' },
  { id: 'vidsrc_embed_ru', name: 'سيرفر 8', movieUrl: 'https://vidsrc-embed.ru/embed/movie/', tvUrl: 'https://vidsrc-embed.ru/embed/tv/', quality: 'HD', icon: 'globe', color: '#8e44ad', useIdType: 'tmdb', subtitles: 'ar' },
  { id: 'vidsrc_embed_su', name: 'سيرفر 9', movieUrl: 'https://vidsrc-embed.su/embed/movie/', tvUrl: 'https://vidsrc-embed.su/embed/tv/', quality: 'HD', icon: 'globe', color: '#8e44ad', useIdType: 'tmdb', subtitles: 'ar' },
  { id: 'vsrc_su', name: 'سيرفر 10', movieUrl: 'https://vsrc.su/embed/movie/', tvUrl: 'https://vsrc.su/embed/tv/', quality: 'HD', icon: 'globe', color: '#27ae60', useIdType: 'tmdb', subtitles: 'ar' }
];`;

const newTvServers = `export const TV_SERVERS: VideoServer[] = [
  { id: 'vidsrc_sbs', name: '🎬 سيرفر 1', baseUrl: 'https://vidsrc.sbs/embed/tv', quality: 'HD', icon: 'film', color: '#16a085', supportsSeasons: true, format: '{id}/{season}/{episode}' },
  { id: 'vidsrc2_ru', name: '🎬 سيرفر 2', baseUrl: 'https://vidsrc2.ru/embed/tv', quality: 'HD', icon: 'film', color: '#e74c3c', supportsSeasons: true, format: '{id}/{season}/{episode}' },
  { id: 'vidsrc_ir', name: '🎬 سيرفر 3', baseUrl: 'https://vidsrc.ir/embed/tv', quality: 'HD', icon: 'film', color: '#e74c3c', supportsSeasons: true, format: '{id}/{season}/{episode}' },
  { id: 'vidsrcme_ru', name: '🎬 سيرفر 4', baseUrl: 'https://vidsrcme.ru/embed/tv', quality: 'HD', icon: 'film', color: '#e74c3c', supportsSeasons: true, format: '{id}/{season}/{episode}' },
  { id: 'vidsrcme_su', name: '🎬 سيرفر 5', baseUrl: 'https://vidsrcme.su/embed/tv', quality: 'HD', icon: 'film', color: '#e74c3c', supportsSeasons: true, format: '{id}/{season}/{episode}' },
  { id: 'vidsrc_me_ru', name: '🎬 سيرفر 6', baseUrl: 'https://vidsrc-me.ru/embed/tv', quality: 'HD', icon: 'film', color: '#e74c3c', supportsSeasons: true, format: '{id}/{season}/{episode}' },
  { id: 'vidsrc_me_su', name: '🎬 سيرفر 7', baseUrl: 'https://vidsrc-me.su/embed/tv', quality: 'HD', icon: 'film', color: '#e74c3c', supportsSeasons: true, format: '{id}/{season}/{episode}' },
  { id: 'vidsrc_embed_ru', name: '🎬 سيرفر 8', baseUrl: 'https://vidsrc-embed.ru/embed/tv', quality: 'HD', icon: 'film', color: '#8e44ad', supportsSeasons: true, format: '{id}/{season}/{episode}' },
  { id: 'vidsrc_embed_su', name: '🎬 سيرفر 9', baseUrl: 'https://vidsrc-embed.su/embed/tv', quality: 'HD', icon: 'film', color: '#8e44ad', supportsSeasons: true, format: '{id}/{season}/{episode}' },
  { id: 'vsrc_su', name: '🎬 سيرفر 10', baseUrl: 'https://vsrc.su/embed/tv', quality: 'HD', icon: 'film', color: '#27ae60', supportsSeasons: true, format: '{id}/{season}/{episode}' }
];`;

content = content.replace(/export const MOVIE_SERVERS: VideoServer\[\] = \[[\s\S]*?\];/m, newMovieServers);
content = content.replace(/export const TV_SERVERS: VideoServer\[\] = \[[\s\S]*?\];/m, newTvServers);

// Fix the condition back so vidsrc_sbs is matched too
content = content.replace(
  /server\.id\.startsWith\('vidsrc'\) \|\| server\.id === 'vsrc_su'/g,
  "server.id === 'vidsrc_sbs' || server.id.startsWith('vidsrc') || server.id === 'vsrc_su'"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated tmdb.ts with vidsrc.sbs as primary server');
