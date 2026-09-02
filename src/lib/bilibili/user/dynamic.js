import { renderRss2 } from '../../../utils/util';
import {
	GetDynSpace,
	GetOpusDetail,
} from '../grpc_helper';


let getPubDate = (ptimeLabelText) => {
	let pubDate = new Date().toUTCString();

	try {
		if (!ptimeLabelText) {
			return pubDate;
		}

		if (ptimeLabelText.indexOf('小时前') !== -1) {
			let hour = ptimeLabelText.split('小时前')[0];

			pubDate = new Date(
				new Date().getTime() -
					hour * 60 * 60 * 1000
			).toUTCString();
		} else if (
			ptimeLabelText.indexOf('分钟前') !== -1
		) {
			let minute =
				ptimeLabelText.split('分钟前')[0];

			pubDate = new Date(
				new Date().getTime() -
					minute * 60 * 1000
			).toUTCString();
		} else if (
			ptimeLabelText.indexOf('刚刚') !== -1
		) {
			pubDate =
				new Date().toUTCString();
		} else if (
			ptimeLabelText.indexOf('昨天') !== -1
		) {
			let time =
				ptimeLabelText.split('昨天')[1];

			let hour =
				time.split(':')[0];

			let minute =
				time.split(':')[1];

			let yesterday =
				new Date(
					new Date().getTime() -
						24 * 60 * 60 * 1000
				);

			pubDate =
				new Date(
					yesterday.getFullYear(),
					yesterday.getMonth(),
					yesterday.getDate(),
					hour,
					minute
				).toUTCString();
		} else if (
			ptimeLabelText.indexOf('天前') !== -1
		) {
			let day =
				ptimeLabelText.split('天前')[0];

			pubDate = new Date(
				new Date().getTime() -
					day * 24 * 60 * 60 * 1000
			).toUTCString();
		} else if (
			ptimeLabelText.indexOf('年') !== -1
		) {
			let year =
				ptimeLabelText.split('年')[0];

			let month =
				ptimeLabelText
					.split('年')[1]
					.split('月')[0];

			let day =
				ptimeLabelText
					.split('年')[1]
					.split('月')[1]
					.split('日')[0];

			pubDate =
				new Date(
					year,
					month - 1,
					day
				).toUTCString();
		} else if (
			ptimeLabelText.indexOf('月') !== -1
		) {
			let year =
				new Date().getFullYear();

			let month =
				ptimeLabelText.split('月')[0];

			let day =
				ptimeLabelText
					.split('月')[1]
					.split('日')[0];

			pubDate =
				new Date(
					year,
					month - 1,
					day
				).toUTCString();
		}
	} catch (e) {}

	return pubDate;
};

let getBaseInfo = (card) => {
	let pubDate =
		new Date().toUTCString();

	let author = '';

	for (
		let mod of
			card.modules || []
	) {
		if (
			mod.moduleType ===
			'module_author'
		) {
			pubDate =
				getPubDate(
					mod.moduleAuthor
						?.ptimeLabelText
				);

			author =
				mod.moduleAuthor
					?.author
					?.name || '';
		}
	}

	const dynId =
		card.extend?.dynIdStr || '';

	const link =
		`https://www.bilibili.com/opus/${dynId}`;

	return {
		link,
		guid: link,
		pubDate,
		author,
		category:
			card.cardType || '',
	};
};

let getItemFromPaidDynamic = (
	card
) => {
	const base =
		getBaseInfo(card);

	return {
		title:
			'充电专属动态',

		link:
			base.link,

		description:
			'充电专属动态',

		pubDate:
			base.pubDate,

		guid:
			base.guid,

		author:
			base.author,

		category:
			base.category,
	};
};

