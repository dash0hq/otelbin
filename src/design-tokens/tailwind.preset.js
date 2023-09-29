// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

/** @type {import('tailwindcss').Config} */
module.exports = {
	theme: {
		extend: {
			colors: {
				neutral: {
					50: "var(--color-neutral-50)",
					100: "var(--color-neutral-100)",
					150: "var(--color-neutral-150)",
					200: "var(--color-neutral-200)",
					250: "var(--color-neutral-250)",
					300: "var(--color-neutral-300)",
					350: "var(--color-neutral-350)",
					400: "var(--color-neutral-400)",
					500: "var(--color-neutral-500)",
					600: "var(--color-neutral-600)",
					700: "var(--color-neutral-700)",
					800: "var(--color-neutral-800)",
					900: "var(--color-neutral-900)",
					950: "var(--color-neutral-950)",
					white: "var(--color-neutral-white)",
					black: "var(--color-neutral-black)",
				},
				backdrop: "var(--color-backdrop)",
				success: {
					DEFAULT: "var(--color-success-default)",
					hover: "var(--color-success-hover)",
					active: "var(--color-success-active)",
					subtle: {
						DEFAULT: "var(--color-success-subtle-default)",
						hover: "var(--color-success-subtle-hover)",
						active: "var(--color-success-subtle-active)",
					},
				},
				critical: {
					DEFAULT: "var(--color-critical-default)",
					hover: "var(--color-critical-hover)",
					active: "var(--color-critical-active)",
					subtle: {
						DEFAULT: "var(--color-critical-subtle-default)",
						hover: "var(--color-critical-subtle-hover)",
						active: "var(--color-critical-subtle-active)",
					},
					contrast: "var(--color-critical-contrast)",
				},
				primary: {
					DEFAULT: "var(--color-primary-default)",
					hover: "var(--color-primary-hover)",
					active: "var(--color-primary-active)",
					subtle: {
						DEFAULT: "var(--color-primary-subtle-default)",
						hover: "var(--color-primary-subtle-hover)",
						active: "var(--color-primary-subtle-active)",
					},
					contrast: "var(--color-primary-contrast)",
				},
				icon: {
					DEFAULT: "var(--color-icon-default)",
					subtl: "var(--color-icon-subtl)",
					primary: "var(--color-icon-primary)",
					intense: "var(--color-icon-intense)",
					"on-color": "var(--color-icon-on-color)",
				},
				divider: {
					DEFAULT: "var(--color-divider-default)",
					subtle: "var(--color-divider-subtle)",
					intense: "var(--color-divider-intense)",
				},
				red: {
					50: "var(--color-red-50)",
					100: "var(--color-red-100)",
					200: "var(--color-red-200)",
					300: "var(--color-red-300)",
					400: "var(--color-red-400)",
					500: "var(--color-red-500)",
					600: "var(--color-red-600)",
					700: "var(--color-red-700)",
					800: "var(--color-red-800)",
					900: "var(--color-red-900)",
					950: "var(--color-red-950)",
				},
				blue: {
					50: "var(--color-blue-50)",
					100: "var(--color-blue-100)",
					200: "var(--color-blue-200)",
					300: "var(--color-blue-300)",
					400: "var(--color-blue-400)",
					500: "var(--color-blue-500)",
					600: "var(--color-blue-600)",
					700: "var(--color-blue-700)",
					800: "var(--color-blue-800)",
					900: "var(--color-blue-900)",
					950: "var(--color-blue-950)",
				},
				green: {
					50: "var(--color-green-50)",
					100: "var(--color-green-100)",
					200: "var(--color-green-200)",
					300: "var(--color-green-300)",
					400: "var(--color-green-400)",
					500: "var(--color-green-500)",
					600: "var(--color-green-600)",
					700: "var(--color-green-700)",
					800: "var(--color-green-800)",
					900: "var(--color-green-900)",
					950: "var(--color-green-950)",
				},
				orange: {
					50: "var(--color-orange-50)",
					100: "var(--color-orange-100)",
					200: "var(--color-orange-200)",
					300: "var(--color-orange-300)",
					400: "var(--color-orange-400)",
					500: "var(--color-orange-500)",
					600: "var(--color-orange-600)",
					700: "var(--color-orange-700)",
					800: "var(--color-orange-800)",
					900: "var(--color-orange-900)",
					950: "var(--color-orange-950)",
				},
				yellow: {
					50: "var(--color-yellow-50)",
					100: "var(--color-yellow-100)",
					200: "var(--color-yellow-200)",
					300: "var(--color-yellow-300)",
					400: "var(--color-yellow-400)",
					500: "var(--color-yellow-500)",
					600: "var(--color-yellow-600)",
					700: "var(--color-yellow-700)",
					800: "var(--color-yellow-800)",
					900: "var(--color-yellow-900)",
					950: "var(--color-yellow-950)",
				},
				violet: {
					50: "var(--color-violet-50)",
					100: "var(--color-violet-100)",
					200: "var(--color-violet-200)",
					300: "var(--color-violet-300)",
					400: "var(--color-violet-400)",
					500: "var(--color-violet-500)",
					600: "var(--color-violet-600)",
					700: "var(--color-violet-700)",
					800: "var(--color-violet-800)",
					900: "var(--color-violet-900)",
					950: "var(--color-violet-950)",
				},
				attention: {
					DEFAULT: "var(--color-attention-default)",
					hover: "var(--color-attention-hover)",
					active: "var(--color-attention-active)",
					subtle: {
						DEFAULT: "var(--color-attention-subtle-default)",
						hover: "var(--color-attention-subtle-hover)",
						active: "var(--color-attention-subtle-active)",
					},
					contrast: "var(--color-attention-contrast)",
				},
				help: {
					DEFAULT: "var(--color-help-default)",
					hover: "var(--color-help-hover)",
					active: "var(--color-help-active)",
					subtle: {
						DEFAULT: "var(--color-help-subtle-default)",
						hover: "var(--color-help-subtle-hover)",
						active: "var(--color-help-subtle-active)",
					},
				},
				input: {
					placeholder: "var(--input-color-placeholder)",
					icon: "var(--input-color-icon)",
				},
				button: {
					icon: "var(--button-color-icon)",
					"icon-hover": "var(--button-color-icon-hover)",
					"icon-active": "var(--button-color-icon-active)",
				},
				"button-cta": {
					icon: "var(--button-cta-color-icon)",
					"icon-hover": "var(--button-cta-color-icon-hover)",
					"icon-active": "var(--button-cta-color-icon-active)",
				},
				progress: {
					fg: "var(--progress-color-fg)",
				},
				slider: {
					fg: "var(--slider-color-fg)",
				},
				"button-destructive": {
					icon: "var(--button-destructive-color-icon)",
					"icon-hover": "var(--button-destructive-color-icon-hover)",
					"icon-active": "var(--button-destructive-color-icon-active)",
				},
				"dropdown-menu-item": {
					icon: "var(--dropdown-menu-item-color-icon)",
					"icon-hover": "var(--dropdown-menu-item-color-icon-hover)",
					"icon-active": "var(--dropdown-menu-item-color-icon-active)",
					destructive: {
						icon: "var(--dropdown-menu-item-destructive-color-icon)",
						"icon-active": "var(--dropdown-menu-item-destructive-color-icon-active)",
						"icon-hover": "var(--dropdown-menu-item-destructive-color-icon-hover)",
					},
				},
				"button-outline": {
					icon: "var(--button-outline-color-icon)",
					"icon-hover": "var(--button-outline-color-icon-hover)",
					"icon-active": "var(--button-outline-color-icon-active)",
				},
				"button-transparent": {
					icon: "var(--button-transparent-color-icon)",
					"icon-hover": "var(--button-transparent-color-icon-hover)",
					"icon-active": "var(--button-transparent-color-icon-active)",
				},
				checkbox: {
					icon: "var(--checkbox-color-icon)",
				},
				"sidebar-menu-item": {
					icon: "var(--sidebar-menu-item-color-icon)",
					"icon-active": "var(--sidebar-menu-item-color-icon-active)",
					"icon-hover": "var(--sidebar-menu-item-color-icon-hover)",
				},
				"filter-nav-bar-item": {
					icon: "var(--filter-nav-bar-item-color-icon)",
					"icon-active": "var(--filter-nav-bar-item-color-icon-active)",
					"icon-hover": "var(--filter-nav-bar-item-color-icon-hover)",
					outline: {
						icon: "var(--filter-nav-bar-item-outline-color-icon)",
						"icon-active": "var(--filter-nav-bar-item-outline-color-icon-active)",
						"icon-hover": "var(--filter-nav-bar-item-outline-color-icon-hover)",
					},
				},
				switch: {
					icon: "var(--switch-color-icon)",
				},
				severe: {
					active: "var(--color-severe-active)",
					DEFAULT: "var(--color-severe-default)",
					hover: "var(--color-severe-hover)",
					subtle: {
						active: "var(--color-severe-subtle-active)",
						DEFAULT: "var(--color-severe-subtle-default)",
						hover: "var(--color-severe-subtle-hover)",
					},
					contrast: "var(--color-severe-contrast)",
				},
			},
			textColor: {
				subtl: "var(--color-text-subtl)",
				default: "var(--color-text-default)",
				intense: "var(--color-text-intense)",
				disabled: "var(--color-text-disabled)",
				primary: {
					DEFAULT: "var(--color-text-primary-default)",
					hover: "var(--color-text-primary-hover)",
					active: "var(--color-text-primary-active)",
				},
				critical: {
					DEFAULT: "var(--color-text-critical-default)",
					hover: "var(--color-text-critical-hover)",
					active: "var(--color-text-critical-active)",
				},
				success: {
					DEFAULT: "var(--color-text-success-default)",
					hover: "var(--color-text-success-hover)",
					active: "var(--color-text-success-active)",
				},
				input: "var(--input-color-text)",
				button: {
					DEFAULT: "var(--button-color-text)",
					hover: "var(--button-color-text-hover)",
					active: "var(--button-color-text-active)",
				},
				"button-cta": {
					DEFAULT: "var(--button-cta-color-text)",
					hover: "var(--button-cta-color-text-hover)",
					active: "var(--button-cta-color-text-active)",
				},
				"button-destructive": {
					DEFAULT: "var(--button-destructive-color-text)",
					hover: "var(--button-destructive-color-text-hover)",
					active: "var(--button-destructive-color-text-active)",
				},
				tooltip: "var(--tooltip-color-text)",
				"dropdown-menu-item": {
					DEFAULT: "var(--dropdown-menu-item-color-text)",
					hover: "var(--dropdown-menu-item-color-text-hover)",
					active: "var(--dropdown-menu-item-color-text-active)",
					destructive: {
						DEFAULT: "var(--dropdown-menu-item-destructive-color-text)",
						active: "var(--dropdown-menu-item-destructive-color-text-active)",
						hover: "var(--dropdown-menu-item-destructive-color-text-hover)",
					},
				},
				shortcut: "var(--shortcut-color-text)",
				inverse: {
					DEFAULT: "var(--color-text-inverse-default)",
					disabled: "var(--color-text-inverse-disabled)",
					intense: "var(--color-text-inverse-intense)",
					subtl: "var(--color-text-inverse-subtl)",
				},
				"on-color": "var(--color-text-on-color)",
				tag: "var(--tag-color-text)",
				badge: {
					DEFAULT: "var(--badge-color-text)",
					subtl: "var(--badge-subtl-color-text)",
				},
				"button-outline": {
					DEFAULT: "var(--button-outline-color-text)",
					hover: "var(--button-outline-color-text-hover)",
					active: "var(--button-outline-color-text-active)",
				},
				"button-transparent": {
					DEFAULT: "var(--button-transparent-color-text)",
					hover: "var(--button-transparent-color-text-hover)",
					active: "var(--button-transparent-color-text-active)",
				},
				attention: {
					DEFAULT: "var(--color-text-attention-default)",
					hover: "var(--color-text-attention-hover)",
					active: "var(--color-text-attention-active)",
				},
				"sidebar-menu-item": {
					DEFAULT: "var(--sidebar-menu-item-color-text)",
					active: "var(--sidebar-menu-item-color-text-active)",
					hover: "var(--sidebar-menu-item-color-text-hover)",
				},
				"filter-nav-bar-item": {
					DEFAULT: "var(--filter-nav-bar-item-color-text)",
					active: "var(--filter-nav-bar-item-color-text-active)",
					hover: "var(--filter-nav-bar-item-color-text-hover)",
					outline: {
						DEFAULT: "var(--filter-nav-bar-item-outline-color-text)",
						active: "var(--filter-nav-bar-item-outline-color-text-active)",
						hover: "var(--filter-nav-bar-item-outline-color-text-hover)",
					},
				},
				avatar: "var(--avatar-text)",
				toast: {
					DEFAULT: "var(--toast-color-text)",
					destructive: "var(--toast-destructive-color-text)",
				},
				severe: {
					active: "var(--color-text-severe-active)",
					hover: "var(--color-text-severe-hover)",
					DEFAULT: "var(--color-text-severe-default)",
				},
				map: {
					node: {
						label: {
							DEFAULT: "var(--map-node-label-color-text)",
							hover: "var(--map-node-label-color-text-hover)",
							selected: "var(--map-node-label-color-text-selected)",
						},
					},
				},
			},
			backgroundColor: {
				default: "var(--color-bg-default)",
				strong: {
					DEFAULT: "var(--color-bg-strong-default)",
					hover: "var(--color-bg-strong-hover)",
					active: "var(--color-bg-strong-active)",
				},
				hover: "var(--color-bg-hover)",
				active: "var(--color-bg-active)",
				input: "var(--input-color-bg)",
				button: {
					DEFAULT: "var(--button-color-bg)",
					hover: "var(--button-color-bg-hover)",
					active: "var(--button-color-bg-active)",
				},
				"button-cta": {
					DEFAULT: "var(--button-cta-color-bg)",
					hover: "var(--button-cta-color-bg-hover)",
					active: "var(--button-cta-color-bg-active)",
				},
				app: "var(--color-bg-app)",
				"dropdown-menu-item": {
					DEFAULT: "var(--dropdown-menu-item-color-bg)",
					hover: "var(--dropdown-menu-item-color-bg-hover)",
					active: "var(--dropdown-menu-item-color-bg-active)",
					destructive: {
						DEFAULT: "var(--dropdown-menu-item-destructive-color-bg)",
						active: "var(--dropdown-menu-item-destructive-color-bg-active)",
						hover: "var(--dropdown-menu-item-destructive-color-bg-hover)",
					},
				},
				"dropdown-menu": "var(--dropdown-menu-color-bg)",
				progress: "var(--progress-color-bg)",
				slider: "var(--slider-color-bg)",
				"slider-indicator": "var(--slider-indicator-color-bg)",
				"button-destructive": {
					DEFAULT: "var(--button-destructive-color-bg)",
					active: "var(--button-destructive-color-bg-active)",
					hover: "var(--button-destructive-color-bg-hover)",
				},
				tooltip: "var(--tooltip-color-bg)",
				tag: {
					DEFAULT: "var(--tag-color-bg)",
					hover: "var(--tag-color-bg-hover)",
					active: "var(--tag-color-bg-active)",
				},
				checkbox: {
					DEFAULT: "var(--checkbox-color-bg)",
					hover: "var(--checkbox-color-bg-hover)",
					active: "var(--checkbox-color-bg-active)",
				},
				popover: "var(--popover-color-bg)",
				modal: "var(--modal-color-bg)",
				shortcut: "var(--shortcut-color-bg)",
				badge: {
					DEFAULT: "var(--badge-color-bg)",
					subtl: "var(--badge-subtl-color-bg)",
				},
				"button-outline": {
					DEFAULT: "var(--button-outline-color-bg)",
					active: "var(--button-outline-color-bg-active)",
					hover: "var(--button-outline-color-bg-hover)",
				},
				"button-transparent": {
					DEFAULT: "var(--button-transparent-color-bg)",
					hover: "var(--button-transparent-color-bg-hover)",
					active: "var(--button-transparent-color-bg-active)",
				},
				card: {
					DEFAULT: "var(--card-color-bg)",
					subdued: "var(--card-subdued-color-bg)",
				},
				"sidebar-menu": "var(--sidebar-menu-color-bg)",
				"sidebar-menu-item": {
					DEFAULT: "var(--sidebar-menu-item-color-bg)",
					active: "var(--sidebar-menu-item-color-bg-active)",
					hover: "var(--sidebar-menu-item-color-bg-hover)",
				},
				table: {
					row: {
						DEFAULT: "var(--table-row-color-bg)",
						hover: "var(--table-row-color-bg-hover)",
						active: "var(--table-row-color-bg-active)",
						selected: "var(--table-row-color-bg-selected)",
						"selected-hover": "var(--table-row-color-bg-selected-hover)",
						"selected-active": "var(--table-row-color-bg-selected-active)",
					},
					DEFAULT: "var(--table-color-bg)",
					"row-nested": {
						active: "var(--table-row-nested-color-bg-active)",
						hover: "var(--table-row-nested-color-bg-hover)",
						DEFAULT: "var(--table-row-nested-color-bg)",
					},
				},
				"hover-card": "var(--hover-card-color-bg)",
				"filter-nav-bar-item": {
					DEFAULT: "var(--filter-nav-bar-item-color-bg)",
					active: "var(--filter-nav-bar-item-color-bg-active)",
					hover: "var(--filter-nav-bar-item-color-bg-hover)",
					outline: {
						active: "var(--filter-nav-bar-item-outline-color-bg-active)",
						DEFAULT: "var(--filter-nav-bar-item-outline-color-bg)",
						hover: "var(--filter-nav-bar-item-outline-color-bg-hover)",
					},
				},
				avatar: "var(--avatar-bg)",
				switch: {
					DEFAULT: "var(--switch-color-bg)",
					hover: "var(--switch-color-bg-hover)",
					active: "var(--switch-color-bg-active)",
				},
				toast: {
					DEFAULT: "var(--toast-color-bg)",
					destructive: "var(--toast-destructive-color-bg)",
				},
				sheet: "var(--sheet-color-bg)",
				inset: "var(--color-bg-inset)",
				alert: {
					DEFAULT: "var(--alert-color-bg)",
					destructive: "var(--alert-destructive-color-bg)",
				},
				"alert-dialog": "var(--alert-dialog-color-bg)",
				map: {
					node: {
						label: {
							DEFAULT: "var(--map-node-label-color-bg)",
							hover: "var(--map-node-label-color-bg-hover)",
							selected: "var(--map-node-label-color-bg-selected)",
						},
					},
				},
			},
			borderColor: {
				subtle: "var(--color-border-subtle)",
				default: "var(--color-border-default)",
				intense: "var(--color-border-intense)",
				input: {
					DEFAULT: "var(--input-color-border)",
					active: "var(--input-color-border-active)",
					hover: "var(--input-color-border-hover)",
					error: "var(--input-color-border-error)",
				},
				"button-cta": {
					DEFAULT: "var(--button-cta-color-border)",
					hover: "var(--button-cta-color-border-hover)",
					active: "var(--button-cta-color-border-active)",
				},
				"dropdown-menu": "var(--dropdown-menu-color-border)",
				"slider-indicator": "var(--slider-indicator-color-border)",
				"button-destructive": {
					DEFAULT: "var(--button-destructive-color-border)",
					hover: "var(--button-destructive-color-border-hover)",
					active: "var(--button-destructive-color-border-active)",
				},
				tag: "var(--tag-color-border)",
				checkbox: {
					DEFAULT: "var(--checkbox-color-border)",
					hover: "var(--checkbox-color-border-hover)",
					active: "var(--checkbox-color-border-active)",
				},
				popover: "var(--popover-color-border)",
				modal: "var(--modal-color-border)",
				button: {
					hover: "var(--button-color-border-hover)",
					active: "var(--button-color-border-active)",
					DEFAULT: "var(--button-color-border)",
				},
				"button-outline": {
					DEFAULT: "var(--button-outline-color-border)",
					active: "var(--button-outline-color-border-active)",
					hover: "var(--button-outline-color-border-hover)",
				},
				"button-transparent": {
					DEFAULT: "var(--button-transparent-color-border)",
					hover: "var(--button-transparent-color-border-hover)",
					active: "var(--button-transparent-color-border-active)",
				},
				card: {
					DEFAULT: "var(--card-color-border)",
					subdued: "var(--card-subdued-color-border)",
				},
				"sidebar-menu": "var(--sidebar-menu-color-border)",
				table: {
					row: "var(--table-row-color-border)",
					DEFAULT: "var(--table-color-border)",
				},
				"hover-card": "var(--hover-card-color-border)",
				"filter-nav-bar-item": {
					DEFAULT: "var(--filter-nav-bar-item-color-border)",
					active: "var(--filter-nav-bar-item-color-border-active)",
					hover: "var(--filter-nav-bar-item-color-border-hover)",
					outline: {
						DEFAULT: "var(--filter-nav-bar-item-outline-color-border)",
						hover: "var(--filter-nav-bar-item-outline-color-border-hover)",
						active: "var(--filter-nav-bar-item-outline-color-border-active)",
					},
				},
				avatar: "var(--avatar-border)",
				switch: {
					DEFAULT: "var(--switch-color-border)",
					hover: "var(--switch-color-border-hover)",
					active: "var(--switch-color-border-active)",
				},
				toast: {
					DEFAULT: "var(--toast-color-border)",
					destructive: "var(--toast-destructive-color-border)",
				},
				sheet: "var(--sheet-color-border)",
				critical: "var(--color-border-critical)",
				success: "var(--color-border-success)",
				attention: "var(--color-border-attention)",
				severe: "var(--color-border-severe)",
				alert: {
					DEFAULT: "var(--alert-color-border)",
					destructive: "var(--alert-destructive-color-border)",
				},
				"alert-dialog": "var(--alert-dialog-color-border)",
				primary: "var(--color-border-primary)",
			},
			fontFamily: {
				default: "var(--font-families-default)",
				code: "var(--font-families-code)",
			},
			fontSize: {
				xs: "var(--font-sizes-xs)",
				sm: "var(--font-sizes-sm)",
				md: "var(--font-sizes-md)",
				lg: "var(--font-sizes-lg)",
				xl: "var(--font-sizes-xl)",
				"2xl": "var(--font-sizes-2xl)",
				"3xl": "var(--font-sizes-3xl)",
				"4xl": "var(--font-sizes-4xl)",
				"5xl": "var(--font-sizes-5xl)",
				"6xl": "var(--font-sizes-6xl)",
				"7xl": "var(--font-sizes-7xl)",
				"8xl": "var(--font-sizes-8xl)",
			},
			fontWeight: {
				regular: "var(--font-weights-regular)",
				medium: "var(--font-weights-medium)",
				bold: "var(--font-weights-bold)",
			},
			boxShadow: {
				xl: "var(--shadow-xl)",
				"2xl": "var(--shadow-2xl)",
				lg: "var(--shadow-lg)",
				md: "var(--shadow-md)",
				sm: "var(--shadow-sm)",
				xs: "var(--shadow-xs)",
			},
			textDecoration: {
				underline: "var(--text-decoration-underline)",
				overline: "var(--text-decoration-overline)",
				"line-through": "var(--text-decoration-line-through)",
				"no-underline": "var(--text-decoration-no-underline)",
			},
			borderRadius: {
				none: "var(--border-radius-none)",
				xs: "var(--border-radius-xs)",
				sm: "var(--border-radius-sm)",
				md: "var(--border-radius-md)",
				lg: "var(--border-radius-lg)",
				xl: "var(--border-radius-xl)",
				"2xl": "var(--border-radius-2xl)",
				"3xl": "var(--border-radius-3xl)",
				full: "var(--border-radius-full)",
				input: "var(--input-border-radius)",
				button: "var(--button-border-radius)",
				progress: "var(--progress-border-radius)",
				"dropdown-menu": "var(--dropdown-menu-border-radius)",
				tag: "var(--tag-border-radius)",
				"dropdown-menu-item": "var(--dropdown-menu-item-border-radius)",
				popover: "var(--popover-border-radius)",
				modal: "var(--modal-border-radius)",
				"sidebar-menu-item": "var(--sidebar-menu-item-border-radius)",
				"hover-card": "var(--hover-card-border-radius)",
				"filter-nav-bar-item": "var(--filter-nav-bar-item-border-radius)",
				"avatar-personal": "var(--avatar-personal-border-radius)",
				switch: "var(--switch-border-radius)",
				toast: "var(--toast-border-radius)",
				"avatar-organization": "var(--avatar-organization-border-radius)",
				card: "var(--card-border-radius)",
				checkbox: "var(--checkbox-border-radius)",
				"radio-button": "var(--radio-button-border-radius)",
				badge: "var(--badge-border-radius)",
				alert: "var(--alert-border-radius)",
				"alert-dialog": "var(--alert-dialog-border-radius)",
			},
			borderWidth: {
				0: "var(--border-width-0)",
				1: "var(--border-width-1)",
				2: "var(--border-width-2)",
				4: "var(--border-width-4)",
				8: "var(--border-width-8)",
				button: "var(--button-border-width)",
				tag: "var(--tag-border-width)",
				"filter-nav-bar-item": "var(--filter-nav-bar-item-border-width)",
				avatar: "var(--avatar-border-width)",
				switch: "var(--switch-border-width)",
				"dropdown-menu": "var(--dropdown-menu-border-width)",
				toast: "var(--toast-border-width)",
				"hover-card": "var(--hover-card-border-width)",
				input: "var(--input-border-width)",
				checkbox: "var(--checkbox-border-width)",
				"radio-button": "var(--radio-button-border-width)",
				card: "var(--card-border-width)",
				badge: "var(--badge-border-width)",
				alert: "var(--alert-border-width)",
				modal: "var(--modal-border-width)",
				"alert-dialog": "var(--alert-dialog-border-width)",
			},
		},
	},
};
