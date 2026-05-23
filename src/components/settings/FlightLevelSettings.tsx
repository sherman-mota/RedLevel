import React from 'react';
import { Layers, RefreshCw } from 'lucide-react';
import { RedmineConfig } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface LevelSettingsProps {
  localConfig: RedmineConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<RedmineConfig>>;
  customFields: { id: string; name: string; possibleValues?: string[] }[];
  loadingCustomFields: boolean;
}

// Reusable Field Mapper Helper Component/Function inside this file
function FieldMapper({
  level,
  label,
  valueKey,
  placeholder,
  localConfig,
  setLocalConfig,
  customFields,
  loadingCustomFields,
}: {
  level: 'l3' | 'l2' | 'l1';
  label: string;
  valueKey: 'blockedFlag' | 'blockedReason' | 'groupingField';
  placeholder: string;
  localConfig: RedmineConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<RedmineConfig>>;
  customFields: { id: string; name: string; possibleValues?: string[] }[];
  loadingCustomFields: boolean;
}) {
  const { t } = useLanguage();
  const currentValue = localConfig.fieldsMap[level][valueKey] || '';
  const matchedField = customFields.find(cf => cf.id === currentValue || cf.name === currentValue);
  const selectValue = matchedField ? matchedField.name : (currentValue ? '__manual__' : '');
  const sortedCustomFields = [...customFields].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-150 transition-all hover:border-slate-350">
      <div className="flex justify-between items-center">
        <label className="text-slate-700 font-bold block text-xs">{label}</label>
        {loadingCustomFields && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8a2d46]" />}
      </div>
      <select
        value={selectValue}
        onChange={(e) => {
          const val = e.target.value;
          if (val === '__manual__') {
            setLocalConfig(prev => ({
              ...prev,
              fieldsMap: {
                ...prev.fieldsMap,
                [level]: { ...prev.fieldsMap[level], [valueKey]: '' }
              }
            }));
          } else {
            setLocalConfig(prev => ({
              ...prev,
              fieldsMap: {
                ...prev.fieldsMap,
                [level]: { ...prev.fieldsMap[level], [valueKey]: val }
              }
            }));
          }
        }}
        className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-[#8a2d46] text-slate-700 transition-all"
      >
        <option value="">{t.selectField}</option>
        {sortedCustomFields.map(cf => (
          <option key={cf.id} value={cf.name}>{cf.name} (ID: {cf.id})</option>
        ))}
        <option value="__manual__">{t.manualEntry}</option>
      </select>
      {(selectValue === '__manual__' || (!matchedField && currentValue)) && (
        <div className="space-y-1 mt-1">
          <span className="text-[10px] text-slate-400 font-medium uppercase">{t.mappedValue}</span>
          <input
            type="text"
            value={currentValue}
            onChange={(e) => setLocalConfig(prev => ({
              ...prev,
              fieldsMap: {
                ...prev.fieldsMap,
                [level]: { ...prev.fieldsMap[level], [valueKey]: e.target.value }
              }
            }))}
            placeholder={placeholder}
            className="w-full p-2 text-xs font-normal rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#8a2d46] bg-white text-slate-800 transition-all"
          />
        </div>
      )}
    </div>
  );
}