let getItemFromDynamicForward = (
	card
) => {
	const base =
		getBaseInfo(card);

	let title = '';

	for (
		let desc of
			card.extend?.desc || []
	) {
		title +=
			desc?.text || '';
	}

	if (!title) {
		title = '转发动态';
	}

	let description =
		`${title}<br/>`;

	if (card.extend?.origName) {
		description +=
			`转发自：@${card.extend.origName}<br/>`;
	}

	for (
		let desc of
			card.extend?.origDesc || []
	) {
		description +=
			desc?.text || '';
	}

	if (card.extend?.origImgUrl) {
		description +=
			`<br/><img src="${card.extend.origImgUrl}"/>`;
	}

	return {
		title,
		link:
			base.link,
		description,
		pubDate:
			base.pubDate,
		guid:
			base.guid,
		author:
			base.author,
		category:
			base.category,
	};
};

let getItemFromDynamicAv = (
	card
) => {
	const base =
		getBaseInfo(card);

	let title = '';

	for (
		let desc of
			card.extend?.origDesc || []
	) {
		title +=
			desc?.text || '';
	}

	let description = '';

	for (
		let mod of
			card.modules || []
	) {
		if (
			mod.moduleType ===
			'module_desc'
		) {
			let text =
				mod.moduleDesc?.text || '';

			if (!title) {
				title = text;
			}

			if (text) {
				description +=
					`${text}<br/>`;
			}
		}
	}

	if (!title) {
		title = '哔哩哔哩视频动态';
	}

	if (card.extend?.origImgUrl) {
		description +=
			`<img src="${card.extend.origImgUrl}"/>`;
	}

	if (!description) {
		description = title;
	}

	return {
		title,
		link:
			base.link,
		description,
		pubDate:
			base.pubDate,
		guid:
			base.guid,
		author:
			base.author,
		category:
			base.category,
	};
};

let getItemFromDynamicDraw = (
	card
) => {
	const base =
		getBaseInfo(card);

	let title = '';
	let description = '';

	// 优先读取新版图文动态的标题
	const opusSummary =
		card.extend?.opusSummary;

	for (
		let node of
			opusSummary
				?.title
				?.text
				?.nodes || []
	) {
		title +=
			node?.rawText ||
			node?.word?.words ||
			'';
	}

	// 读取新版图文动态正文
	for (
		let node of
			opusSummary
				?.summary
				?.text
				?.nodes || []
	) {
		description +=
			node?.rawText ||
			node?.word?.words ||
			'';
	}

	// 兼容旧类型 module_desc
	if (!description) {
		for (
			let mod of
				card.modules || []
		) {
			if (
				mod.moduleType ===
				'module_desc'
			) {
				let text =
					mod.moduleDesc?.text || '';

				if (!title) {
					title = text;
				}

				description += text;
			}
		}
	}

	// 兼容旧字段 origDesc
	if (!title) {
		for (
			let desc of
				card.extend?.origDesc || []
		) {
			title +=
				desc?.text || '';
		}
	}

	if (!description) {
		for (
			let desc of
				card.extend?.origDesc || []
		) {
			description +=
				desc?.text || '';
		}
	}

	// 图片
	for (
		let cover of
			card.extend
				?.opusSummary
				?.covers || []
	) {
		if (cover?.src) {
			description +=
				`<br/><img src="${cover.src}"/>`;
		}
	}

	if (!title) {
		title =
			'哔哩哔哩图文动态';
	}

	if (!description) {
		description = title;
	}

	return {
		title,
		link:
			base.link,
		description,
		pubDate:
			base.pubDate,
		guid:
			base.guid,
		author:
			base.author,
		category:
			base.category,
	};
};

let getItemFromDynamicDefault = (
	card
) => {
	const base =
		getBaseInfo(card);

	let title = '';

	for (
		let mod of
			card.modules || []
	) {
		if (
			mod.moduleType ===
			'module_desc'
		) {
			title =
				mod.moduleDesc
					?.text || '';
		}
	}

	if (!title) {
		for (
			let desc of
				card.extend?.origDesc || []
		) {
			title +=
				desc?.text || '';
		}
	}

	if (!title) {
		title = '哔哩哔哩动态';
	}

	return {
		title,
		link:
			base.link,
		description:
			title,
		pubDate:
			base.pubDate,
		guid:
			base.guid,
		author:
			base.author,
		category:
			base.category,
	};
};

