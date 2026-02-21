const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DATA_FILES = [
    path.join(__dirname, 'movie.data.json'),
    path.join(__dirname, 'dist', 'movies_data.json'),
    path.join(__dirname, 'movies_data.json')
];
const PROGRESS_FILE = path.join(__dirname, 'progress.json');
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
const TEST_LIMIT = process.env.TEST_LIMIT ? parseInt(process.env.TEST_LIMIT) : null;

// Ensure downloads directory exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR);
}

async function run() {
    // Load data
    let movies = [];
    let found = false;
    for (const file of DATA_FILES) {
        if (fs.existsSync(file)) {
            movies = JSON.parse(fs.readFileSync(file, 'utf-8'));
            console.log(`Loaded data from: ${file}`);
            found = true;
            break;
        }
    }
    if (!found) {
        console.error(`None of these data files found: ${DATA_FILES.join(', ')}`);
        return;
    }

    // Load progress
    let progress = { done: [] };
    if (fs.existsSync(PROGRESS_FILE)) {
        progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }

    const browser = await chromium.launch({
        headless: false,
        slowMo: 300
    });

    const context = await browser.newContext({
        acceptDownloads: true,
        viewport: { width: 1280, height: 720 }
    });

    let processedCount = 0;
    for (const item of movies) {
        if (TEST_LIMIT && processedCount >= TEST_LIMIT) {
            console.log(`Reached TEST_LIMIT: ${TEST_LIMIT}`);
            break;
        }

        if (progress.done.includes(item.id)) {
            console.log(`Skipping already downloaded item: ${item.id} (${item.title_en})`);
            continue;
        }

        console.log(`Processing: ${item.id} - ${item.title_en}`);

        const page = await context.newPage();

        // Build URL
        let url = '';
        if (item.type === 'movie') {
            url = `https://vidsrcme.su/movie/${item.id}`;
        } else {
            const season = item.season || 1;
            const episode = item.episode || 1;
            url = `https://vidsrcme.su/tv/${item.id}/${season}/${episode}`;
        }

        try {
            console.log(`Navigating to: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

            // 1. Click Play Button
            const playButtonSelectors = [
                '.play-button',
                '.jw-icon-playback',
                '.plyr__control--overlaid',
                'button[data-plyr="play"]',
                '.vjs-big-play-button',
                'video'
            ];

            let clicked = false;
            for (const selector of playButtonSelectors) {
                try {
                    const btn = page.locator(selector).first();
                    if (await btn.isVisible()) {
                        await btn.click();
                        console.log(`Clicked play button with selector: ${selector}`);
                        clicked = true;
                        break;
                    }
                } catch (e) { }
            }

            if (!clicked) {
                // Try clicking the center of the page if no button found
                await page.mouse.click(640, 360);
                console.log('No play button found, clicked center of page.');
            }

            // 2. Select Arabic (Audio/Subtitle)
            await page.waitForTimeout(5000); // Wait for player to load menus

            const selectArabic = async () => {
                return await page.evaluate(() => {
                    const arKeywords = ['Arabic', 'العربية', 'ar'];
                    const elements = Array.from(document.querySelectorAll('*'));
                    for (const el of elements) {
                        const attrText = (el.getAttribute('data-language') || el.getAttribute('lang') || '').toLowerCase();
                        const text = (el.innerText || '').toLowerCase();
                        if (arKeywords.some(k => attrText.includes(k) || text.includes(k))) {
                            if (typeof el.click === 'function') {
                                el.click();
                                return true;
                            }
                        }
                    }

                    // Fallback: Try setting textTracks
                    const videos = document.querySelectorAll('video');
                    for (const video of videos) {
                        if (video.textTracks) {
                            for (let i = 0; i < video.textTracks.length; i++) {
                                const track = video.textTracks[i];
                                if (track.language && track.language.includes('ar')) {
                                    track.mode = 'showing';
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                });
            };

            const arFound = await selectArabic();
            if (!arFound) {
                console.log('Arabic option not found directly, trying to open settings...');
                await page.keyboard.press('s'); // Common shortcut for settings
                await page.waitForTimeout(2000);
                await selectArabic();
            }

            // 3. Network Interception for Video Links
            console.log('Monitoring network for video links...');
            let videoFound = false;
            const videoRegex = /\.(mp4|mkv|m3u8|ts|webm)|(cdn.*video)/i;

            const downloadPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    resolve({ status: 'no_video_found' });
                }, 60000);

                page.on('request', request => {
                    const reqUrl = request.url();
                    if (videoRegex.test(reqUrl)) {
                        console.log(`Detected video link: ${reqUrl}`);
                        videoFound = true;
                        // Trigger download by injecting an anchor tag
                        page.evaluate((vUrl) => {
                            const a = document.createElement('a');
                            a.href = vUrl;
                            a.download = '';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }, reqUrl).catch(e => console.error('Inject error:', e));
                    }
                });

                page.on('download', async (download) => {
                    clearTimeout(timeout);
                    const suggestedName = download.suggestedFilename();
                    const filePath = path.join(DOWNLOADS_DIR, `${item.id}_${suggestedName}`);
                    console.log(`Starting download: ${suggestedName}`);
                    await download.saveAs(filePath);
                    console.log(`Download completed: ${filePath}`);
                    resolve({ status: 'success' });
                });
            });

            const result = await downloadPromise;

            if (result.status === 'success') {
                progress.done.push(item.id);
                fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
                console.log(`Added ${item.id} to progress.json`);
                processedCount++;
            } else {
                console.log(`Result: ${result.status} for ${item.id}`);
            }

            await page.close();
            await page.waitForTimeout(3000); // Wait 3 seconds per requirements

        } catch (error) {
            console.error(`Error processing ${item.id}:`, error);
            await page.close().catch(() => { });
        }
    }

    await browser.close();
    console.log('Done.');
}

run();
