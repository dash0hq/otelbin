// SPDX-FileCopyrightText: 2026 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import Node from "./Node";

jest.mock("~/contexts/EditorContext", () => ({
	useEditorRef: () => ({ current: null }),
	useFocus: () => ({ isFocused: undefined }),
}));

jest.mock("../FlowClick", () => ({
	FlowClick: jest.fn(),
}));

jest.mock("~/components/assets/svg/connector.svg", () => ({
	__esModule: true,
	default: () => <svg aria-label="connector" />,
}));

describe("Node", () => {
	it("renders the complete component instance name after the first slash", () => {
		render(
			<Node
				data={{
					label: "foo/bar/baz",
					parentNode: "traces",
					type: "processors",
					id: "traces-processor-foo/bar/baz",
				}}
				icon={<span aria-label="processor" />}
				type="processor"
			/>
		);

		expect(screen.queryByText("foo")).not.toBeNull();
		expect(screen.queryByText("bar/baz")).not.toBeNull();
		expect(screen.queryByText("bar")).toBeNull();
	});
});
