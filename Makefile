# OTelBin — top-level make targets across the three packages.
# Run `make` (or `make help`) to see available targets.

.PHONY: help \
        install install-otelbin install-validation install-validation-image \
        test test-otelbin test-validation test-validation-image \
        lint lint-otelbin \
        dev \
        build build-otelbin build-validation build-validation-image \
        coverage

OTELBIN_DIR             := packages/otelbin
VALIDATION_DIR          := packages/otelbin-validation
VALIDATION_IMAGE_DIR    := packages/otelbin-validation-image

help:
	@echo "OTelBin — top-level targets"
	@echo ""
	@echo "  make install        Install deps in every package (npm ci)"
	@echo "  make test           Run tests in every package"
	@echo "  make lint           Run lint (otelbin app)"
	@echo "  make dev            Start the otelbin dev server"
	@echo "  make build          Build every package"
	@echo "  make coverage       Run the otelbin coverage report"
	@echo ""
	@echo "Per-package targets (faster feedback):"
	@echo "  make install-otelbin | install-validation | install-validation-image"
	@echo "  make test-otelbin    | test-validation    | test-validation-image"
	@echo "  make build-otelbin   | build-validation   | build-validation-image"
	@echo "  make lint-otelbin"

# ---- install -----------------------------------------------------------------

install: install-otelbin install-validation install-validation-image

install-otelbin:
	cd $(OTELBIN_DIR) && npm ci

install-validation:
	cd $(VALIDATION_DIR) && npm ci

install-validation-image:
	cd $(VALIDATION_IMAGE_DIR) && npm ci

# ---- test --------------------------------------------------------------------

test: test-otelbin test-validation-image test-validation

test-otelbin:
	cd $(OTELBIN_DIR) && npm test

test-validation-image:
	cd $(VALIDATION_IMAGE_DIR) && npm test

test-validation:
	cd $(VALIDATION_DIR) && npm test

# ---- lint --------------------------------------------------------------------

lint: lint-otelbin

lint-otelbin:
	cd $(OTELBIN_DIR) && npm run lint

# ---- dev ---------------------------------------------------------------------

dev:
	cd $(OTELBIN_DIR) && npm run dev

# ---- build -------------------------------------------------------------------

build: build-otelbin build-validation-image build-validation

build-otelbin:
	cd $(OTELBIN_DIR) && npm run build

build-validation-image:
	cd $(VALIDATION_IMAGE_DIR) && npm run build

build-validation:
	cd $(VALIDATION_DIR) && npm run build

# ---- coverage ----------------------------------------------------------------

coverage:
	cd $(OTELBIN_DIR) && npm run coverage
