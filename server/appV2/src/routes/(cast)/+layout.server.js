import { error } from '@sveltejs/kit';

export function load({ locals }) {
	if (locals.subdomain !== 'cast') {
		throw error(404, 'Not found');
	}
}