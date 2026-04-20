import { mockDelay, USE_MOCKS } from './client';
import { stories as mockStories } from '@/mocks/stories';
import type { Story } from '@/types';

export async function getStories(): Promise<Story[]> {
  if (USE_MOCKS) return mockDelay(mockStories, 250);
  throw new Error('Real /stories endpoint not wired yet');
}

export async function markStorySeen(id: string): Promise<void> {
  if (USE_MOCKS) {
    const story = mockStories.find((s) => s.id === id);
    if (story) story.seen = true;
    return mockDelay(undefined, 100);
  }
  throw new Error('Real /stories/:id/seen endpoint not wired yet');
}