let getItemFromDynamic = (
	card
) => {
	if (
		card.extend
			?.onlyFansProperty
			?.isOnlyFans
	) {
		return getItemFromPaidDynamic(
			card
		);
	}

	switch (card.cardType) {
		case 'forward':
			return getItemFromDynamicForward(
				card
			);

		case 'av':
			return getItemFromDynamicAv(
				card
			);

		case 'draw':
			return getItemFromDynamicDraw(
				card
			);

		default:
			return getItemFromDynamicDefault(
				card
			);
	}
};

let deal = async (ctx) => {
	const { uid } =
		ctx.req.param();

	const debug =
		ctx.req.query('debug');

	const debugId =
		ctx.req.query('id');

	if (
		debug === 'detail' &&
		debugId
	) {
		const detailJson =
			await GetOpusDetail(
				debugId,
				2
			);

		return new Response(
			detailJson,
			{
				headers: {
					'Content-Type':
						'application/json; charset=utf-8',
				},
			}
		);
	}


	const cache =
		caches.default;

	const cacheUrl =
		new URL(ctx.req.url);

	cacheUrl.search = '';

	const cacheRequest =
		new Request(
			cacheUrl.toString(),
			{
				method: 'GET',
			}
		);

	if (!debug) {
		const cachedResponse =
			await cache.match(
				cacheRequest
			);

		if (cachedResponse) {
			return cachedResponse;
		}
	}



	let dynSpaceResJson =
		await GetDynSpace(uid);

	let dynSpaceRes =
		JSON.parse(
			dynSpaceResJson
		);

	let dynSpaceList =
		Array.isArray(
			dynSpaceRes.list
		)
			? dynSpaceRes.list
			: [];

	let items = [];

	for (
		let card of
			dynSpaceList
	) {
		if (
			debug === 'card' &&
			card.extend?.dynIdStr ===
				'1243024786046582787'
		) {
			return new Response(
				JSON.stringify(
					card,
					null,
					2
				),
				{
					headers: {
						'Content-Type':
							'application/json; charset=utf-8',
					},
				}
			);
		}

		items.push(
			getItemFromDynamic(
				card
			)
		);
	}

	let globalUsername =
		uid;

	if (
		dynSpaceList.length > 0
	) {
		globalUsername =
			dynSpaceList[0]
				.extend
				?.origName ||
			uid;
	}

	let data = {
		title:
			`${globalUsername} 的 bilibili 动态`,

		link:
			`https://space.bilibili.com/${uid}/dynamic`,

		description:
			`${globalUsername} 的 bilibili 动态`,

		language:
			'zh-cn',

		items,
	};

	let rss =
		renderRss2(data);

	const response =
		new Response(
			rss,
			{
				status: 200,

				headers: {
					'Content-Type':
						'application/rss+xml; charset=utf-8',

					'Cache-Control':
						items.length > 0
							? 'public, max-age=300'
							: 'no-store, no-cache, must-revalidate',

					'X-RSSWorker-Cache':
						items.length > 0
							? 'MISS'
							: 'BYPASS-EMPTY',
				},
			}
		);

	const cacheResponse =
		new Response(
			rss,
			{
				status: 200,

				headers: {
					'Content-Type':
						'application/rss+xml; charset=utf-8',

					'Cache-Control':
						'public, max-age=300',

					'X-RSSWorker-Cache':
						'HIT',
				},
			}
		);

	if (items.length > 0) {
		ctx.executionCtx.waitUntil(
			cache.put(
				cacheRequest,
				cacheResponse
			)
		);
	}

	return response;
};

let setup = (route) => {
	route.get(
		'/bilibili/user/dynamic/:uid',
		deal
	);
};

export default {
	setup,
};

export {
	getItemFromDynamic,
};