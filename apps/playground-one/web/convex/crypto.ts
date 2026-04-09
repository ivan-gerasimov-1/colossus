import { v } from 'convex/values';

/**
 * Validates that the master key is a valid hex-encoded 256-bit key (64 hex characters)
 */
export function validateMasterKey(key: string): boolean {
	const hexRegex = /^[0-9a-fA-F]{64}$/;
	return hexRegex.test(key);
}

/**
 * Converts a hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
	}
	return bytes;
}

/**
 * Converts Uint8Array to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Imports a raw AES-GCM key from hex string
 */
async function importKey(hexKey: string): Promise<CryptoKey> {
	const keyBytes = hexToBytes(hexKey);
	return await crypto.subtle.importKey(
		'raw',
		keyBytes.buffer as ArrayBuffer,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt'],
	);
}

/**
 * Encrypts plaintext using AES-256-GCM
 * @param plaintext - Text to encrypt
 * @param masterKeyHex - Hex-encoded 256-bit master key
 * @returns Hex-encoded ciphertext with IV (format: hex(iv):hex(ciphertext))
 */
export async function encrypt(
	plaintext: string,
	masterKeyHex: string,
): Promise<string> {
	if (!validateMasterKey(masterKeyHex)) {
		throw new Error('Invalid master key format');
	}

	const key = await importKey(masterKeyHex);
	const encoder = new TextEncoder();
	const data = encoder.encode(plaintext);

	// Generate a random 12-byte IV (nonce)
	const iv = crypto.getRandomValues(new Uint8Array(12));

	const encrypted = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv: iv.buffer as ArrayBuffer,
		},
		key,
		data,
	);

	// Combine IV and ciphertext, encode as hex
	const ivHex = bytesToHex(iv);
	const ciphertextHex = bytesToHex(new Uint8Array(encrypted));

	return `${ivHex}:${ciphertextHex}`;
}

/**
 * Decrypts ciphertext using AES-256-GCM
 * @param ciphertext - Hex-encoded ciphertext with IV (format: hex(iv):hex(ciphertext))
 * @param masterKeyHex - Hex-encoded 256-bit master key
 * @returns Decrypted plaintext
 */
export async function decrypt(
	ciphertext: string,
	masterKeyHex: string,
): Promise<string> {
	if (!validateMasterKey(masterKeyHex)) {
		throw new Error('Invalid master key format');
	}

	const key = await importKey(masterKeyHex);

	// Split IV and ciphertext
	const [ivHex, ciphertextHex] = ciphertext.split(':');
	if (!ivHex || !ciphertextHex) {
		throw new Error('Invalid ciphertext format');
	}

	const iv = hexToBytes(ivHex);
	const encryptedData = hexToBytes(ciphertextHex);

	const decrypted = await crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv: iv.buffer as ArrayBuffer,
		},
		key,
		encryptedData.buffer as ArrayBuffer,
	);

	const decoder = new TextDecoder();
	return decoder.decode(decrypted);
}

/**
 * Generates a random 256-bit key encoded as hex
 * Useful for generating a new master key
 */
export function generateMasterKey(): string {
	const key = crypto.getRandomValues(new Uint8Array(32));
	return bytesToHex(key);
}
