import { error } from '@sveltejs/kit';

export function load({ locals }) {
	if (locals.subdomain !== 'ow') {
		throw error(404, 'Not found');
	}
}