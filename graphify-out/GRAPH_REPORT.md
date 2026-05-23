# Graph Report - ./docs  (2026-05-22)

## Corpus Check
- 6 files · ~4,559 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 33 nodes · 24 edges · 9 communities (4 shown, 5 thin omitted)
- Extraction: 46% EXTRACTED · 54% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.9)
- Token cost: 1,500 input · 400 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Flight Levels Methodology & Quadros|Flight Levels Methodology & Quadros]]
- [[_COMMUNITY_Redmine Integration & CORS Proxy|Redmine Integration & CORS Proxy]]
- [[_COMMUNITY_Custom Fields & Dependências|Custom Fields & Dependências]]
- [[_COMMUNITY_State & Status Mapping Engine|State & Status Mapping Engine]]
- [[_COMMUNITY_Visão Geral & Requisitos|Visão Geral & Requisitos]]
- [[_COMMUNITY_Métricas de Fluxo & Core Tech|Métricas de Fluxo & Core Tech]]
- [[_COMMUNITY_Configuração de Sync & Performance|Configuração de Sync & Performance]]
- [[_COMMUNITY_Histórias de Usuário|Histórias de Usuário]]
- [[_COMMUNITY_Guia do Desenvolvedor|Guia do Desenvolvedor]]

## God Nodes (most connected - your core abstractions)
1. `Flight Levels Methodology` - 5 edges
2. `CORS Bypass Proxy Server` - 4 edges
3. `Advanced Custom Fields` - 3 edges
4. `Flight Level 3: Strategic` - 2 edges
5. `Flight Level 2: Coordination` - 2 edges
6. `Flight Level 1: Operational` - 2 edges
7. `Redmine Integration Architecture` - 2 edges
8. `Technical Data Model` - 2 edges
9. `State Mapping Engine` - 2 edges
10. `Execution Modes` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Kanban Escalado` --semantically_similar_to--> `Flight Levels Methodology`  [INFERRED] [semantically similar]
  docs/redlevels.md → docs/PRD.md
- `Parent Mapping` --conceptually_related_to--> `Flight Levels Methodology`  [INFERRED]
  docs/redlevels.md → docs/PRD.md
- `Tracker Mapping` --conceptually_related_to--> `Redmine Integration Architecture`  [INFERRED]
  docs/redlevels.md → docs/PRD.md
- `Custom Field Exception` --conceptually_related_to--> `Advanced Custom Fields`  [INFERRED]
  docs/redlevels.md → docs/PRD.md
- `Redmine Integration Architecture` --conceptually_related_to--> `CORS Bypass Proxy Server`  [INFERRED]
  docs/PRD.md → docs/ARCHITECTURE.md

## Hyperedges (group relationships)
- **Flight Levels Framework Components** — prd_fl3_strategic, prd_fl2_coordination, prd_fl1_operational [EXTRACTED 1.00]
- **Redmine Integration Subsystem** — architecture_cors_proxy, architecture_dynamic_routing, architecture_security_bypass [EXTRACTED 1.00]

## Communities (9 total, 5 thin omitted)

### Community 0 - "Flight Levels Methodology & Quadros"
Cohesion: 0.22
Nodes (9): Flight Level 1: Operational, Flight Level 2: Coordination, Flight Level 3: Strategic, Flight Levels Methodology, Kanban Escalado, Parent Mapping, US01: Strategic Portfolio Board, US02: L2 Swimlanes & Dependencies (+1 more)

### Community 1 - "Redmine Integration & CORS Proxy"
Cohesion: 0.29
Nodes (7): CORS Bypass Proxy Server, Dynamic CORS Proxy Routing, On-Premise SSL Security Bypass, Execution Modes, Connection Troubleshooting, Redmine Integration Architecture, Tracker Mapping

### Community 2 - "Custom Fields & Dependências"
Cohesion: 0.4
Nodes (5): Technical Data Model, Redmine Custom Fields Setup, Advanced Custom Fields, Custom Field Exception, US05: Dependency Graph Inspection

### Community 3 - "State & Status Mapping Engine"
Cohesion: 0.5
Nodes (4): State Mapping Engine, Stages Map (Kanban Stages), Predictive Status Mapping Engine, Auto Status Mapping Assistant Design

## Knowledge Gaps
- **22 isolated node(s):** `RedLevels Overview`, `Kanban Escalado`, `Tracker Mapping`, `Parent Mapping`, `Custom Field Exception` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 2 inferred relationships involving `Flight Levels Methodology` (e.g. with `Kanban Escalado` and `Parent Mapping`) actually correct?**
  _`Flight Levels Methodology` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `CORS Bypass Proxy Server` (e.g. with `Redmine Integration Architecture` and `Execution Modes`) actually correct?**
  _`CORS Bypass Proxy Server` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Advanced Custom Fields` (e.g. with `Custom Field Exception` and `Technical Data Model`) actually correct?**
  _`Advanced Custom Fields` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `RedLevels Overview`, `Kanban Escalado`, `Tracker Mapping` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._