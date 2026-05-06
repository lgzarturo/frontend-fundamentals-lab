.DEFAULT_GOAL := help

ifeq ($(OS),Windows_NT)
  DETECTED_OS := windows
  SHELL := powershell.exe
  .SHELLFLAGS := -NoProfile -ExecutionPolicy Bypass -Command
  WINDOWS_CURDIR := $(subst /,\,$(CURDIR))
  OPEN_INDEX := Start-Process -FilePath "$(WINDOWS_CURDIR)\index.html"
  CLEAN_COVERAGE := if (Test-Path "coverage") { Remove-Item -Recurse -Force "coverage" }
else
  DETECTED_OS := posix
  SHELL := /bin/sh
  .SHELLFLAGS := -eu -c
  UNAME_S := $(shell uname -s)
  ifeq ($(UNAME_S),Darwin)
    OPEN_INDEX := open "$(CURDIR)/index.html"
  else
    OPEN_INDEX := xdg-open "$(CURDIR)/index.html"
  endif
  CLEAN_COVERAGE := rm -rf coverage
endif

.PHONY: help os install open dev test test-ui coverage version-sync \
	version-patch version-minor version-major clean-coverage

help:
	@echo "Comandos disponibles:"
	@echo "  make os              Detecta el sistema operativo usado por Make"
	@echo "  make install         Instala dependencias de desarrollo"
	@echo "  make open            Abre index.html directamente"
	@echo "  make dev             Ejecuta servidor local con npx serve ."
	@echo "  make test            Ejecuta pruebas unitarias"
	@echo "  make test-ui         Abre Vitest UI"
	@echo "  make coverage        Ejecuta pruebas con coverage"
	@echo "  make version-sync    Sincroniza version desde package.json"
	@echo "  make version-patch   Sube version patch"
	@echo "  make version-minor   Sube version minor"
	@echo "  make version-major   Sube version major"
	@echo "  make clean-coverage  Elimina el reporte coverage/"

os:
	@echo "$(DETECTED_OS)"

install:
	npm install

open:
	$(OPEN_INDEX)

dev:
	npm run dev

test:
	npm run test:run

test-ui:
	npm run test:ui

coverage:
	npm run test:coverage

version-sync:
	npm run version:sync

version-patch:
	npm run version:patch

version-minor:
	npm run version:minor

version-major:
	npm run version:major

clean-coverage:
	$(CLEAN_COVERAGE)
