import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { IncomingMessage } from 'http';
import { createParser, type ParsedEvent, type ReconnectInterval } from 'eventsource-parser';

export const config = {
	runtime: 'edge'
};

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export const POST = async (event) => {
	const data = await event.request.json();
	if (!data.searchTerm.startsWith('#!'))
		return new Response(JSON.stringify({ response: 'nok' }), {
			status: 400,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	data.searchTerm = data.searchTerm.replace('#!', '');

	// const answer =
	// 	'Ein Merlot ist ein mittelschwerer Wein mit einer würzigen und warmen Charakteristik. Er eignet sich hervorragend für die Kombination mit verschiedenen Käsesorten. Einige passende Käse für Merlot sind:\n' +
	// 	'\n' +
	// 	'- Gouda: Dieser milde Käse aus den Niederlanden passt gut zu Merlot, da er sich gut mit dem Fruchtgeschmack des Weins ergänzt.\n' +
	// 	'\n' +
	// 	'- Cheddar: Ein würziger Cheddar passt gut zu Merlot, da er die Fülle des Weins ausbalancieren kann.\n' +
	// 	'\n' +
	// 	'- Blauschimmelkäse: Ein saftiger Blauschimmelkäse kann die Aromen im Merlot betonen und eine harmonische Begleitung sein.\n' +
	// 	'\n' +
	// 	'- Ziegenkäse: Ein mild-frischer Ziegenkäse kann den Merlot ergänzen und ihn mit einem Hauch von Zitrus und frischen Kräutern verstärken.';
	// console.log('hello world', data);
	const options: ResponseInit = {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	};

	const apiUrl = 'https://api.openai.com/v1/chat/completions';
	const params = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: 'gpt-4',
			messages: [
				{ role: 'system', content: 'You are a wine and cheese coinesseur.' },
				{ role: 'user', content: `Welcher Käse passt am besten zu  ${data.searchTerm}?` }
			],
			stream: true
		})
	};
	const streamCompletion = await fetch(apiUrl, params);

	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	if (process.env.NODE_ENV !== 'production') {
		console.log('🚀 ---------------------------------------------🚀');
		console.log(
			'🚀 ~ file: asyncChatResponse.ts:56 ~ open ai response status:',
			streamCompletion.status
		);
		console.log('🚀 ---------------------------------------------🚀');
	}

	if (streamCompletion.status > 299) throw Error('Couldnt get completion');
	const readableStream = new ReadableStream({
		async start(controller) {
			function onParse(event: ParsedEvent | ReconnectInterval) {
				if (event.type === 'event') {
					const data = event.data;
					if (data.includes('[DONE]')) {
						controller.close();
						if (process.env.NODE_ENV !== 'production') {
							console.log('Exiting stream');
						}
						return;
					}
					try {
						const json = JSON.parse(data);
						const text = json.choices[0].delta.content?.replaceAll(/(\n)?^data:\s*/g, ''); // in case there's multiline data event
						console.log(text);
						const queue = encoder.encode(text);
						controller.enqueue(queue);
					} catch (e) {
						controller.error(e);
					}
				}
			}

			const stream = streamCompletion.body as unknown as IncomingMessage;

			const parser = createParser(onParse);

			for await (const chunk of stream as any) {
				parser.feed(decoder.decode(chunk));
			}
		}
	});

	return new Response(readableStream, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8'
		}
	});
};
