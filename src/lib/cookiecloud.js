export async function getCookieCloudData(env) {
	const data = await env.COOKIE_KV.get('cookiecloud-all', 'json');

	if (!data) {
		return null;
	}

	return data;
}

export async function getCookieHeader(env, domain) {
	const data = await getCookieCloudData(env);

	if (!data || !data.cookie_data) {
		return '';
	}

	const cookies = data.cookie_data[domain] || [];

	if (!Array.isArray(cookies)) {
		return '';
	}

	if (!Array.isArray(cookies)) {
		return '';
	}

	return cookies
		.filter((item) => item && item.name && item.value !== undefined)
		.map((item) => `${item.name}=${item.value}`)
		.join('; ');
}
