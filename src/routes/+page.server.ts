import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './cheese/[slug]/$types';

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export const load = (async ({ params }) => {
	const res = await getOpenAIResponse(params);

	if (res) {
		console.log(res.data.choices);
		return { content: res.data.choices[0].message?.content };
	}

	throw error(404, 'Not found');
}) satisfies PageServerLoad;

async function getOpenAIResponse(params: any) {
	return await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: [
			{ role: 'system', content: 'You are a wine and cheese coinesseur.' },
			{ role: 'user', content: `Which cheese fits best with a ${params.slug}?` }
		]
	});
}
