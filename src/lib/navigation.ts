import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const FULLSCREEN_PREFIXES = ['/dish/', '/stories/', '/checkout', '/profile/chat', '/login'];

export function isFullscreenPath(pathname: string): boolean {
  return FULLSCREEN_PREFIXES.some((p) => pathname.startsWith(p));
}

export function useOpenDish() {
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback(
    (id: string) => {
      navigate(`/dish/${id}`, { state: { backgroundLocation: location } });
    },
    [navigate, location],
  );
}

export function useOpenStory() {
  const navigate = useNavigate();
  return useCallback((id: string) => navigate(`/stories/${id}`), [navigate]);
}
