import { renderRss2 } from '../../../utils/util';
import {
	GetDynSpace,
	GetOpusDetail,
} from '../grpc_helper';

let getPubDate = (ptimeLabelText) => {
	let pubDate = new Date().toUTCString();

	try {
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
			let hour =
				ptimeLabelText
					.split('昨天')[1]
					.split(':')[0];

			let minute =
				ptimeLabelText
					.split('昨天')[1]
					.split(':')[1];

			let yesterday =
				new Date(
					new Date().getTime() -
						24 *
							60 *
							60 *
							1000
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
					day *
						24 *
						60 *
						60 *
						1000
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
		} else {
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

let getItemFromDynamicForward = (card) => {
	let title = '';

	for (let desc of card.extend?.desc || []) {
		title += desc.text;
	}

	let link =
		`https://t.bilibili.com/${card.extend.dynIdStr}`;

	let description =
		title + '<br/>';

	description +=
		`转发自：@${card.extend.origName}<br/>`;

	for (
		let desc of
			card.extend?.origDesc || []
	) {
		description += desc.text;
	}

	if (card.extend.origImgUrl) {
		description +=
			`<br/><img src="${card.extend.origImgUrl}"/>`;
	}

	let pubDate =
		new Date().toUTCString();

	let guid =
		`https://t.bilibili.com/${card.extend.dynIdStr}`;

	let author = '';
	let category = card.cardType;

	for (
		let _module of
			card.modules || []
	) {
		if (
			_module.moduleType ===
			'module_author'
		) {
			let ptimeLabelText =
				_module.moduleAuthor
					?.ptimeLabelText;

			pubDate =
				getPubDate(
					ptimeLabelText
				);

			author =
				_module.moduleAuthor
					?.author?.name;
		}
	}

	return {
		title,
		link,
		description,
		pubDate,
		guid,
		author,
		category,
	};
};

let getItemFromDynamicAv = (card) => {
	let title = '';

	for (
		let desc of
			card.extend?.origDesc || []
	) {
		title += desc.text;
	}

	let link =
		`https://t.bilibili.com/${card.extend.dynIdStr}`;

	let description =
		title + '<br/>';

	if (card.extend.origImgUrl) {
		description +=
			`<img src="${card.extend.origImgUrl}"/>`;
	}

	let pubDate =
		new Date().toUTCString();

	let guid =
		`https://t.bilibili.com/${card.extend.dynIdStr}`;

	let author = '';
	let category = card.cardType;

	for (
		let _module of
			card.modules || []
	) {
		if (
			_module.moduleType ===
			'module_author'
		) {
			let ptimeLabelText =
				_module.moduleAuthor
					?.ptimeLabelText;

			pubDate =
				getPubDate(
					ptimeLabelText
				);

			author =
				_module.moduleAuthor
					?.author?.name;
		} else if (
			_module.moduleType ===
			'module_desc'
		) {
			description +=
				`<br/>${_module.moduleDesc?.text || ''}`;
		}
	}

	return {
		title,
		link,
		description,
		pubDate,
		guid,
		author,
		category,
	};
};

let getItemFromDynamicDraw = (card) => {
	let title = '';

	for (
		let desc of
			card.extend?.origDesc || []
	) {
		title += desc.text;
	}

	let link =
		`https://t.bilibili.com/${card.extend.dynIdStr}`;

	let description =
		title + '<br/>';

	for (
		let cover of
			card.extend
				?.opusSummary
				?.covers || []
	) {
		description +=
			`<img src="${cover.src}"/><br/>`;
	}

	let pubDate =
		new Date().toUTCString();

	let guid =
		`https://t.bilibili.com/${card.extend.dynIdStr}`;

	let author = '';
	let category = card.cardType;

	for (
		let _module of
			card.modules || []
	) {
		if (
			_module.moduleType ===
			'module_author'
		) {
			let ptimeLabelText =
				_module.moduleAuthor
					?.ptimeLabelText;

			pubDate =
				getPubDate(
					ptimeLabelText
				);

			author =
				_module.moduleAuthor
					?.author?.name;
		} else if (
			_module.moduleType ===
			'module_desc'
		) {
			description +=
				`<br/>${_module.moduleDesc?.text || ''}`;
		}
	}

	return {
		title,
		link,
		description,
		pubDate,
		guid,
		author,
		category,
	};
};

let getItemFromDynamicDefault = (card) => {
	let title = '';

	let link =
		`https://t.bilibili.com/${card.extend.dynIdStr}`;

	let description = '';

	let pubDate =
		new Date().toUTCString();

	let guid =
		`https://t.bilibili.com/${card.extend.dynIdStr}`;

	let author = '';
	let category = card.cardType;

	for (
		let _module of
			card.modules || []
	) {
		if (
			_module.moduleType ===
			'module_desc'
		) {
			title =
				_module.moduleDesc
					?.text || '';
		} else if (
			_module.moduleType ===
			'module_author'
		) {
			let ptimeLabelText =
				_module.moduleAuthor
					?.ptimeLabelText;

			pubDate =
				getPubDate(
					ptimeLabelText
				);

			author =
				_module.moduleAuthor
					?.author?.name;
		}
	}

	if (title === '') {
		for (
			let desc of
				card.extend?.origDesc || []
		) {
			title += desc.text;
		}
	}

	return {
		title,
		link,
		description,
		pubDate,
		guid,
		author,
		category,
	};
};

let getItemFromPaidDynamic = (card) => {
	let pubDate =
		new Date().toUTCString();

	let author = '';
	let category = card.cardType;

	for (
		let _module of
			card.modules || []
	) {
		if (
			_module.moduleType ===
			'module_author'
		) {
			let ptimeLabelText =
				_module.moduleAuthor
					?.ptimeLabelText;

			pubDate =
				getPubDate(
					ptimeLabelText
				);

			author =
				_module.moduleAuthor
					?.author?.name;
		}
	}

	return {
		title:
			'充电专属动态',

		link:
			`https://t.bilibili.com/${card.extend.dynIdStr}`,

		description:
			'充电专属动态',

		pubDate,

		guid:
			`https://t.bilibili.com/${card.extend.dynIdStr}`,

		author,

		category,
	};
};

let getItemFromDynamic = (card) => {
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

let getPaidDebugInfo = (card) => {
	let moduleTypes = [];
	let moduleDescLength = 0;

	for (
		let mod of
			card.modules || []
	) {
		if (mod?.moduleType) {
			moduleTypes.push(
				mod.moduleType
			);
		}

		if (
			mod?.moduleType ===
			'module_desc'
		) {
			let text =
				mod.moduleDesc?.text ||
				'';

			moduleDescLength +=
				text.length;
		}
	}

	let origDesc =
		card.extend?.origDesc || [];

	let desc =
		card.extend?.desc || [];

	let origDescTextLength = 0;

	for (let item of origDesc) {
		origDescTextLength +=
			(item?.text || '').length;
	}

	let descTextLength = 0;

	for (let item of desc) {
		descTextLength +=
			(item?.text || '').length;
	}

	return {
		dyn_id:
			card.extend
				?.dynIdStr || '',

		dyn_type:
			card.extend
				?.dynType ?? null,

		business_id:
			card.extend
				?.businessId ?? null,

		card_type:
			card.cardType || '',

		is_only_fans:
			!!card.extend
				?.onlyFansProperty
				?.isOnlyFans,

		module_types:
			moduleTypes,

		module_desc_text_length:
			moduleDescLength,

		orig_desc_count:
			origDesc.length,

		orig_desc_text_length:
			origDescTextLength,

		desc_count:
			desc.length,

		desc_text_length:
			descTextLength,

		cover_count:
			card.extend
				?.opusSummary
				?.covers
				?.length || 0,

		has_orig_img:
			!!card.extend
				?.origImgUrl,

		extend_keys:
			Object.keys(
				card.extend || {}
			),

		only_fans_keys:
			Object.keys(
				card.extend
					?.onlyFansProperty ||
					{}
			),
	};
};

let getOpusDebugInfo = (
	opusDetail
) => {
	let opusItem =
		opusDetail?.opusItem || null;

	if (!opusItem) {
		return {
			has_opus_item:
				false,
		};
	}

	let modules =
		Array.isArray(
			opusItem.modules
		)
			? opusItem.modules
			: [];

	let moduleTypes = [];

	let moduleDescTextLength = 0;

	let moduleBlockedCount = 0;

	let imageCount = 0;

	let moduleKeys = [];

	for (let mod of modules) {
		if (mod?.moduleType) {
			moduleTypes.push(
				mod.moduleType
			);
		}

		moduleKeys.push(
			Object.keys(
				mod || {}
			)
		);

		if (
			mod?.moduleType ===
			'module_blocked'
		) {
			moduleBlockedCount++;
		}

		if (
			mod?.moduleType ===
			'module_desc'
		) {
			moduleDescTextLength +=
				(
					mod.moduleDesc
						?.text || ''
				).length;
		}

		let covers =
			mod?.moduleDynamic
				?.dynDraw
				?.items;

		if (
			Array.isArray(covers)
		) {
			imageCount +=
				covers.length;
		}
	}

	return {
		has_opus_item:
			true,

		opus_id:
			opusItem.opusId ??
			null,

		opus_type:
			opusItem.opusType ??
			null,

		oid:
			opusItem.oid ??
			null,

		module_count:
			modules.length,

		module_types:
			moduleTypes,

		module_blocked_count:
			moduleBlockedCount,

		module_desc_text_length:
			moduleDescTextLength,

		image_count:
			imageCount,

		module_keys:
			moduleKeys,

		extend_keys:
			Object.keys(
				opusItem.extend || {}
			),
	};
};

let deal = async (ctx) => {
	const { uid } =
		ctx.req.param();

	const accessKey =
		ctx.env
			.BILIBILI_ACCESS_TOKEN ||
		'';

	let dynSpaceResJson =
		await GetDynSpace(
			uid,
			accessKey
		);

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

	if (
		ctx.req.query('debug') ===
		'1'
	) {
		let paidCards =
			dynSpaceList.filter(
				(card) =>
					card.extend
						?.onlyFansProperty
						?.isOnlyFans
			);

		return ctx.json({
			access_token_loaded:
				!!accessKey,

			total_cards:
				dynSpaceList.length,

			paid_cards:
				paidCards.length,

			paid_debug:
				paidCards.map(
					getPaidDebugInfo
				),
		});
	}

	if (
		ctx.req.query('debug') ===
		'opus'
	) {
		let paidCard =
			dynSpaceList.find(
				(card) =>
					card.extend
						?.onlyFansProperty
						?.isOnlyFans
			);

		if (!paidCard) {
			return ctx.json({
				ok: false,
				error:
					'no paid dynamic found',
			});
		}

		let oid =
			paidCard.extend
				?.businessId;

		let dynType =
			paidCard.extend
				?.dynType;

		let dynId =
			paidCard.extend
				?.dynIdStr || '';

		if (
			!oid ||
			dynType === undefined ||
			dynType === null
		) {
			return ctx.json({
				ok: false,

				error:
					'missing oid or dynType',

				dyn_id:
					dynId,

				oid:
					oid ?? null,

				dyn_type:
					dynType ?? null,
			});
		}

		try {
			let opusDetailJson =
				await GetOpusDetail(
					oid,
					dynType,
					accessKey
				);

			let opusDetail =
				JSON.parse(
					opusDetailJson
				);

			return ctx.json({
				ok: true,

				access_token_loaded:
					!!accessKey,

				source_dynamic: {
					dyn_id:
						dynId,

					oid:
						oid,

					dyn_type:
						dynType,

					card_type:
						paidCard.cardType ||
						'',
				},

				opus_debug:
					getOpusDebugInfo(
						opusDetail
					),
			});
		} catch (e) {
			return ctx.json({
				ok: false,

				access_token_loaded:
					!!accessKey,

				source_dynamic: {
					dyn_id:
						dynId,

					oid:
						oid,

					dyn_type:
						dynType,

					card_type:
						paidCard.cardType ||
						'',
				},

				error:
					e?.message ||
					String(e),

				grpc_status:
					e?.grpcStatus ??
					null,
			});
		}
	}

	let items = [];

	let globalUsername = '';

	if (
		dynSpaceList.length !== 0
	) {
		globalUsername =
			dynSpaceList[0]
				.extend
				.origName;
	} else {
		globalUsername =
			uid;
	}

	for (
		let card of
			dynSpaceList
	) {
		let item =
			getItemFromDynamic(
				card
			);

		items.push(item);
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

	ctx.header(
		'Content-Type',
		'application/xml'
	);

	return ctx.body(
		`${rss}`
	);
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