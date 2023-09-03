import { NextResponse } from "next/server";
import { getShortLinkPersistenceKey, redis } from "~/app/s/new/route";

export async function GET(request: Request, { params }: { params: { id: string } }) {
	const shortLink = await redis.get<string>(getShortLinkPersistenceKey(params.id));
	return NextResponse.redirect(shortLink || "/", {
		headers: {
			"Cache-Control": "public, max-age=3600, stale-while-revalidate=3600, stale-if-error=3600",
		},
	});
}
