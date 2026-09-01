// SPDX-FileCopyrightText: 2025 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react";

import { Github, Slack } from "./brand-icons";

// These two icons no longer ship with lucide-react (removed in 1.0 along with the rest of the
// brand set), so they are rebuilt locally. Call sites pass lucide props such as `size` and
// `color`, so pin that the local components keep honouring them.
describe.each([
	["Github", Github],
	["Slack", Slack],
])("%s", (name, Icon) => {
	it("renders an svg that inherits the current text color", () => {
		const { container } = render(<Icon />);

		const svg = container.querySelector("svg");
		expect(svg).not.toBeNull();
		expect(svg?.getAttribute("stroke")).toBe("currentColor");
		expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
		expect(svg?.querySelectorAll("path, rect").length).toBeGreaterThan(0);
	});

	it("honours the lucide size prop on both dimensions", () => {
		const { container } = render(<Icon size="0.875rem" />);

		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("width")).toBe("0.875rem");
		expect(svg?.getAttribute("height")).toBe("0.875rem");
	});

	it("honours the lucide color prop", () => {
		const { container } = render(<Icon color="#9CA2AB" />);

		expect(container.querySelector("svg")?.getAttribute("stroke")).toBe("#9CA2AB");
	});
});
