# Native scientific interactive UI roadmap

[中文](../zh-CN/ROADMAP.md) · [Contents](README.md)

Status: **planned development; unimplemented features are not part of 0.2.0.** Date: 2026-10-20. This update delivers documentation, not unpublished scientific runtime APIs.

## 1. Product goal and meaning of native support

MiQroForge Desktop itself provides interactive materials, chemistry, quantum computing and computational biology components. Installing/upgrading Desktop is sufficient; users do not install skills, MCP plugins, browser extensions or a separate visualization site.

Code may be modular/lazy-loaded internally, but must ship in the product with default registration, data contracts, themes, accessibility, state restoration and acceptance. Generated HTML, screenshots and third-party redirects do not replace professional native interactions. Desktop's existing services execute computations; UI adds parameter input, structure editing, visualization, linked selection, task control and provenance.

## 2. Phases

| Phase | Deliverable | Completion gate |
| --- | --- | --- |
| R0 Documentation/baseline | Bilingual handbook, complete signatures and shared examples | Language parity, inspectable links/examples, clear implemented/planned boundary |
| R1 Shared scientific UI | Scientific types/references, units, selection and common parameter/result components | Input/output, failures, events, restoration and Host contracts covered |
| R2 Four-domain native baseline | Core interactions in the domain table below | Data→interaction→Host→update→restore workflow per domain |
| R3 Advanced/large data | Trajectories, volumes, linked views and advanced domain results | Measured budgets, workers, paging/sampling, precision and provenance |
| R4 Desktop delivery | Built-in assets/registration/help and real-job/offline acceptance | Fresh install works without skills; real Desktop e2e passes |

R1 precedes domain implementation under a shared standard. Completing one domain does not establish support for all four. This roadmap promises no unmeasured schedule or coverage of every future algorithm; coverage is a versioned component/fixture matrix.

## 3. R1: shared native capabilities

### Data and state

- Scientific values: units, dimensions, significant digits, missing values, uncertainty, references and precision metadata.
- Datasets: stable IDs, schema versions, columns, provenance, content hashes, job/result identity and authorized references.
- Coordinates/selections: stable atom/bond/residue/frame/curve-point/qubit/gate IDs, independent of screen pixels.
- Standard complex/matrix/tensor/series/volume/trajectory/sequence data; never silently discard imaginary parts, units or dimensions.
- Separate restorable camera/selection/frame/filter state, authoritative Host job state and versioned editable parameter drafts.
- Large-data resolvers: paging/ranges/chunks, cancellation, cache budgets, expiry and authorization feedback instead of embedding file bytes in Artifacts.

### Shared components

Names below are design placeholders, not existing exports:

| Family | Native interactions |
| --- | --- |
| ScientificValue / UnitInput | Unit-aware input, precision/range checks, explicit conversion and copy |
| ScientificTable | Unit columns, sorting/filtering, row selection, paging and export |
| ScientificPlot | Zoom/pan/log axes/reference lines, picking/brushing, errors and multiple series |
| ParameterPanel | Dependencies/constraints/reset/drafts/diffs and submission confirmation |
| TaskPanel | Stages/progress/logs, cancel/retry/result navigation through Host authorization |
| ResultCompare / Provenance | Overlays, method/parameter differences, sources/versions and unit consistency |
| ArtifactWorkspace | Linked views/layout, restorable selection/state, reproducible examples and export |

## 4. R2: first native components for four domains

| Domain | Required components | Required interactions/data rules |
| --- | --- | --- |
| Materials | Crystal/periodic structure viewer, cell editor, convergence plot, bands/DOS viewer, parameter panel | Rotate/zoom/pick/measure; explicit fractional/Cartesian conversion; supercell preview; energy references, k paths, spin/projection metadata; real Host results |
| Chemistry | Molecule viewer/editor, geometry/constraint editor, vibration/spectrum viewer, reaction-energy plot | Atom/bond editing and selection; bond-order/charge/multiplicity validation; conformer switching/measurement; mode animation/peak linking; consistent energy units/references |
| Quantum computing | Circuit editor, parameter panel, state/measurement viewer, Bloch sphere, backend mapping panel | Qubit/classical-bit layout, gate dragging, controls/measurement/parameters, undo/redo; explicit basis ordering/complex amplitudes; shots/errors/job state; simulation/hardware through Host |
| Computational biology | Protein/complex viewer, sequence/residue viewer, ligand/site panel, basic trajectory/result plots | Chain/residue/atom selection, representations, sequence-to-3D linking/measurement; ligand/pocket picking; frame playback/plot linking; stable IDs/provenance |

### Required for each component

1. Versioned schemas with units/coordinates/indexing conventions.
2. Actual picking/editing/view controls, not only result screenshots.
3. Structured interaction events; submission/recalculation/export through controlled Host actions.
4. Restorable state, without reusing old selections for unrelated data.
5. Empty/loading/denied/invalid/expired/failed/cancelled/resource-limited states.
6. Matching Prompt/spec, Gallery, bilingual API documentation, keyboard behavior and fixtures.

## 5. R3: advanced domain UI

| Domain | Further views/interactions |
| --- | --- |
| Materials | Charge/spin/orbital volumes, isosurfaces/slices; phonon dispersions/modes; elastic tensors; phase diagrams/equations of state; defect/surface/path result linking |
| Chemistry | Orbitals/electron density, conformer ensembles, potential-energy surfaces/reaction coordinates, vibration animation, spectral overlays/assignments and reaction networks |
| Quantum computing | Density/complex matrices, entanglement/correlation views, parameter scans/optimization convergence, noise models, topology/compiled mappings and batch comparison |
| Biology | Chunked large trajectories, contact maps, RMSD/RMSF result views, structural alignment, sequence alignment, interaction networks and free-energy/clustering results |

Every statistic/scientific conclusion must identify whether it comes from Host computation or declared local computation. Sampling/interpolation/coordinate conversion/reduced precision must not masquerade as original results. Document algorithms/conventions with schemas and numerical acceptance.

## 6. R4: built-in Desktop delivery

- Ship registration, renderer code, fonts, shaders/workers and required assets; avoid mandatory CDNs.
- Embed in existing sessions/jobs. Users need no knowledge of implementation plugins, internal prompts or skills.
- Distinguish offline local-result viewing from remote computations/services requiring connectivity; no cloud page as the only viewer.
- Real workflow: edit→Host approval→job→progress→results→interaction→save/restore/export.
- Exercise file/job/session ownership, cancellation, idempotency and fallback without exposing unrestricted IPC/filesystem access.
- Validate themes, keyboard, window sizes, unavailable WebGL, constrained memory, long jobs and large data; report hardware/size/latency rather than unsupported performance promises.
- Fixed datasets need semantic assertions and screenshot differences; structures/plots/circuits/selection events remain traceable.
- Each release includes equivalent bilingual component matrices, migrations and actual Desktop acceptance evidence.

## 7. Execution order

1. Commit this handbook/shared examples and retain the verified 0.2.0 binary.
2. Implement R1 data/selection/action contracts and common value/table/plot/parameter/task UI.
3. Build the four R2 domain suites, register them and embed in native Desktop pages.
4. Complete a real workflow per domain with scientific data correctness checks.
5. Add R3 capabilities and meet R4 native delivery gates; unfinished items remain explicitly planned.
