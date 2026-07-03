/**
 * WorkspacePage.jsx — Main IDE workspace
 * Assembles all panels into the AppLayout
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatPanel from '../components/Chat/ChatPanel';
import EditorPanel from '../components/Editor/EditorPanel';
import PreviewPanel from '../components/Preview/PreviewPanel';
import TerminalPanel from '../components/Terminal/TerminalPanel';
import useAppStore from '../store/useAppStore';

export default function WorkspacePage() {
  const navigate = useNavigate();
  const sandboxId = useAppStore(state => state.sandboxId);

  // Redirect to landing if no sandbox (e.g. direct URL access or page refresh)
  useEffect(() => {
    if (!sandboxId) {
      navigate('/', { replace: true });
    }
  }, [sandboxId, navigate]);

  if (!sandboxId) return null;

  return (
    <AppLayout
      sidebar={<Sidebar />}
      centerTop={<ChatPanel />}
      centerBottom={<EditorPanel />}
      rightTop={<PreviewPanel />}
      rightBottom={<TerminalPanel />}
    />
  );
}
