// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { type NextRequest, NextResponse } from "next/server";
import { getUserIdentifier } from "~/lib/userIdentifier";
import { assertValue } from "~/lib/env";
import OpenAI from "openai";
import { type StreamingTextResponse } from "ai";

export const runtime = "edge";

const openAI = new OpenAI({
	apiKey: assertValue(process.env.OPENAI_API_KEY, "OPENAI_API_KEY env var is not configured"),
});

const redis = Redis.fromEnv();
const rateLimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(40, "1 m"),
	analytics: true,
	prefix: "rate-limit-fix",
});

export async function POST(request: NextRequest): Promise<StreamingTextResponse> {
	const userIdentifier = getUserIdentifier(request);
	const { success } = await rateLimit.blockUntilReady(userIdentifier, 1000 * 60);
	if (!success) {
		return NextResponse.json(
			{
				error: "Rate limit exceeded",
			},
			{
				status: 429,
			}
		);
	}

	const { issues, config } = (await request.json()) as { issues: string; config: string };

	const response = await openAI.chat.completions.create({
		model: "gpt-3.5-turbo",
		stream: false,
		messages: [
			{
				role: "user",
				content: `Given the following OpenTelemetry collector configuration enclosed in three backticks\n\n\`\`\`\n${config}\n\`\`\`\n\n and these errors enclosed in three backticks\n\n\`\`\`\n${issues}\n\`\`\`\n\n. respond with the corrected OpenTelemetry collector configuration as JSON.\nThe configuration under a JSON key called config.\nAn explanation under a JSON key called explanation.\nRetain as much of the original formatting and configuration as possible.\nDo not break the YAML indentation.`,
			},
		],
	});

	// const stream = OpenAIStream(response);
	// return new StreamingTextResponse(stream);
	const message = JSON.parse(response.choices[0]?.message.content ?? "{}");
	return NextResponse.json(message);
}
