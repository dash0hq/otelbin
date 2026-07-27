// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import type { NextFont } from "next/dist/compiled/@next/font";

const trackMock = jest.fn();
jest.mock("@vercel/analytics", () => ({
	track: (...args: unknown[]) => trackMock(...args),
}));

// EditorContext pulls in monaco-yaml, which is ESM-only and jest cannot parse.
// We do not exercise the editor stack in this test -- only the two React
// contexts -- so stubbing the ESM leaf is sufficient.
jest.mock("monaco-yaml", () => ({ configureMonacoYaml: () => undefined }));

import EditorTopBar from "./EditorTopBar";
import { TooltipProvider } from "~/components/tooltip";
import { BreadcrumbsContext, ViewModeContext, type ViewMode } from "~/contexts/EditorContext";

const font = { className: "font-mono" } as NextFont;

const writeTextMock = jest.fn<(v: string) => Promise<void>>();
const createObjectURLMock = jest.fn<(b: Blob) => string>();

beforeEach(() => {
	trackMock.mockReset();
	writeTextMock.mockReset().mockResolvedValue(undefined);
	createObjectURLMock.mockReset().mockReturnValue("blob:mock-url");

	// jsdom does not provide navigator.clipboard or URL.createObjectURL; stub both.
	Object.defineProperty(navigator, "clipboard", {
		value: { writeText: writeTextMock },
		configurable: true,
	});
	Object.defineProperty(URL, "createObjectURL", {
		value: createObjectURLMock,
		configurable: true,
	});
});

function renderTopBar({
	config = "receivers:\n  otlp:\n",
	path = "",
	setViewMode = jest.fn<(m: ViewMode) => void>(),
}: {
	config?: string;
	path?: string;
	setViewMode?: (m: ViewMode) => void;
} = {}) {
	render(
		<TooltipProvider>
			<ViewModeContext.Provider value={{ viewMode: "both", setViewMode }}>
				<BreadcrumbsContext.Provider value={{ path, setPath: jest.fn() }}>
					<EditorTopBar config={config} font={font} />
				</BreadcrumbsContext.Provider>
			</ViewModeContext.Provider>
		</TooltipProvider>
	);
	return { setViewMode };
}

describe("EditorTopBar", () => {
	it("copies the current config to the clipboard when the copy button is clicked", () => {
		const config = "receivers:\n  otlp:\n";
		renderTopBar({ config });

		fireEvent.click(screen.getByRole("button", { name: /copy editor content/i }));

		expect(writeTextMock).toHaveBeenCalledWith(config);
		expect(trackMock).toHaveBeenCalledWith("Copied Config To Clipboard");
	});

	it("triggers a download containing the config as a Blob when the download button is clicked", async () => {
		const config = "exporters:\n  otlp/example:\n";
		renderTopBar({ config });

		fireEvent.click(screen.getByRole("button", { name: /download editor content/i }));

		expect(createObjectURLMock).toHaveBeenCalledTimes(1);
		const blob = createObjectURLMock.mock.calls[0]![0];
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.type).toBe("text/plain");
		const text = await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.readAsText(blob);
		});
		expect(text).toBe(config);
		expect(trackMock).toHaveBeenCalledWith("Download Config", { location: "Editor" });
	});

	it("switches the view mode to 'pipeline' when the hide-editor button is clicked", () => {
		const { setViewMode } = renderTopBar();

		fireEvent.click(screen.getByRole("button", { name: /hide editor/i }));

		expect(setViewMode).toHaveBeenCalledWith("pipeline");
	});
});
