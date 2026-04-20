import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StoryViewer from '@/components/ui/StoryViewer';
import { useStories, useMarkStorySeen } from '@/hooks/queries/useStories';
import type { Slide } from '@/types';

export default function StoryScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: stories } = useStories();
  const markSeen = useMarkStorySeen();

  const story = stories?.find((s) => s.id === id);

  useEffect(() => {
    if (story && !story.seen) markSeen.mutate(story.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  const close = () => navigate(-1);

  if (!story) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight text-cream">
        <button onClick={close} className="rounded-full bg-white/15 px-5 py-2">
          закрыть
        </button>
      </div>
    );
  }

  return (
    <StoryViewer
      open
      slides={story.slides}
      onClose={close}
      onCtaClick={(slide: Slide) => {
        if (slide.cta?.deeplink) navigate(slide.cta.deeplink);
      }}
    />
  );
}