// ── L3 LEVEL SETTINGS (STRATEGIC) ───────────────────────────────────
export function L3LevelSettings({
  localConfig,
  setLocalConfig,
  customFields,
  loadingCustomFields,
}: LevelSettingsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
      <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b pb-2">
        <span className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-500" /> Nível N3 (Estratégico / L3)
        </span>
      </h3>

      {/* L3 Mode Selector (Tracker or Custom Field Value) */}
      <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-purple-950 block">Modo de Identificação de N3</span>
            <span className="text-[10px] text-purple-800 leading-snug block">Escolha se o nível N3 é identificado por um tipo de tarefa (Tracker) ou por um campo personalizado específico nas tarefas.</span>
          </div>
          <div className="flex bg-white border rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setLocalConfig(prev => ({ ...prev, l3Mode: 'tracker' }))}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${localConfig.l3Mode === 'tracker'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              Tracker
            </button>
            <button
              type="button"
              onClick={() => setLocalConfig(prev => ({ ...prev, l3Mode: 'customField' }))}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${localConfig.l3Mode === 'customField'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              Campo Personalizado
            </button>
          </div>
        </div>

        {localConfig.l3Mode === 'customField' && (
          <div className="pt-2 text-xs font-semibold">
            <div className="space-y-1 bg-white p-3 rounded-lg border border-purple-100">
              <label className="text-slate-600 block text-[10px] uppercase tracking-wider">Campo Personalizado para N3</label>
              <select
                value={localConfig.l3CustomField}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, l3CustomField: e.target.value }))}
                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="">Selecione o campo...</option>
                {[...customFields]
                  .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
                  .map(cf => (
                    <option key={cf.id} value={cf.name}>{cf.name} (ID: {cf.id})</option>
                  ))
                }
              </select>
            </div>
          </div>
        )}
      </div>

      {/* L3 Custom fields */}
      {localConfig.l3Mode === 'tracker' && (
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mapeamento de Campos de N3</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <FieldMapper
              level="l3"
              label="Campo Indicador de Bloqueio"
              valueKey="blockedFlag"
              placeholder="Ex: blocked_custom_field"
              localConfig={localConfig}
              setLocalConfig={setLocalConfig}
              customFields={customFields}
              loadingCustomFields={loadingCustomFields}
            />
            <FieldMapper
              level="l3"
              label="Razão do Bloqueio"
              valueKey="blockedReason"
              placeholder="Ex: blocked_reason_custom_field"
              localConfig={localConfig}
              setLocalConfig={setLocalConfig}
              customFields={customFields}
              loadingCustomFields={loadingCustomFields}
            />
            <FieldMapper
              level="l3"
              label="Agrupador de Kanban"
              valueKey="groupingField"
              placeholder="Ex: tema_estrategico"
              localConfig={localConfig}
              setLocalConfig={setLocalConfig}
              customFields={customFields}
              loadingCustomFields={loadingCustomFields}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── L2 LEVEL SETTINGS (TACTICAL) ────────────────────────────────────
export function L2LevelSettings({
  localConfig,
  setLocalConfig,
  customFields,
  loadingCustomFields,
}: LevelSettingsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
      <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b pb-2">
        <span className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-500" /> Nível N2 (Coordenação / L2)
        </span>
      </h3>
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mapeamento de Campos de N2</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <FieldMapper
            level="l2"
            label="Campo Indicador de Bloqueio"
            valueKey="blockedFlag"
            placeholder="Ex: blocked_custom_field"
            localConfig={localConfig}
            setLocalConfig={setLocalConfig}
            customFields={customFields}
            loadingCustomFields={loadingCustomFields}
          />
          <FieldMapper
            level="l2"
            label="Razão do Bloqueio"
            valueKey="blockedReason"
            placeholder="Ex: blocked_reason_custom_field"
            localConfig={localConfig}
            setLocalConfig={setLocalConfig}
            customFields={customFields}
            loadingCustomFields={loadingCustomFields}
          />
          <FieldMapper
            level="l2"
            label="Agrupador de Kanban"
            valueKey="groupingField"
            placeholder="Ex: area_coordenacao"
            localConfig={localConfig}
            setLocalConfig={setLocalConfig}
            customFields={customFields}
            loadingCustomFields={loadingCustomFields}
          />
        </div>
      </div>
    </div>
  );
}

// ── L1 LEVEL SETTINGS (OPERATIONAL) ───────────────────────────────────
export function L1LevelSettings({
  localConfig,
  setLocalConfig,
  customFields,
  loadingCustomFields,
}: LevelSettingsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
      <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b pb-2">
        <span className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-500" /> Nível N1 (Operacional / L1)
        </span>
      </h3>
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mapeamento de Campos de N1</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <FieldMapper
            level="l1"
            label="Campo Indicador de Bloqueio"
            valueKey="blockedFlag"
            placeholder="Ex: blocked_custom_field"
            localConfig={localConfig}
            setLocalConfig={setLocalConfig}
            customFields={customFields}
            loadingCustomFields={loadingCustomFields}
          />
          <FieldMapper
            level="l1"
            label="Razão do Bloqueio"
            valueKey="blockedReason"
            placeholder="Ex: blocked_reason_custom_field"
            localConfig={localConfig}
            setLocalConfig={setLocalConfig}
            customFields={customFields}
            loadingCustomFields={loadingCustomFields}
          />
          <FieldMapper
            level="l1"
            label="Agrupador de Kanban"
            valueKey="groupingField"
            placeholder="Ex: squad_responsavel"
            localConfig={localConfig}
            setLocalConfig={setLocalConfig}
            customFields={customFields}
            loadingCustomFields={loadingCustomFields}
          />
        </div>
      </div>
    </div>
  );
}
