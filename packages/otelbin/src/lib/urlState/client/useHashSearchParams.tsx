// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useState } from "react";

function getHashSearchParams(): URLSearchParams {
	if (typeof window === "undefined") {
		return new URLSearchParams();
	}

	let hash = window.location.hash;
	if (hash.startsWith("#")) {
		hash = hash.substring(1);
	}

	return new URLSearchParams(hash);
}

export const useHashSearchParams = () => {
	const [hash, setHash] = useState(getHashSearchParams());

	// There is unfortunately no other reliable way to observe hash changes...
	useEffect(() => {
		let previousHref = window.location.href;
		const observer = new MutationObserver(onChange);
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		const intervalHandle = setInterval(onChange, 200);
		window.addEventListener("hashchange", onChange);
		window.addEventListener("popstate", onChange);

		return () => {
			observer.disconnect();
			clearInterval(intervalHandle);
			window.removeEventListener("hashchange", onChange);
			window.removeEventListener("popstate", onChange);
		};

		function onChange() {
			if (previousHref !== window.location.href) {
				previousHref = window.location.href;
				setHash(getHashSearchParams());
			}
		}
	}, []);

	return hash;
};
