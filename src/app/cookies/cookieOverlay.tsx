// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from "react";
import { toast } from "../../components/use-toast";
import { ToastAction } from "../../components/toast";
import { setCookie, setOptOutCookie, getCookie } from "./CookieManager";
import { useRouter } from "next/navigation";

export const CookieOverlay = (): JSX.Element => {
	const router = useRouter();

	useEffect(() => {
		const handleCooke = async () => {
			const cookieValue = await getCookie?.();
			if (!cookieValue) {
				setTimeout(() => {
					toast({
						title: "Cookie Settings",
						description: "We use cookies to improve OTelBin.",
						duration: 20000,
						action: (
							<div className="flex items-center gap-x-2 min-w-[130px] justify-end z-40">
								<form action={setOptOutCookie}>
									<ToastAction
										type="submit"
										className="text-xs flex-nowrap underline cursor-pointer border-none min-w-max"
										altText="OptOut"
									>
										Opt-out
									</ToastAction>
								</form>
								<form action={setCookie}>
									<ToastAction type="submit" altText="Accept">
										Accept
									</ToastAction>
								</form>
							</div>
						),
					});
				}, 2000);
				router.refresh();
			}
		};
		handleCooke();
	}, [router]);
	return <></>;
};
