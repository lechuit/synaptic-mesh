
# Framework Adapter Implementation Hazard Catalog v0.8.2

Status: implementation hazard catalog only. This is a NO-GO catalog for real framework integration work; it is not an implementation plan and does not authorize adapter code.

## Invariant

`successEvidenceWrittenForHazards: 0`. Hazard cases must not produce success evidence. They are recorded only to preserve boundaries before any later human decision.

## Hazard catalog

| ID | Hazard | Description | Required response |
| --- | --- | --- | --- |
| H01 | sdk_import_creep | Importing MCP/LangGraph/A2A/GitHub SDK code under the guise of types or examples. | no success evidence; keep implementation blocked |
| H02 | server_client_surface_creep | Adding MCP server/client or bot/webhook scaffolding while calling it inert. | no success evidence; keep implementation blocked |
| H03 | network_convenience_path | Adding URL, HTTP, webhook, fetch, clone, or remote resource support. | no success evidence; keep implementation blocked |
| H04 | resource_fetch_alias | Treating a framework resource read as equivalent to local fixture validation. | no success evidence; keep implementation blocked |
| H05 | tool_call_alias | Treating a framework tool call as a validation helper. | no success evidence; keep implementation blocked |
| H06 | runtime_graph_execution | Executing a graph, agent loop, protocol handler, or framework runtime. | no success evidence; keep implementation blocked |
| H07 | live_traffic_shadowing | Observing live framework traffic rather than explicit local already-redacted packets. | no success evidence; keep implementation blocked |
| H08 | watcher_daemon_drift | Adding watch, daemon, webhook, background polling, or automatic ingestion. | no success evidence; keep implementation blocked |
| H09 | agent_consumption_drift | Writing output intended to be consumed directly by another agent as policy or instruction. | no success evidence; keep implementation blocked |
| H10 | machine_readable_policy_drift | Emitting allow/deny/route policy in a machine-actionable format. | no success evidence; keep implementation blocked |
| H11 | approval_path_drift | Adding approval, escalation, or consent emission paths. | no success evidence; keep implementation blocked |
| H12 | block_allow_drift | Adding block or allow decisions, even as advisory metadata. | no success evidence; keep implementation blocked |
| H13 | authorization_language_drift | Using language that claims authorization, safety certification, or production readiness. | no success evidence; keep implementation blocked |
| H14 | enforcement_drift | Adding enforcement hooks or runtime gates. | no success evidence; keep implementation blocked |
| H15 | memory_config_write_drift | Writing memory, config, registry, policy, or environment state. | no success evidence; keep implementation blocked |
| H16 | publication_automation_drift | Posting or preparing automatic external publication, comments, releases, or issues. | no success evidence; keep implementation blocked |
| H17 | raw_secret_persistence | Persisting raw, unredacted, secret-like, private path, config, memory, or approval text. | no success evidence; keep implementation blocked |
| H18 | fixture_boundary_loss | Accepting inputs that are not explicit local already-redacted packets. | no success evidence; keep implementation blocked |
| H19 | path_traversal_escape | Allowing output/input paths outside the fixed evidence/fixture boundary. | no success evidence; keep implementation blocked |
| H20 | success_evidence_for_hazards | Recording hazard cases as success evidence instead of expected non-implementation evidence. | no success evidence; keep implementation blocked |
| H21 | negative_control_relaxation | Changing negative controls to permit convenience paths. | no success evidence; keep implementation blocked |
| H22 | schema_optional_capability_true | Allowing operational booleans to be omitted or true. | no success evidence; keep implementation blocked |
| H23 | reviewer_runbook_overclaim | Telling reviewers a dry run authorizes framework integration. | no success evidence; keep implementation blocked |
| H24 | dependency_install_creep | Adding framework dependencies, plugins, generated clients, or codegen. | no success evidence; keep implementation blocked |
| H25 | tag_release_overclaim | Publishing release text that implies a real adapter exists or integration is authorized. | no success evidence; keep implementation blocked |

## Hard boundary

No real framework adapter. No SDK import. No MCP server/client. No LangGraph SDK. No A2A runtime. No GitHub bot. No webhook. No network. No resource fetch. No tool execution. No runtime. No live traffic. No watcher/daemon. No memory/config write. No external publication. No agent consumption. No machine-readable policy. No approval, block/allow, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:framework-adapter-implementation-hazard-catalog-v082
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.2
```
