import { customAlphabet } from 'nanoid';

const ADJECTIVES = [
	'cosmic',
	'stellar',
	'infinite',
	'nebular',
	'quantum',
	'radiant',
	'solar',
	'lunar',
	'galactic',
	'celestial',
	'auroral',
	'void',
	'ethereal',
	'magnetic',
	'plasma',
	'orbital',
	'dark',
	'bright',
	'ancient',
	'distant',
	'vast',
	'silent',
	'dynamic',
	'hyper',
	'meta',
	'trans',
	'ultra',
	'super',
] as const;

const SPACE_OBJECTS = [
	'star',
	'nebula',
	'galaxy',
	'comet',
	'asteroid',
	'planet',
	'moon',
	'constellation',
	'quasar',
	'pulsar',
	'blackhole',
	'supernova',
	'cluster',
	'void',
	'wormhole',
	'dwarf',
	'giant',
	'binary',
	'trid',
	'system',
	'cloud',
	'dust',
	'ring',
	'field',
	'belt',
	'stream',
	'jet',
	'core',
	'shell',
	'disk',
] as const;

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4);

export function generatePublicId(): string {
	const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
	const spaceObject =
		SPACE_OBJECTS[Math.floor(Math.random() * SPACE_OBJECTS.length)];
	const id = nanoid();
	return `${adjective}-${spaceObject}-${id}`;
}

export async function generateUniquePublicId(
	ctx: any,
	maxAttempts = 10,
): Promise<string> {
	for (let i = 0; i < maxAttempts; i++) {
		const publicId = generatePublicId();
		const existing = await ctx.db
			.query('users')
			.withIndex('publicId', (q: any) => q.eq('publicId', publicId))
			.first();
		if (!existing) {
			return publicId;
		}
	}
	throw new Error('Failed to generate unique publicId after max attempts');
}
