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
	const data = await ctx.env.COOKIE_KV.get(
		'cookiecloud-all',
		'json'
	);

	if (!data) {
		return ctx.json({
			ok: false,
			message: 'cookiecloud-all not found',
		});
	}

	return ctx.json({
		ok: true,
		update_time: data.update_time,
		cookie_domains: Object.keys(
			data.cookie_data || {}
		),
		local_storage_domains: Object.keys(
			data.local_storage_data || {}
		),
	});
});

app.get('/debug/bilibili-login', async (ctx) => {
	const body = new URLSearchParams();

	body.set(
		'appkey',
		'4409e2ce8ffd12b8'
	);

	body.set(
		'local_id',
		'0'
	);

	body.set(
		'ts',
		'0'
	);

	body.set(
		'sign',
		'e134154ed6add881d28fbdf68653cd9c'
	);

	const resp = await fetch(
		'https://passport.snm0516.aisee.tv/x/passport-tv-login/qrcode/auth_code',
		{
			method: 'POST',
			headers: {
				'Content-Type':
					'application/x-www-form-urlencoded',
				'User-Agent':
					'Mozilla/5.0 BiliDroid/8.3.0',
			},
			body: body.toString(),
		}
	);

	const text = await resp.text();

	let data = null;

	try {
		data = JSON.parse(text);
	} catch (e) {
		data = null;
	}

	if (!data) {
		return ctx.json({
			ok: false,
			http_status: resp.status,
			content_type:
				resp.headers.get(
					'content-type'
				),
			body_start:
				text.slice(0, 500),
		});
	}

	return ctx.json({
		ok: data.code === 0,
		http_status: resp.status,
		code: data.code,
		message: data.message,
		login_url:
			data.data?.url || null,
		auth_code:
			data.data?.auth_code || null,
	});
});

app.notFound((ctx) => {
	return ctx.html(notFoundHtml);
});

app.onError((err, c) => {
	let stack_str = err.stack || String(err);

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
