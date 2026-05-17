export function createActionContextPacket({ packetId = 'acp_local_shadow_0', proposedAction, receipts = [], coverage = {}, conflicts = [], sourceArtifacts = [] }) {
  return {
    packetId,
    proposedAction,
    retrievedMemoryAtoms: [],
    receipts,
    coverage,
    conflicts,
    decision: null,
    reasons: [],
    sourceArtifacts,
  };
}
