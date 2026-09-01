export async function getCookieCloudData(env) {
	const data = await env.COOKIE_KV.get(
		'cookiecloud-all',
		'json'
	);

	if (!data) {
		return null;
	}

	return data;
}

export async function getCookieHeader(env, domain) {
	const data =
		await getCookieCloudData(env);

	if (!data || !data.cookie_data) {
		return '';
	}

	const targetDomain =
		String(domain || '')
			.toLowerCase()
			.replace(/^\./, '');

	const matched = [];

	for (
		const [cookieDomain, cookies]
		of Object.entries(data.cookie_data)
	) {
		if (!Array.isArray(cookies)) {
			continue;
		}

		const normalizedCookieDomain =
			String(cookieDomain || '')
				.toLowerCase()
				.replace(/^\./, '');

		if (
			targetDomain ===
				normalizedCookieDomain ||
			targetDomain.endsWith(
				`.${normalizedCookieDomain}`
			)
		) {
			matched.push({
				domain:
					normalizedCookieDomain,
				cookies,
			});
		}
	}

	// 先处理父域 Cookie，
	// 更具体的域名如果有同名 Cookie，
	// 后面覆盖前面。
	matched.sort(
		(a, b) =>
			a.domain.length -
			b.domain.length
	);

	const cookieMap = new Map();

	for (const group of matched) {
		for (const item of group.cookies) {
			if (
				!item ||
				!item.name ||
				item.value === undefined
			) {
				continue;
			}

			cookieMap.set(
				item.name,
				item.value
			);
		}
	}

	return Array.from(
		cookieMap.entries()
	)
		.map(
			([name, value]) =>
				`${name}=${value}`
		)
		.join('; ');
}