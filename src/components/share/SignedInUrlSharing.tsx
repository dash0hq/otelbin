import useSWR from "swr";
import { UrlCopy } from "~/components/share/UrlCopy";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface SignedInUrlSharingProps {
	fullURL: string;
}

export function SignedInUrlSharing({ fullURL }: SignedInUrlSharingProps) {
	const { data } = useSWR<{ shortLink: string }>(`/s/new?url=${encodeURIComponent(fullURL)}`, fetcher);
	return <UrlCopy url={data?.shortLink ?? fullURL} />;
}
