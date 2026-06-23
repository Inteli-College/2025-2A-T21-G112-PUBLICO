import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoJob } from '../roles/VideoJobContext';
import { useRole } from '../roles/RoleContext';

// Global toast that pops anywhere inside the app when a background video
// analysis finishes (or fails). The whole card is clickable on success and
// takes the user to the gestor dashboard, where the video is listed.
export default function VideoJobToast() {
  const { notice, dismissNotice } = useVideoJob();
  const { setRole } = useRole();
  const navigate = useNavigate();

  if (!notice) return null;

  const isError = notice.type === 'error';
  const goToResult = () => { dismissNotice(); setRole('gestor'); navigate('/app'); };

  return (
    <div
      className={`vj-toast ${isError ? 'vj-toast-error' : 'vj-toast-done'}`}
      role="status"
      onClick={isError ? undefined : goToResult}
    >
      <span className="vj-toast-icon" aria-hidden>
        {isError ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>

      <div className="vj-toast-body">
        <strong>{isError ? 'Falha na análise' : 'Análise de vídeo concluída'}</strong>
        <span>
          {isError
            ? (notice.error || 'Não foi possível processar o vídeo.')
            : 'Toque para ver no painel do gestor.'}
        </span>
      </div>

      {!isError && (
        <span className="vj-toast-cta" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      )}

      <button
        className="vj-toast-close"
        onClick={(e) => { e.stopPropagation(); dismissNotice(); }}
        aria-label="Fechar"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
