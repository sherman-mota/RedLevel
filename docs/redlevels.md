# RedLevels
RedLevels é um sistema que busca refletir os conceitos de kanban escalado usando a Infraestrutura do redmine como sistema de gestão de itens, ou seja, é uma camada de modelo de gestão sobre o redmine. 

## Como isso é feito

O Redlevels aproveita a tipificação de tarefas (tracker_id) para estabelecer níveis de gestão (estratégico, tático e operacional) e a relação de parentesco entre tarefas (parent_id) para relacionar os desdobramentos de itens estratégicos até os itens operacionais. Durante a configuração do sistema é feito um mapeamento de quais tipos de tarefa estão em quais níveis. 

O acompanhamento dos itens é feito através de kanbans por nível de gestão. Assim, no nível operacional temos as tarefas de menor granularidade e mais numerosas, enquanto no nível estratégico temos itens de maior granularidade e menor quantidade. Os estágios de cada kanban são associados aos status das respectivas tarefas do redmine e classificados como itens em andamento, backlog ou concluídos.

### Exceções

Em algumas organizações, iniciativas estratégicas podem ser acompanhadas fora do redmine. Assim, assume-se que um campo personalizado (custom_field) em tarefas do nível 2 possa representar uma iniciativa estratégica.

Nesse caso o kanban do nível 3 não tem estágios, mas apenas uma lista de valores do campo personalizado que representa as iniciativas estratégicas. Nesse caso coniguramos os sistema para realizar esse tratamento diferente.

> Ex.: Um campo personalizado de uma tarefa do nível 2 chamado "Iniciativa Estratégica" é na verdade uma lista de valores, ou seja, cada tarefa do nível 2 pode estar associada a uma iniciativa estratégica.

## Telas do Sistema

### Visão Geral
Apresenta uma visão geral dos 3 níveis gerenciais (estratégico, Tático e Operacional). É a tela principal de acesso ao sistema, contendo os KPIs:
- Número total de itens (3 níveis)
- Número total de itens táticos em progresso
- Tempo de vida médio dos itens táticos
- Número de itens Operacionais
E também os kanbans respectivos de cada nível estão agrupados nessa tela. Como é uma visão geral, os cards são minimalistas e se a quantidade de cards for muito grande o kanban é super simplificado.
Alguns filtros permitem analisar melhor esses dados

### Estratégico
### Tático
### Operacional
### Dependências
### Configurações

