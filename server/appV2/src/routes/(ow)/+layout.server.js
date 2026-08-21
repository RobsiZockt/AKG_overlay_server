import { error } from '@sveltejs/kit';

export function load({ locals }) {
    console.log('EXPECTED:', 'ow');
	console.log('ACTUAL:', locals.subdomain);
	if (locals.subdomain !== 'ow') {
		throw error(404, 'Not found');
	}
}