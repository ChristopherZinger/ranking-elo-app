import slugify from 'slugify';

export function slugifyUserName(name: string) {
	return slugify(name, {
		lower: true
	});
}
