import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Bindings = {
	GEMINI_API_KEY: string;
	AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware to allow CORS
app.use(
	'/*',
	cors({
		origin: '*',
		allowMethods: ['GET', 'POST', 'OPTIONS'],
		allowHeaders: ['Content-Type'],
	})
);

// Test endpoint to verify server status
app.get('/test', (c) => {
	return c.json({ status: 'Server is running' });
});

// Chat using Gemini (Google)
app.post('/chattodocument-gemini', async (c) => {
	const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
	console.log(c.env.GEMINI_API_KEY);
	const { documentData, question } = await c.req.json();

	const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

	const chat = model.startChat({
		history: [
			{
				role: 'user',
				parts: [{ text: `Document: ${documentData}` }],
			},
			{
				role: 'model',
				parts: [{ text: 'Got it. I’ll help with that document.' }],
			},
		],
	});

	const result = await chat.sendMessage(question);
	return c.json({ message: result.response.text() });
});

// Chat using Cloudflare AI (LLaMA 2)
app.post('/chattodocument-llama', async (c) => {
	const { documentData, question } = await c.req.json();

	// Run the AI model
	const result = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
		messages: [
			{
				role: 'system',
				content: 'You are a document analysis assistant. Answer based on the document.',
			},
			{
				role: 'user',
				content: `Document: ${documentData}\nQuestion: ${question}`,
			},
		],
	});

	const responseText = await streamToText(result as ReadableStream<any>);
	return c.json({ message: responseText });
});

// Helper function to convert a ReadableStream to text
async function streamToText(stream: ReadableStream<any>): Promise<string> {
	const reader = stream.getReader();
	let text = '';
	const decoder = new TextDecoder();
	let done = false;

	while (!done) {
		const { value, done: doneReading } = await reader.read();
		done = doneReading;
		text += decoder.decode(value, { stream: true });
	}

	return text;
}

// Translate document using Cloudflare AI
app.post('/translatedocument', async (c) => {
	const { documentData, targetLanguage } = await c.req.json();

	const summary = await c.env.AI.run('@cf/facebook/bart-large-cnn', {
		input_text: documentData,
		max_length: 1000,
	});

	const translated = await c.env.AI.run('@cf/meta/m2m100-1.2b', {
		text: summary.summary,
		target_lang: targetLanguage,
		source_lang: 'english',
	});

	return c.json({ translation: translated });
});

export default app;
