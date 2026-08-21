// src/hooks.server.js

export async function handle({ event, resolve }) {
	const hostname = event.url.hostname;

	const subdomain = getSubdomain(hostname);

	event.locals.subdomain = subdomain;

	return resolve(event);
}

function getSubdomain(hostname) {
	if (hostname === 'localhost') {
		return null;
	}

	if (hostname.endsWith('.localhost')) {
		return hostname.split('.')[0];
	}

	const parts = hostname.split('.');

	if (parts.length < 3) {
		return null;
	}

	return parts[0];
}