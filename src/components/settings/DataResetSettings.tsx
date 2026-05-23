import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface DataResetSettingsProps {
  isDemoCleared: boolean;
  setIsDemoCleared: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DataResetSettings({
  isDemoCleared,
  setIsDemoCleared,
}: DataResetSettingsProps) {
  const { t } = useLanguage();

  const handleClearDemoData = () => {
    if (confirm('Tem certeza que deseja excluir os dados simulados fictícios? Isso esvaziará os quadros Kanban até que você configure seu Redmine real.')) {
      localStorage.setItem('redlevels_clear_demo', 'true');
      setIsDemoCleared(true);
      alert('Dados simulados ocultados com sucesso! Recarregando aplicação.');
      window.location.reload();
    }
  };

  const handleRestoreDemoData = () => {
    localStorage.removeItem('redlevels_clear_demo');
    setIsDemoCleared(false);
    alert('Dados simulados restaurados com sucesso! Recarregando aplicação.');
    window.location.reload();
  };

  const handleResetAllSettings = () => {
    if (confirm('Atenção: Isso redefinirá TODOS os mapeamentos de trackers, campos personalizados e conexões para as opções padrões. Deseja prosseguir?')) {
      localStorage.removeItem('redlevels_redmine_config');
      localStorage.removeItem('redlevels_clear_demo');
      alert('Configurações redefinidas com sucesso! Recarregando.');
      window.location.reload();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
        <Trash2 className="w-4 h-4 text-rose-500" /> Administração de Dados & Reset
      </h3>

      <p className="text-xs text-slate-400 leading-relaxed">
        Gerencie a carga de dados fictícios do simulador local ou redefina a base de preferências armazenadas do seu RedLevels.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

        {/* Demo Clear Card */}
        <div className="p-4 rounded-xl border border-slate-150 bg-slate-50/60 flex flex-col justify-between gap-3 transition-all hover:bg-slate-50">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-850 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-slate-500" />
              <span>Dados Fictícios de Demo</span>
            </span>
            <p className="text-[10px] text-slate-400 leading-normal">
              {isDemoCleared
                ? 'Os dados fictícios foram excluídos com sucesso. As tabelas ficarão limpas até a conexão real ser salva.'
                : 'O app atualmente carrega um conjunto de dados simulado. Você pode excluí-lo para iniciar a ferramenta de forma limpa.'}
            </p>
          </div>

          {isDemoCleared ? (
            <button
              type="button"
              onClick={handleRestoreDemoData}
              className="self-start py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all"
            >
              Restaurar Dados Simulados
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClearDemoData}
              className="self-start py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all"
            >
              Excluir Dados Fictícios
            </button>
          )}
        </div>

        {/* Full Reset Card */}
        <div className="p-4 rounded-xl border border-slate-150 bg-slate-50/60 flex flex-col justify-between gap-3 transition-all hover:bg-slate-50">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-850 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Apagar Preferências</span>
            </span>
            <p className="text-[10px] text-slate-400 leading-normal">
              Apaga todas as chaves de API, mapeamento de trackers, status e preferências locais e retorna a aplicação para as configurações de fábrica.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAllSettings}
            className="self-start py-1.5 px-3 bg-slate-700 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all"
          >
            Reset Geral de Configurações
          </button>
        </div>

      </div>
    </div>
  );
}
