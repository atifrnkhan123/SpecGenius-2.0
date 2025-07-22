'use client';
import SwaggerParser from '@apidevtools/swagger-parser';
import YAML from 'js-yaml';
import type { AnalysisResult, ApiEndpoint, Controller, HttpMethod } from './types';

function isValidHttpMethod(method: string): method is HttpMethod {
  const validMethods: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
  return validMethods.includes(method as HttpMethod);
}

export const analyzeSpec = async (specContent: string): Promise<AnalysisResult> => {
  let specObject;
  try {
    specObject = JSON.parse(specContent);
  } catch (e) {
    try {
      specObject = YAML.load(specContent);
    } catch (yamlError) {
      throw new Error('File is not valid JSON or YAML.');
    }
  }

  if (typeof specObject !== 'object' || specObject === null) {
     throw new Error('Invalid spec format.');
  }

  const parser = new SwaggerParser();
  const spec = await parser.bundle(specObject);

  const specTitle = spec.info.title || 'Untitled API';
  const specVersion = spec.info.version || '';

  const allEndpoints: ApiEndpoint[] = [];
  const controllers: Record<string, Controller> = {};
  const summaryMethodCounts: Record<string, number> = {};

  Object.entries(spec.paths || {}).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      if (isValidHttpMethod(method) && typeof operation === 'object' && operation !== null) {
        const controllerName = operation.tags?.[0] || 'default';
        
        if (!controllers[controllerName]) {
          controllers[controllerName] = {
            name: controllerName,
            endpointCount: 0,
            endpoints: [],
            methodCounts: {},
          };
        }

        const endpoint: ApiEndpoint = {
          id: `${method}-${path}`,
          controller: controllerName,
          path,
          method,
          summary: operation.summary,
          description: operation.description,
          parameters: {
            path: (operation.parameters || []).filter((p: any) => p.in === 'path'),
            query: (operation.parameters || []).filter((p: any) => p.in === 'query'),
            header: (operation.parameters || []).filter((p: any) => p.in === 'header'),
          },
          requestBody: operation.requestBody,
          responses: operation.responses,
        };

        allEndpoints.push(endpoint);
        controllers[controllerName].endpoints.push(endpoint);
        controllers[controllerName].endpointCount++;
        controllers[controllerName].methodCounts[method] = (controllers[controllerName].methodCounts[method] || 0) + 1;
        summaryMethodCounts[method] = (summaryMethodCounts[method] || 0) + 1;
      }
    });
  });

  const largestController = Object.values(controllers).sort((a, b) => b.endpointCount - a.endpointCount)[0]?.name || 'N/A';

  return {
    specTitle,
    specVersion,
    endpoints: allEndpoints,
    controllers,
    summary: {
      totalControllers: Object.keys(controllers).length,
      totalEndpoints: allEndpoints.length,
      largestController,
      methodCounts: summaryMethodCounts,
    },
  };
};
