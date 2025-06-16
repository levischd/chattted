import { after } from 'next/server';
import {
  type ResumableStreamContext,
  createResumableStreamContext,
} from 'resumable-stream';

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('REDIS_URL')) {
          console.log(
            ' > Resumable streams are disabled due to missing REDIS_URL'
          );
        } else {
          console.error(error);
        }
      }
    }
  }

  return globalStreamContext;
}

export const streamContext = getStreamContext();
