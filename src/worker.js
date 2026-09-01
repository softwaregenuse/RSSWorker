import { Hono } from 'hono';
import { basicAuth } from 'hono/basic-auth';
import { cors } from 'hono/cors';
import indexHtml from './html/index.html';
import notFoundHtml from './html/404.html';
import errorHtml from './html/err.html';
import robotsTxt from './robots.txt';

import route from './route';

const app = new Hono();

app.route('/rss', route);

app.get('/', (ctx) => {
	return ctx.html(indexHtml);
});

app.get('robots.txt', (ctx) => {
	return ctx.text(robotsTxt);
});

app.get('/debug', (ctx) => {
	return ctx.json(ctx.req.raw?.cf);
});

app.get('/debug/cookies', async (ctx) => {
	const data = await ctx.env.COOKIE_KV.get('cookiecloud-all', 'json');

	if (!data) {
		return ctx.json({
			ok: false,
			message: 'cookiecloud-all not found',
		});
	}

	return ctx.json({
		ok: true,
		update_time: data.update_time,
		cookie_domains: Object.keys(data.cookie_data || {}),
		local_storage_domains: Object.keys(data.local_storage_data || {}),
	});
});

app.get('/debug/bilibili/:uid', async (ctx) => {
	const uid = ctx.req.param('uid');

	const cookieData = await ctx.env.COOKIE_KV.get(
		'cookiecloud-all',
		'json'
	);

	const cookies =
		cookieData?.cookie_data?.['bilibili.com'] || [];

	const cookie = cookies
		.filter(
			(x) =>
				x &&
				x.name &&
				x.value !== undefined
		)
		.map((x) => `${x.name}=${x.value}`)
		.join('; ');

	const resp = await fetch(
		`https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=${uid}`,
		{
			headers: {
				Cookie: cookie,
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36',
				Referer:
					`https://space.bilibili.com/${uid}/dynamic`,
			},
		}
	);

	const text = await resp.text();

	let data = null;

	try {
		data = JSON.parse(text);
	} catch (e) {
		data = null;
	}

	return ctx.json({
		http_status: resp.status,
		content_type:
			resp.headers.get('content-type'),
		is_json: !!data,
		code: data?.code,
		message: data?.message,
		item_count:
			data?.data?.items?.length || 0,
		body_start:
			data
				? undefined
				: text.slice(0, 300),
	});
});

app.notFound((ctx) => {
	return ctx.html(notFoundHtml);
});

app.onError((err, c) => {
	let stack_str = err.stack;
	let stack_arr = stack_str
		.split('\n')
		.join('<br>');

	let result = errorHtml.replace(
		'{ERROR_MESSAGE}',
		`${err}`
	);

	result = result.replace(
		'{ERROR_STACK}',
		`${stack_arr}`
	);

	return c.html(result, 500);
});

// app.use(
// 	'/*',
// 	basicAuth({
// 		username: 'user',
// 		password: 'password',
// 	})
// );

app.use('/*', cors());

export default app;
