# v0.15.3 no-enforcement invariant suite

Passive shadow cannot emit allow/block/approve/enforce/authorize decisions. It can only record/advisory evidence. Dangerous cases are retained as fixtures with no policy decision, no authorization, no enforcement.


As of v0.15.6 hardening, decision verbs found in local input are sanitized before persistence so machine-readable evidence does not carry raw allow/block/approve/enforce/authorize semantics from quoted input text.
