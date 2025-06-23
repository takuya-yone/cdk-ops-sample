#!/bin/bash
uv run black src tests --line-length=120
uv run isort src tests
uv run autopep8 --in-place --recursive src tests
uv run flake8 src tests --max-line-length=120