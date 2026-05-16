#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readPassiveHandoffReceiverInput, scorePassiveHandoffReceiverRubric } from '../src/passive-handoff-receiver-shadow-rubric.mjs';
function usage(){return 'usage: passive-handoff-receiver-shadow-rubric --handoff-artifact <repo-local-json> [--out <repo-local-json>] [--report <repo-local-md>]';}
function parseArgs(argv){const args={handoffArtifact:null,out:null,report:null}; for(let i=2;i<argv.length;i+=1){const a=argv[i]; if(a==='--handoff-artifact') args.handoffArtifact=argv[++i]; else if(a==='--out') args.out=argv[++i]; else if(a==='--report') args.report=argv[++i]; else throw new Error(`${usage()}\nunknown arg: ${a}`);} if(!args.handoffArtifact) throw new Error(`${usage()}\n--handoff-artifact is required`); return args;}
function safe(v,label){if(!v||path.isAbsolute(v)||v.includes('..')) throw new Error(`${label} must be an explicit repo-local path`); return v;}
const args=parseArgs(process.argv); const input=await readPassiveHandoffReceiverInput(safe(args.handoffArtifact,'--handoff-artifact')); const artifact=scorePassiveHandoffReceiverRubric(input); const out=`${JSON.stringify(artifact,null,2)}\n`; if(args.out){const p=safe(args.out,'--out'); await mkdir(path.dirname(p),{recursive:true}); await writeFile(p,out);} if(args.report){const p=safe(args.report,'--report'); await mkdir(path.dirname(p),{recursive:true}); await writeFile(p,artifact.reportMarkdown);} process.stdout.write(out);
