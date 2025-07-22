'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, FileJson, Link, UploadCloud, X, Search, Download, BrainCircuit, Info } from 'lucide-react';
import Papa from 'papaparse';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getBackendTechnology } from '@/app/actions';
import { analyzeSpec } from '@/lib/parser';
import type { AnalysisResult, ApiEndpoint, HttpMethod } from '@/lib/types';
import Logo from './logo';
import { MethodBadge } from './method-badge';
import { Footer } from './footer';

type Step = 'input' | 'loading' | 'analysis' | 'error';

const LoadingStep = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center gap-4 text-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
    <p className="text-lg font-medium text-muted-foreground">{message}</p>
    <p className="text-sm text-muted-foreground">This may take a moment...</p>
  </div>
);

const SummaryCards = ({ summary }: { summary: AnalysisResult['summary'] }) => {
  const methodOrder: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch'];
  const methodCounts = methodOrder.map(method => ({
    method,
    count: summary.methodCounts[method] || 0
  })).filter(item => item.count > 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Controllers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalControllers}</div>
          <p className="text-xs text-muted-foreground">Groups of related endpoints</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalEndpoints}</div>
          <p className="text-xs text-muted-foreground">Individual API operations</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Largest Controller</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{summary.largestController}</div>
          <p className="text-xs text-muted-foreground">Controller with the most endpoints</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Endpoints by Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center">
            {methodCounts.map(({ method, count }) => (
              <div key={method} className="flex items-center gap-1">
                <MethodBadge method={method} />
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ApiDetailTable = ({ endpoints, title }: { endpoints: ApiEndpoint[], title: string }) => {
  const [filter, setFilter] = useState('');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiEndpoint, setAiEndpoint] = useState<ApiEndpoint | null>(null);
  const [aiResult, setAiResult] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const filteredEndpoints = useMemo(() => {
    if (!filter) return endpoints;
    return endpoints.filter(e =>
      e.path.toLowerCase().includes(filter.toLowerCase()) ||
      e.summary?.toLowerCase().includes(filter.toLowerCase()) ||
      e.controller.toLowerCase().includes(filter.toLowerCase())
    );
  }, [endpoints, filter]);

  const exportToCsv = () => {
    const dataToExport = filteredEndpoints.map(e => ({
      Controller: e.controller,
      Endpoint: e.path,
      Method: e.method.toUpperCase(),
      Summary: e.summary,
      'Path Params': e.parameters.path.map(p => p.name).join(', '),
      'Query Params': e.parameters.query.map(p => p.name).join(', '),
      'Header Params': e.parameters.header.map(p => p.name).join(', '),
      'Required Fields': [...e.parameters.path, ...e.parameters.query, ...e.parameters.header]
        .filter(p => p.required)
        .map(p => p.name)
        .join(', '),
      'Request Body': e.requestBody ? 'Yes' : 'No',
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_api_spec.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleIdentifyTech = useCallback(async (endpoint: ApiEndpoint) => {
    setAiEndpoint(endpoint);
    setAiModalOpen(true);
    setIsAiLoading(true);
    setAiResult('');

    try {
        const requestExample = endpoint.requestBody?.content?.['application/json']?.example || endpoint.requestBody?.content?.['*/*']?.example;
        const responseExample = endpoint.responses?.['200']?.content?.['application/json']?.example || endpoint.responses?.['200']?.content?.['*/*']?.example;

        const result = await getBackendTechnology({
            requestPayload: JSON.stringify(requestExample) || "No request payload example provided.",
            responsePayload: JSON.stringify(responseExample) || "No response payload example provided."
        });
        setAiResult(result.backendTechnology);
    } catch (error) {
        setAiResult('An error occurred while analyzing the technology.');
    } finally {
        setIsAiLoading(false);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className='flex-1'>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>A detailed list of all API endpoints found in the specification.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search endpoints..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button variant="outline" onClick={exportToCsv} disabled={filteredEndpoints.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className='w-[100px]'>Method</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Controller</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead className='text-center'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEndpoints.length > 0 ? (
                filteredEndpoints.map(endpoint => (
                  <TableRow key={endpoint.id}>
                    <TableCell><MethodBadge method={endpoint.method} /></TableCell>
                    <TableCell className="font-mono text-sm">{endpoint.path}</TableCell>
                    <TableCell>{endpoint.controller}</TableCell>
                    <TableCell className="max-w-xs truncate">{endpoint.summary || 'No summary'}</TableCell>
                    <TableCell className='text-center'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleIdentifyTech(endpoint)}>
                                <BrainCircuit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Identify Backend Technology (AI)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
       <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                Backend Technology Analysis
            </DialogTitle>
            <DialogDescription>
              AI-powered analysis of the endpoint's potential backend technology based on example payloads.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="font-semibold">Endpoint</h4>
              <div className="flex items-center gap-2 mt-1">
                 {aiEndpoint && <MethodBadge method={aiEndpoint.method}/>}
                 <p className="font-mono text-sm">{aiEndpoint?.path}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold">Result</h4>
              {isAiLoading ? (
                <div className="flex items-center gap-2 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>Analyzing...</p>
                </div>
              ) : (
                <Card className="mt-2 bg-muted/50">
                    <CardContent className="p-4">
                        <p className="text-lg font-semibold font-headline text-accent">{aiResult}</p>
                    </CardContent>
                </Card>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const InputStep = ({ onProcess }: { onProcess: (content: string, source: 'url' | 'file') => void }) => {
  const [url, setUrl] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        onProcess(reader.result as string, 'file');
      };
      reader.readAsText(file);
    }
  }, [onProcess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'], 'application/yaml': ['.yaml', '.yml'] },
    maxFiles: 1,
  });

  const handleUrlFetch = useCallback(async () => {
    if (!url) return;
    try {
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      onProcess(text, 'url');
    } catch (e) {
      console.error("Failed to fetch from URL", e);
      onProcess('', 'url'); // This will trigger the error state
    }
  }, [url, onProcess]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Link className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Analyze from URL</CardTitle>
          </div>
          <CardDescription>Enter a URL to a raw Swagger/OpenAPI file.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="https://petstore.swagger.io/v2/swagger.json"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
            <Button onClick={handleUrlFetch} className="w-full bg-accent hover:bg-accent/90">Analyze URL</Button>
          </div>
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-primary/10 text-primary/80">
            <Info className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="text-xs">
              Some spec URLs may require a VPN. Ensure you are connected before analyzing. We use a CORS proxy for fetching.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileJson className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Analyze from File</CardTitle>
          </div>
          <CardDescription>Upload a .json, .yaml, or .yml file from your computer.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex">
          <div
            {...getRootProps()}
            className={`w-full h-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-center text-muted-foreground">
              {isDragActive ? 'Drop the file here...' : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Supports: .json, .yaml, .yml</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


export default function SpectacleApiPage() {
  const [state, setState] = useState<{
    step: Step;
    loadingMessage: string;
    analysis?: AnalysisResult;
    error?: string;
  }>({
    step: 'input',
    loadingMessage: '',
  });

  const handleProcess = useCallback(async (content: string, source: 'url' | 'file') => {
    if (!content && source === 'url') {
      setState({
          step: 'error',
          error: "Failed to fetch from URL. The resource may be unavailable, behind a VPN, or blocked by CORS policy. Please check the URL and your connection, then try again."
      });
      return;
    }
    
    setState({ step: 'loading', loadingMessage: 'Parsing specification...' });
    try {
      const analysisResult = await analyzeSpec(content);
      setState(prevState => ({ ...prevState, loadingMessage: 'Building dashboard...' }));
      // a short delay for UX
      setTimeout(() => {
        setState({ step: 'analysis', analysis: analysisResult, loadingMessage: '' });
      }, 500);
    } catch (e: any) {
      setState({ step: 'error', error: e.message || 'An unknown error occurred during parsing.' });
    }
  }, []);

  const handleClear = () => {
    setState({ step: 'input', loadingMessage: '', analysis: undefined, error: undefined });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="p-4 flex justify-between items-center">
        <Logo />
        {state.step === 'analysis' && (
          <Button variant="ghost" onClick={handleClear}>
            <X className="mr-2 h-4 w-4" />
            Analyze Another
          </Button>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        {state.step === 'input' && (
          <div className='text-center mb-12'>
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Visual API Specification Analyzer</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Instantly analyze and understand any Swagger 2.0 or OpenAPI 3.0 specification.
              Get key insights, browse endpoints, and identify backend technologies with AI.
            </p>
          </div>
        )}
        
        {state.step === 'input' && <InputStep onProcess={handleProcess} />}

        {state.step === 'loading' && <LoadingStep message={state.loadingMessage} />}
        
        {state.step === 'error' && (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-destructive">Analysis Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
              <Button onClick={handleClear} className="mt-4 w-full">Try Again</Button>
            </CardContent>
          </Card>
        )}

        {state.step === 'analysis' && state.analysis && (
          <div className="w-full max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold font-headline">{state.analysis.specTitle}</h1>
              <p className="text-muted-foreground">Version: {state.analysis.specVersion}</p>
            </div>
            <SummaryCards summary={state.analysis.summary} />
            <ApiDetailTable endpoints={state.analysis.endpoints} title={state.analysis.specTitle} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
