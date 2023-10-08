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
						className: "text-[10px] p-3",
						title: "Cookie Settings",
						description: "We use cookies to improve OTelBin.",
						duration: 20000,
						action: (
							<div className="flex items-center justify-end">
								<form action={setOptOutCookie}>
									<ToastAction
										type="submit"
										className="text-[10px] flex-nowrap underline border-none min-w-max"
										altText="OptOut"
									>
										Opt-out
									</ToastAction>
								</form>
								<form action={setCookie}>
									<ToastAction type="submit" altText="Accept" className="text-[10px]">
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
