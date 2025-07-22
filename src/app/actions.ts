
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
