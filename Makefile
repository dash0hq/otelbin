# OTelBin — top-level make targets across the three packages.
# Run `make` (or `make help`) to see available targets.

.PHONY: help \
        install install-otelbin install-validation install-validation-image \
        test test-otelbin test-validation test-validation-synth test-validation-integration test-validation-image \
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
	@echo ""
	@echo "  make test-validation-synth          CDK synth check for the"
	@echo "                                      validation stack"
	@echo "                                      (needs some /tmp headroom)"
	@echo "  make test-validation-integration    Live-AWS integration test"
	@echo "                                      (requires API_GATEWAY_URL,"
	@echo "                                      VALIDATION_API_KEY)"

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

# Fast, environment-independent unit tests only. The package's own `npm test`
# additionally runs test/stack.test.ts (a CDK synth test that needs headroom
# on the filesystem) and test/main.test.ts (a live-AWS integration test that
# needs API_GATEWAY_URL and VALIDATION_API_KEY). See the -synth and
# -integration targets for those.
test-validation:
	cd $(VALIDATION_DIR) && npx jest src/ --no-coverage

test-validation-synth:
	cd $(VALIDATION_DIR) && npx jest test/stack.test.ts --no-coverage

test-validation-integration:
	cd $(VALIDATION_DIR) && npx jest test/main.test.ts --no-coverage

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
