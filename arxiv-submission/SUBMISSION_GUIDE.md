# Guía de submission a arXiv

## Archivos a subir

```
arxiv-submission/
├── main.tex        ← fuente principal
├── references.bib  ← bibliografía
```
No subas el PDF — arXiv lo compila desde el .tex.

---

## Paso 1: Crear cuenta en arXiv

1. Ir a https://arxiv.org/register
2. Completar el formulario con tu email (penagabriel22@gmail.com)
3. Confirmar por email
4. Opcionalmente vincular tu ORCID (recomendado para trazabilidad académica)

> arXiv requiere **endorsement** para cs.MA/cs.AI si es tu primera submission.
> Ver Paso 1b.

### Paso 1b: Obtener endorsement (primera vez)

arXiv requiere que alguien con historial en la categoría te "endorse".
Opciones:

- **Pedir endorsement automático**: En la página de submission, arXiv te
  muestra investigadores que pueden endorse. Podés contactarlos directamente
  explicando brevemente tu paper.
- **Alternativa rápida**: Subir primero a `cs.LG` (Machine Learning), que
  generalmente no requiere endorsement para autores nuevos, y agregar
  cs.MA/cs.AI como cross-list.
- **Alternativa sin endorsement**: Usar **SSRN** o **TechRxiv** como preprint
  server mientras buscás el endorsement para arXiv.

---

## Paso 2: Iniciar la submission

1. Ir a https://arxiv.org/submit
2. Click **Start New Submission**
3. Categoría primaria: **cs.MA** (Computer Science → Multiagent Systems)
4. Cross-list: **cs.AI** (Computer Science → Artificial Intelligence)

---

## Paso 3: Subir los archivos

1. Seleccionar **Upload files**
2. Subir `main.tex` y `references.bib` **juntos** (o en un .zip)
3. arXiv compila automáticamente y te muestra una preview
4. Verificar que el PDF generado se vea correcto

---

## Paso 4: Completar los metadatos

| Campo | Valor |
|---|---|
| **Title** | Synaptic Mesh: Receipt-Preserving Memory Authority for Multi-Agent Systems |
| **Authors** | Gabriel Peña |
| **Abstract** | *(copiar el abstract del paper, sin comandos LaTeX)* |
| **Comments** | 10 pages. Reference implementation: https://github.com/lechuit/synaptic-mesh |
| **Report number** | *(dejar vacío)* |
| **Journal-ref** | *(dejar vacío — es un preprint)* |

### Abstract para pegar en arXiv (texto plano)

```
Agent memory systems increasingly persist, retrieve, summarize, and share context
across tools, sessions, and specialized agents. These mechanisms are useful but do
not by themselves answer a narrower multi-agent question: what authority survives
when memory-derived summaries travel through compression, handoff, and
action-planning steps? A memory can be relevant, well-summarized, and correctly
sourced while still being stale, local-only, denied, partial-lineage, human-required,
or unsafe to use as action authority.

This paper introduces Synaptic Mesh, a protocol proposal for multi-agent memory
authority. The core claim is that memory claims should carry compact
authority/status/boundary receipts that survive transformations such as: source
result -> summary -> handoff -> next-action -> action proposal. Receipts bind
source identity, freshness, scope, promotion boundary, forbidden effects, later
restrictive events, and the proposed action boundary. The receiving agent checks
these receipts before treating a memory-derived summary as permission, readiness,
or durable truth.

Local adversarial fixtures suggest that receipt-through-transform can catch several
memory laundering failures: sender-safe label overrides, boundary substring smuggling,
cross-source authority laundering, stale receipt reuse, and over-trust in confidence
or prose fields. The latest compressed-temporal fixture identifies an 11-field
authority-critical receipt tuple that preserves zero unsafe allows and zero false
rejects in local tests while reducing field count by 31.25% relative to a fuller
audit receipt. These results are not production benchmarks; they are a falsification
ledger supporting a narrower protocol hypothesis: multi-agent memory systems may need
authority-preserving transforms, not only better retrieval.

The reference implementation and reproducibility package are available at
https://github.com/lechuit/synaptic-mesh
```

---

## Paso 5: Licencia

Seleccionar: **CC BY 4.0** (ya es la licencia de tu docs en el repo)

---

## Paso 6: Submit

1. Review final → **Submit**
2. arXiv asigna un ID tipo `arXiv:2605.XXXXX`
3. El paper aparece públicamente al día siguiente (proceso de moderación ~24h)
4. Recibirás el arXiv ID por email

---

## Post-submission

- Actualizar `CITATION.cff` con el arXiv ID:
  ```yaml
  identifiers:
    - type: url
      value: https://arxiv.org/abs/2605.XXXXX
  ```
- Compartir el link `https://arxiv.org/abs/2605.XXXXX` en LinkedIn/GitHub
- Agregar el badge al README:
  ```markdown
  [![arXiv](https://img.shields.io/badge/arXiv-2605.XXXXX-b31b1b.svg)](https://arxiv.org/abs/2605.XXXXX)
  ```
