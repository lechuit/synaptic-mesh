# Tiny operator-run passive pilot runner v0.16.1

The runner wraps passive live shadow redaction and no-enforcement invariants for one local sample at a time. It accepts only --input plus either --stdout or an evidence/ JSON --output. It rejects --watch, --daemon, --network, --execute, --allow, --block, --approve, --enforce, --authorize and any batch/multi-input options before reading input.
