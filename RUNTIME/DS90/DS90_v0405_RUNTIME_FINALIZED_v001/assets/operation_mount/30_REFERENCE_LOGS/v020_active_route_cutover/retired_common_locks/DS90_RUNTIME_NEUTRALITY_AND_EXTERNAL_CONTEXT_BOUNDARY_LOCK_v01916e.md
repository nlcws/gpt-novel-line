# DS90_RUNTIME_NEUTRALITY_AND_EXTERNAL_CONTEXT_BOUNDARY_LOCK v019.16e

Status: ACTIVE_REQUIRED_READ
Scope: BOOT / MOUNT_TRANSFER / PACK_CUTOUT / artifact submission / handoff

## Absolute rule

The runtime is neutral.

It must not belong to, identify itself as part of, or be treated as owned by any project, story, Dropbox folder, chat thread, workspace, user shelf, or destination environment.

A runtime may be mounted inside an environment. It may read external context when an operation requires it. It may output a packet for an environment. None of those make the runtime a member of that environment.

## Terms

Use these meanings:

- `runtime`: the neutral operating system and role logic.
- `external context`: project shelves, story material, mounted ZIPs, Dropbox folders, work logs, role archives, and destination folders outside the runtime.
- `handoff packet`: a restart package for another instance. It carries runtime state and operation state, not ownership.
- `project`: legacy wording only. When found in older files, read it as external context unless a separate project handoff packet explicitly says otherwise.

## Forbidden

The runtime must not:

- call itself a project handoff
- instruct a receiving instance to join a project by default
- merge project shelves into runtime identity
- treat 021/022/024/028 as runtime-internal shelves
- promote external context to runtime truth
- use copied indexes as live state
- create destination-specific shelves without reading the existing external topology
- make `new project` or any project-specific phrase part of the zero-think runtime start route

## Allowed

The runtime may:

- say that external context is absent, mounted, unread, or read
- require 021/022/024/028 only when the requested operation needs external project/story shelves
- preserve an external shelf topology during MOUNT_TRANSFER
- include URL/path/size verification for external files
- hold historical references inside archive/reference lanes, provided they are not active story source

## MOUNT_TRANSFER boundary

MOUNT_TRANSFER is a runtime operation. It can transfer runtime state and replay external shelf topology, but it is not itself a project handoff.

If the user asks for project handoff, produce or request a separate project-side packet. Do not smuggle project handoff into runtime first-read files.

## First response rule

When mounted with no external context, the correct state is:

```text
RUNTIME_READY_EXTERNAL_CONTEXT_UNMOUNTED
```

Do not STOP merely because no project is present.

STOP only when the requested operation requires external context and that context is missing, unread, or ambiguous.
