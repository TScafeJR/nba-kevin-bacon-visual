# Run `make` to list targets. Yarn comes from corepack, pinned by "packageManager" in package.json.

YARN := corepack yarn
export COREPACK_ENABLE_DOWNLOAD_PROMPT := 0

NODE_WANT := $(shell cat .nvmrc)
NODE_HAVE := $(shell node -v 2>/dev/null | sed 's/^v//')
ifneq ($(NODE_WANT),$(NODE_HAVE))
$(warning Node $(NODE_HAVE) is active but .nvmrc pins $(NODE_WANT); run `nvm install && nvm use`)
endif

.DEFAULT_GOAL := help
.PHONY: help install dev dev-web dev-api api build preview preview-web test test-stories test-watch lint lint-fix typecheck check storybook storybook-build audit data clean

help: ## Show this help
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

node_modules: package.json yarn.lock
	$(YARN) install
	@touch node_modules

install: ## Install dependencies
	$(YARN) install

dev: node_modules ## Run the app at http://localhost:3000 and the API it proxies to on :3001
	@$(MAKE) --no-print-directory -j 2 dev-web dev-api

dev-web:
	$(YARN) dev

dev-api:
	$(YARN) api:dev

api: node_modules ## Run the API alone at http://localhost:3001
	$(YARN) api

build: node_modules ## Build the app into dist/
	$(YARN) build

preview: build ## Serve the built app at http://localhost:4173, with the API
	@$(MAKE) --no-print-directory -j 2 preview-web api

preview-web:
	$(YARN) preview

test: node_modules ## Run the unit tests once
	$(YARN) test

test-stories: node_modules ## Play every story in headless Chromium, with accessibility checks
	$(YARN) playwright install chromium
	$(YARN) test:stories

test-watch: node_modules ## Run the unit tests on every change
	$(YARN) test:watch

lint: node_modules ## Lint the code
	$(YARN) lint

lint-fix: node_modules ## Lint the code and fix what can be fixed
	$(YARN) lint:fix

typecheck: node_modules ## Type-check the code
	$(YARN) typecheck

check: lint typecheck test ## Lint, type-check and test

storybook: node_modules ## Run Storybook at http://localhost:6007, with its MCP server at /mcp
	$(YARN) storybook

storybook-build: node_modules ## Build Storybook into storybook-static/
	$(YARN) build-storybook

data: node_modules ## Rebuild players, stats and photo links (see scripts/build-player-data.ts)
	$(YARN) data

audit: node_modules ## Check dependencies for known vulnerabilities
	$(YARN) audit

clean: ## Remove the app build and caches
	rm -rf dist node_modules/.vite node_modules/.cache
