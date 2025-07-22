export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

export interface ApiEndpoint {
  id: string;
  controller: string;
  path: string;
  method: HttpMethod;
  summary?: string;
  description?: string;
  parameters: {
    path: any[];
    query: any[];
    header: any[];
  };
  requestBody?: any;
  responses?: any;
}

export interface Controller {
  name: string;
  endpointCount: number;
  endpoints: ApiEndpoint[];
  methodCounts: Record<string, number>;
}

export interface AnalysisSummary {
  totalControllers: number;
  totalEndpoints: number;
  largestController: string;
  methodCounts: Record<string, number>;
}

export interface AnalysisResult {
  summary: AnalysisSummary;
  controllers: Record<string, Controller>;
  endpoints: ApiEndpoint[];
  specTitle: string;
  specVersion: string;
}
