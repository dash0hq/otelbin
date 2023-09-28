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

	useEffect(() => {
		function onHashChange() {
			setHash(getHashSearchParams());
		}

		window.addEventListener("hashchange", onHashChange);
		return () => {
			window.removeEventListener("hashchange", onHashChange);
		};
	}, []);

	return hash;
};
