import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export const POST = async (event) => {
	const data = await event.request.json();
	const answer = (await getOpenAIResponse(data.searchTerm)).data.choices[0].message?.content;
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

	return new Response(JSON.stringify({ answer: answer }), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};

async function getOpenAIResponse(searchTerm: string) {
	return await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: [
			{ role: 'system', content: 'You are a wine and cheese coinesseur.' },
			{ role: 'user', content: `Welche 3 Käse passen am besten zu  ${searchTerm}?` }
		]
	});
}
