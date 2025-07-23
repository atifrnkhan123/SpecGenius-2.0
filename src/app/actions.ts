
'use server';
import { identifyBackendTechnology, type IdentifyBackendTechnologyInput } from '@/ai/flows/identify-backend-technology';

export async function getBackendTechnology(
  input: IdentifyBackendTechnologyInput
): Promise<{ backendTechnology: string }> {
  try {
    const result = await identifyBackendTechnology(input);
    return { backendTechnology: result.backendTechnology };
  } catch (error) {
    console.error('Error identifying backend technology:', error);
    return { backendTechnology: 'Could not determine technology.' };
  }
}

export async function fetchSpecFromUrl(url: string): Promise<{ content: string; error?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json, application/yaml, text/plain',
      },
    });

    if (!response.ok) {
      return {
        content: '',
        error: `Failed to fetch from URL. Server responded with status: ${response.status}`,
      };
    }

    const content = await response.text();
    return { content };
  } catch (error: any) {
    console.error('Error fetching spec from URL:', error);
    return {
      content: '',
      error: 'Failed to fetch the specification. This could be due to a network issue, an invalid URL, or the server being unavailable.',
    };
  }
}
