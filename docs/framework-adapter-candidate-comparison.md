
# Framework adapter candidate comparison v0.8.1

Status: design comparison only. This document does not authorize implementation.

| Candidate | Why useful | Main risk | design allowed | implementation allowed |
| --- | --- | --- | --- | --- |
| MCP-like | Standard context/tool protocol shape; useful for future read-only adapter analysis. | High risk of tools, resources, network, server/client behavior. | yes | implementation allowed: no |
| LangGraph-like | Useful graph/pipeline vocabulary for handoff flow analysis. | High risk of runtime graph execution. | maybe | implementation allowed: no |
| A2A-like | Useful for agent-to-agent boundary analysis. | High risk of task authority and delegation paths. | maybe | implementation allowed: no |
| GitHub-bot-like | Useful for issue/PR review-package surfaces. | High risk of external publication/comments/webhooks. | maybe | implementation allowed: no |

## Recommendation

Choose `mcp_read_only_candidate` as the first design-only candidate because its risks are the easiest to overclaim and the most important to fence before any implementation is discussed.

## Boundary

No SDK import, no MCP server/client, no network, no resource fetch, no tool execution, no runtime, no agent-consumed output, no machine-readable policy, no approval/block/allow, no authorization, and no enforcement.
