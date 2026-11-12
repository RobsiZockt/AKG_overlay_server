import { error } from '@sveltejs/kit';
import { building } from '$app/environment';

export function load({ locals }) {
    console.log('EXPECTED:', 'ow');
	console.log('ACTUAL:', locals.subdomain);
	if (locals.subdomain !== 'ow') {
		throw error(404, 'Not found');
	}
}