# Operator Review Outcome Capture Runner v0.24.1

Adds the local one-shot runner for capturing operator value feedback from an explicit v0.23 queue artifact plus an explicit operator outcome artifact. The runner reads local files only and prints a human-readable report.

Operator notes are redacted before persistence into evidence. The runner does not execute tools, fetch resources, write memory/config, or create external effects.
