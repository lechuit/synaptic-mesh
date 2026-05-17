#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readPassiveContextAssemblyInput, scorePassiveContextAssemblyRehearsalScorecard } from '../src/passive-context-assembly-rehearsal-scorecard.mjs';
function usage(){return 'usage: passive-context-assembly-rehearsal-scorecard --conflict-artifact <repo-local-json> [--out <repo-local-json>] [--report <repo-local-md>]';}
function parse(argv){const a={conflictArtifact:null,out:null,report:null}; for(let i=2;i<argv.length;i++){const x=argv[i]; if(x==='--conflict-artifact') a.conflictArtifact=argv[++i]; else if(x==='--out') a.out=argv[++i]; else if(x==='--report') a.report=argv[++i]; else throw new Error(`${usage()}\nunknown arg: ${x}`);} if(!a.conflictArtifact) throw new Error(`${usage()}\n--conflict-artifact is required`); return a;}
function safe(v,label){if(!v||path.isAbsolute(v)||v.includes('..')) throw new Error(`${label} must be an explicit repo-local path`); return v;}
const args=parse(process.argv); const input=await readPassiveContextAssemblyInput(safe(args.conflictArtifact,'--conflict-artifact')); const artifact=scorePassiveContextAssemblyRehearsalScorecard(input); const out=`${JSON.stringify(artifact,null,2)}\n`; if(args.out){const p=safe(args.out,'--out'); await mkdir(path.dirname(p),{recursive:true}); await writeFile(p,out);} if(args.report){const p=safe(args.report,'--report'); await mkdir(path.dirname(p),{recursive:true}); await writeFile(p,artifact.reportMarkdown);} process.stdout.write(out);
