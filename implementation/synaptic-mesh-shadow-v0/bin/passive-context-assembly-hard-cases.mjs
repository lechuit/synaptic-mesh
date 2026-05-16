#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readPassiveContextAssemblyHardCasesInput, scorePassiveContextAssemblyHardCases } from '../src/passive-context-assembly-hard-cases.mjs';
function usage(){return 'usage: passive-context-assembly-hard-cases --context-assembly-artifact <repo-local-json> [--out <repo-local-json>] [--report <repo-local-md>]';}
function parse(argv){const args={contextAssemblyArtifact:null,out:null,report:null}; for(let i=2;i<argv.length;i++){const a=argv[i]; if(a==='--context-assembly-artifact') args.contextAssemblyArtifact=argv[++i]; else if(a==='--out') args.out=argv[++i]; else if(a==='--report') args.report=argv[++i]; else throw new Error(`${usage()}\nunknown arg: ${a}`);} if(!args.contextAssemblyArtifact) throw new Error(`${usage()}\n--context-assembly-artifact is required`); return args;}
function safe(v,label){if(!v||path.isAbsolute(v)||v.includes('..')) throw new Error(`${label} must be an explicit repo-local path`); return v;}
const args=parse(process.argv); const input=await readPassiveContextAssemblyHardCasesInput(safe(args.contextAssemblyArtifact,'--context-assembly-artifact')); const artifact=scorePassiveContextAssemblyHardCases(input); const json=`${JSON.stringify(artifact,null,2)}\n`; if(args.out){const p=safe(args.out,'--out'); await mkdir(path.dirname(p),{recursive:true}); await writeFile(p,json);} if(args.report){const p=safe(args.report,'--report'); await mkdir(path.dirname(p),{recursive:true}); await writeFile(p,artifact.reportMarkdown);} process.stdout.write(json);
