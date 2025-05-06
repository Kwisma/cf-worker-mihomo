import fs from 'fs/promises';
import fetch from 'node-fetch';
import { URL } from 'url';
import path from 'path';

const TrackerPath = 'rules/mihomo/Tracker';

const ipv4Regex = /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
const ipv6Regex = /^([a-fA-F0-9:]+:+)+[a-fA-F0-9]+$/;

const urlList = [
	'https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all.txt',
	'https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all_http.txt',
	'https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all_https.txt',
	'https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all_i2p.txt',
	'https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all_ip.txt',
	'https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all_udp.txt',
	'https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all_ws.txt',
	'https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_best.txt',
	'https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_best_ip.txt',
	'https://raw.githubusercontent.com/XIU2/TrackersListCollection/master/all.txt',
	'https://raw.githubusercontent.com/XIU2/TrackersListCollection/master/best.txt',
	'https://raw.githubusercontent.com/XIU2/TrackersListCollection/master/http.txt',
	'https://raw.githubusercontent.com/XIU2/TrackersListCollection/master/nohttp.txt',
	'https://raw.githubusercontent.com/XIU2/TrackersListCollection/master/other.txt',
	'https://raw.githubusercontent.com/DeSireFire/animeTrackerList/master/AT_best.txt',
	'https://raw.githubusercontent.com/DeSireFire/animeTrackerList/master/AT_all.txt',
	'https://raw.githubusercontent.com/DeSireFire/animeTrackerList/master/AT_all_udp.txt',
	'https://raw.githubusercontent.com/DeSireFire/animeTrackerList/master/ATline_all_http.txt',
	'https://raw.githubusercontent.com/DeSireFire/animeTrackerList/master/ATline_all_https.txt',
	'https://raw.githubusercontent.com/DeSireFire/animeTrackerList/master/ATline_all_ws.txt',
	'https://raw.githubusercontent.com/DeSireFire/animeTrackerList/master/ATline_best_ip.txt',
	'https://raw.githubusercontent.com/DeSireFire/animeTrackerList/master/ATline_all_ip.txt',
	'https://raw.githubusercontent.com/DeSireFire/animeTrackerList/master/ATline_bad.txt',
	'https://raw.githubusercontent.com/hezhijie0327/Trackerslist/refs/heads/main/trackerslist_combine.txt',
	'https://raw.githubusercontent.com/hezhijie0327/Trackerslist/refs/heads/main/trackerslist_exclude.txt',
	'https://raw.githubusercontent.com/hezhijie0327/Trackerslist/refs/heads/main/trackerslist_tracker.txt',
	'https://newtrackon.com/api/stable',
	'https://newtrackon.com/api/live',
	'https://newtrackon.com/api/udp',
	'https://newtrackon.com/api/http',
	'https://newtrackon.com/api/all',
	'https://trackers.run/s/wp_ws_up_hp_hs_v4_v6.txt',
	'https://raw.githubusercontent.com/1265578519/OpenTracker/refs/heads/master/tracker.txt',
];

const domainSet = new Set();
const ipSet = new Set();
const urlSet = new Set();

const shortenDomain = (domain) => {
	const parts = domain.split('.');
	return parts.length > 2 ? `+.${parts.slice(-2).join('.')}` : `+.${domain}`;
};

const handleLine = (line) => {
	const trimmed = line.trim();
	if (!trimmed || trimmed.startsWith('#')) return;

	if (/^- *(DOMAIN(-SUFFIX)?),/.test(trimmed)) {
		const domain = trimmed.split(',')[1]?.trim();
		if (domain) domainSet.add(shortenDomain(domain));
		return;
	}

	if (/^- *IP-CIDR,/.test(trimmed)) {
		const cidr = trimmed.split(',')[1]?.trim();
		const ip = cidr?.split('/')[0];
		if (ip) ipSet.add(`${ip}/32`);
		return;
	}

	try {
		const parsed = new URL(trimmed.replace(/^payload:/, ''));
		urlSet.add(`${parsed}\n\n`);

		const host = parsed.hostname.replace(/^\[|\]$/g, ''); // remove [ ]
		if (ipv4Regex.test(host)) {
			ipSet.add(`${host}/32`);
		} else if (ipv6Regex.test(host)) {
			ipSet.add(`${host}/128`);
		} else {
			domainSet.add(shortenDomain(host));
		}
	} catch {
		console.warn(`Warning: Failed to parse line: ${trimmed}`);
	}
};

async function fetchAndProcess(url) {
	try {
		console.log(`Fetching ${url}...`);
		const res = await fetch(url);
		if (!res.ok) {
			console.warn(`Warning: Fetch failed for ${url} with status ${res.status}`);
			return;
		}
		const text = await res.text();
		// 统一将文本内容按换行或逗号拆分为单条规则
		text
			.split(/[\r\n,]+/) // 支持换行符和逗号作为分隔符
			.map((line) => line.trim())
			.filter(Boolean)
			.forEach(handleLine);
	} catch (err) {
		console.error(`Error fetching ${url}:`, err);
	}
}

async function saveYaml(filename, items) {
	const content = [
		'payload:',
		...Array.from(items)
			.sort()
			.map((item) => `  - ${item}`),
	].join('\n');
	const filepath = path.join(TrackerPath, filename);
	await fs.writeFile(filepath, content, 'utf-8');
}

async function saveUrls(filename, items) {
	const filepath = path.join(TrackerPath, filename);
	await fs.writeFile(filepath, Array.from(items).sort().join(''), 'utf-8');
}

async function ensureDirectoryExists(dir) {
	try {
		await fs.mkdir(dir, { recursive: true });
		console.log(`Directory ensured: ${dir}`);
	} catch (err) {
		console.error(`Failed to create directory ${dir}:`, err);
	}
}

async function main() {
	try {
		await ensureDirectoryExists(TrackerPath);

		for (const url of urlList) {
			try {
				await fetchAndProcess(url);
			} catch (err) {
				console.error(`Error processing ${url}:`, err);
			}
		}

		await saveYaml('Tracker_Domain.yaml', domainSet);
		await saveYaml('Tracker_IP.yaml', ipSet);
		await saveUrls('Tracker.list', urlSet);

		console.log(`\n✅ Done!`);
		console.log(`Total Domains: ${domainSet.size}`);
		console.log(`Total IPs: ${ipSet.size}`);
		console.log(`Total Urls: ${urlSet.size}`);
	} catch (err) {
		console.error('Fatal error:', err);
	}
}

main();
