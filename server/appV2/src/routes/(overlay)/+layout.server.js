import { error } from '@sveltejs/kit';

export function load({ locals }) {
	if (locals.subdomain !== 'overlay') {
		throw error(404, 'Not found');
	}
}