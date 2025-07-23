'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, FileJson, Link, UploadCloud, X, Search, Download, Info, ChevronDown, ChevronRight, Folder, Cuboid, Component, FileDown } from 'lucide-react';
import Papa from 'papaparse';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyzeSpec } from '@/lib/parser';
import type { AnalysisResult, ApiEndpoint, Controller, HttpMethod } from '@/lib/types';
import Logo from './logo';
import { MethodBadge } from './method-badge';
import { Footer } from './footer';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { cn } from '@/lib/utils';
import { getBackendTechnology, fetchSpecFromUrl } from '@/app/actions';

type Step = 'input' | 'loading' | 'analysis' | 'error';

const LoadingStep = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center gap-4 text-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
    <p className="text-lg font-medium text-muted-foreground">{message}</p>
    <p className="text-sm text-muted-foreground">This may take a moment...</p>
  </div>
);

const SummaryCards = ({ summary, controllers }: { summary: AnalysisResult['summary'], controllers: Record<string, Controller> }) => {
  const methodOrder: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
  const methodCounts = methodOrder.map(method => ({
    method,
    count: summary.methodCounts[method] || 0
  })).filter(item => item.count > 0);

  const largestControllerEndpointCount = controllers[summary.largestController]?.endpointCount || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-purple-100/50 border-purple-200/60 dark:bg-purple-900/20 dark:border-purple-800/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-300">Total Controllers</CardTitle>
          <Cuboid className="h-4 w-4 text-purple-500 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-800 dark:text-purple-100">{summary.totalControllers}</div>
          <p className="text-xs text-purple-700/80 dark:text-purple-300/80">Groups of related endpoints</p>
        </CardContent>
      </Card>
      <Card className="bg-teal-100/50 border-teal-200/60 dark:bg-teal-900/20 dark:border-teal-800/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-teal-600 dark:text-teal-300">Total Endpoints</CardTitle>
          <Component className="h-4 w-4 text-teal-500 dark:text-teal-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-teal-800 dark:text-teal-100">{summary.totalEndpoints}</div>
          <p className="text-xs text-teal-700/80 dark:text-teal-300/80">Individual API operations</p>
        </CardContent>
      </Card>
      <Card className="bg-sky-100/50 border-sky-200/60 dark:bg-sky-900/20 dark:border-sky-800/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-sky-600 dark:text-sky-300">Largest Controller</CardTitle>
          <Folder className="h-4 w-4 text-sky-500 dark:text-sky-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate text-sky-800 dark:text-sky-100">{summary.largestController}</div>
          <p className="text-xs text-sky-700/80 dark:text-sky-300/80">{largestControllerEndpointCount} endpoints</p>
        </CardContent>
      </Card>
      <Card className="bg-rose-100/50 border-rose-200/60 dark:bg-rose-900/20 dark:border-rose-800/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-rose-600 dark:text-rose-300">Endpoints by Method</CardTitle>
          <Cuboid className="h-4 w-4 text-rose-500 dark:text-rose-400" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center pt-2">
            {methodCounts.map(({ method, count }) => (
              <div key={method} className="flex items-center gap-1">
                <MethodBadge method={method}>{`${method.toUpperCase()}: ${count}`}</MethodBadge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AllEndpointsTable = ({ endpoints, title }: { endpoints: ApiEndpoint[], title: string }) => {
  const [filter, setFilter] = useState('');

  const filteredEndpoints = useMemo(() => {
    if (!filter) return endpoints;
    return endpoints.filter(e =>
      e.path.toLowerCase().includes(filter.toLowerCase()) ||
      e.controller.toLowerCase().includes(filter.toLowerCase()) ||
      (e.summary || '').toLowerCase().includes(filter.toLowerCase())
    );
  }, [endpoints, filter]);

  const exportToCsv = () => {
    const dataToExport = filteredEndpoints.map(e => ({
      Controller: e.controller,
      Endpoint: e.path,
      Method: e.method.toUpperCase(),
      Summary: e.summary,
      'Path Params': e.parameters.path.map((p: any) => `${p.name}${p.required ? '*' : ''}`).join(', '),
      'Query Params': e.parameters.query.map((p: any) => `${p.name}${p.required ? '*' : ''}`).join(', '),
      'Header Params': e.parameters.header.map((p: any) => p.name).join(', '),
      'Required Fields': [...e.parameters.path, ...e.parameters.query]
        .filter((p: any) => p.required)
        .map((p: any) => p.name)
        .join(', '),
      'Request Body': e.requestBody ? 'Yes' : 'No',
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_all_endpoints.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className='flex-1'>
            <CardTitle>All API Endpoints</CardTitle>
            <CardDescription>A detailed list of all API endpoints in the specification.</CardDescription>
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
            <Button variant="outline" onClick={exportToCsv} disabled={endpoints.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[50px]'>No.</TableHead>
                <TableHead>Controller</TableHead>
                <TableHead>Endpoints</TableHead>
                <TableHead>Endpoints Name</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Path Param</TableHead>
                <TableHead>Query Param</TableHead>
                <TableHead>Request Body</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEndpoints.length > 0 ? (
                filteredEndpoints.map((endpoint, index) => (
                  <TableRow key={endpoint.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{endpoint.controller}</TableCell>
                    <TableCell className="font-mono text-sm">{endpoint.path}</TableCell>
                    <TableCell className="max-w-xs truncate">{endpoint.summary || 'N/A'}</TableCell>
                    <TableCell><MethodBadge method={endpoint.method}>{endpoint.method.toUpperCase()}</MethodBadge></TableCell>
                    <TableCell>{endpoint.parameters.path.map((p:any) => `${p.name}${p.required ? '*' : ''}`).join(', ') || 'N/A'}</TableCell>
                    <TableCell>{endpoint.parameters.query.map((p:any) => `${p.name}${p.required ? '*' : ''}`).join(', ') || 'N/A'}</TableCell>
                    <TableCell>{endpoint.requestBody ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};


const ControllerApiTable = ({ controllers, title }: { controllers: Record<string, Controller>, title: string }) => {
    const [filter, setFilter] = useState('');
    const [openControllers, setOpenControllers] = useState<Set<string>>(new Set());

    const methodOrder: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

    const toggleController = (name: string) => {
        setOpenControllers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(name)) {
                newSet.delete(name);
            } else {
                newSet.add(name);
            }
            return newSet;
        });
    };

    const filteredControllers = useMemo(() => {
        if (!filter) return Object.values(controllers);
        return Object.values(controllers)
            .map(c => ({
                ...c,
                endpoints: c.endpoints.filter(e =>
                    e.path.toLowerCase().includes(filter.toLowerCase()) ||
                    (e.summary || '').toLowerCase().includes(filter.toLowerCase())
                )
            }))
            .filter(c => c.endpoints.length > 0 || c.name.toLowerCase().includes(filter.toLowerCase()));
    }, [controllers, filter]);

    const exportToCsv = () => {
        const dataToExport = Object.values(controllers).flatMap(c =>
            c.endpoints.map(e => ({
                Controller: c.name,
                Endpoint: e.path,
                Method: e.method.toUpperCase(),
                Summary: e.summary,
                'Path Params': e.parameters.path.map((p: any) => `${p.name}${p.required ? '*' : ''}`).join(', '),
                'Query Params': e.parameters.query.map((p: any) => `${p.name}${p.required ? '*' : ''}`).join(', '),
                'Header Params': e.parameters.header.map((p: any) => p.name).join(', '),
                'Required Fields': [...e.parameters.path, ...e.parameters.query]
                    .filter((p: any) => p.required)
                    .map((p: any) => p.name)
                    .join(', '),
                'Request Body': e.requestBody ? 'Yes' : 'No',
            }))
        );

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

    useEffect(() => {
        if (filteredControllers.length > 0) {
            setOpenControllers(new Set(filteredControllers.map(c => c.name)));
        } else {
            setOpenControllers(new Set());
        }
    }, [filter, controllers]);


    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className='flex-1'>
                        <CardTitle>API Endpoints by Controller</CardTitle>
                        <CardDescription>A detailed list of all API endpoints, grouped by controller.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search controllers or endpoints..."
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>
                        <Button variant="outline" onClick={exportToCsv} disabled={Object.keys(controllers).length === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[600px] w-full pr-4">
                     <div className='space-y-2'>
                        {filteredControllers.length > 0 ? (
                            filteredControllers.map(controller => (
                                <Collapsible
                                    key={controller.name}
                                    open={openControllers.has(controller.name)}
                                    onOpenChange={() => toggleController(controller.name)}
                                    className="border rounded-lg"
                                >
                                    <CollapsibleTrigger className="w-full p-4 flex justify-between items-center bg-card hover:bg-muted/50 transition-colors rounded-t-lg">
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-primary">
                                          <Folder className="h-5 w-5" />
                                          <h3 className="text-lg font-semibold">{controller.name}</h3>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {methodOrder.map(method => (controller.methodCounts[method] > 0) && (
                                                <MethodBadge key={method} method={method}>{`${method.toUpperCase()}: ${controller.methodCounts[method]}`}</MethodBadge>
                                            ))}
                                        </div>
                                      </div>
                                      <div className='flex items-center gap-2'>
                                          <div className='text-sm font-semibold text-foreground'>
                                              {controller.endpointCount} APIs
                                          </div>
                                          {openControllers.has(controller.name) ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className='w-[50px]'>No.</TableHead>
                                                    <TableHead>Endpoints</TableHead>
                                                    <TableHead>Endpoints Name</TableHead>
                                                    <TableHead>Method</TableHead>
                                                    <TableHead>Path Param</TableHead>
                                                    <TableHead>Query Param</TableHead>
                                                    <TableHead>Request Body</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {controller.endpoints.map((endpoint, index) => (
                                                    <TableRow key={endpoint.id}>
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell className="font-mono text-sm">{endpoint.path}</TableCell>
                                                        <TableCell className="max-w-xs truncate">{endpoint.summary || 'N/A'}</TableCell>
                                                        <TableCell><MethodBadge method={endpoint.method}>{endpoint.method.toUpperCase()}</MethodBadge></TableCell>
                                                        <TableCell>{endpoint.parameters.path.map((p:any) => `${p.name}${p.required ? '*' : ''}`).join(', ') || 'N/A'}</TableCell>
                                                        <TableCell>{endpoint.parameters.query.map((p:any) => `${p.name}${p.required ? '*' : ''}`).join(', ') || 'N/A'}</TableCell>
                                                        <TableCell>{endpoint.requestBody ? 'Yes' : 'No'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))
                        ) : (
                            <div className="h-24 text-center flex items-center justify-center col-span-full">
                               No results found.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};


const InputStep = ({ onProcess }: { onProcess: (content: string, source: 'url' | 'file', error?: string) => void }) => {
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  
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
    if (!url || isFetching) return;
    setIsFetching(true);
    try {
      const result = await fetchSpecFromUrl(url);
      if (result.error) {
        onProcess('', 'url', result.error);
      } else {
        onProcess(result.content, 'url');
      }
    } catch (e: any) {
      console.error("Failed to fetch from URL", e);
      onProcess('', 'url', 'An unexpected error occurred while fetching the URL.');
    } finally {
      setIsFetching(false);
    }
  }, [url, onProcess, isFetching]);


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
              disabled={isFetching}
            />
            <Button onClick={handleUrlFetch} className="w-full bg-accent hover:bg-accent/90" disabled={isFetching}>
              {isFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze URL'
              )}
            </Button>
          </div>
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-primary/10 text-primary/80">
            <Info className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="text-xs">
              If you encounter issues fetching from a URL, it might be due to CORS. Consider using the file upload method instead, especially for non-public APIs that may require a VPN connection.
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
    specContent?: string;
  }>({
    step: 'input',
    loadingMessage: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleProcess = useCallback(async (content: string, source: 'url' | 'file', error?: string) => {
    if (error) {
        setState({ step: 'error', error: error, loadingMessage: '' });
        return;
    }
    if (!content && (source === 'url' || source ==='file')) {
      setState({
          step: 'error',
          error: "No content to process. Please check the URL or file.",
          loadingMessage: ''
      });
      return;
    }
    
    setState({ step: 'loading', loadingMessage: 'Parsing specification...' });
    try {
      const analysisResult = await analyzeSpec(content);
      setState(prevState => ({ ...prevState, loadingMessage: 'Building dashboard...' }));
      // a short delay for UX
      setTimeout(() => {
        setState({ step: 'analysis', analysis: analysisResult, specContent: content, loadingMessage: '' });
      }, 500);
    } catch (e: any) {
      setState({ step: 'error', error: e.message || 'An unknown error occurred during parsing.', loadingMessage: '' });
    }
  }, []);

  const handleClear = () => {
    setState({ step: 'input', loadingMessage: '', analysis: undefined, error: undefined, specContent: undefined });
  };

  const handleGeneratePostman = () => {
    if (!state.specContent || !state.analysis) return;
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const blob = new Blob([state.specContent!], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${state.analysis!.specTitle.replace(/\s+/g, '_')}_postman_collection.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error generating Postman collection:", error);
      } finally {
        setIsGenerating(false);
      }
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-between items-center">
        <Logo />
        {state.step === 'analysis' && (
          <Button variant="ghost" onClick={handleClear}>
            <X className="mr-2 h-4 w-4" />
            Analyze Another
          </Button>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 pb-24">
        {state.step === 'input' && (
          <div className='text-center mb-12'>
            <h1 className="text-4xl md:text-5xl font-bold font-headline">SpecGenius is an API Specification Analyzer</h1>
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold font-headline">{state.analysis.specTitle}</h1>
                <p className="text-muted-foreground">Version: {state.analysis.specVersion}</p>
              </div>
              <Button onClick={handleGeneratePostman} disabled={isGenerating} className="bg-accent hover:bg-accent/90">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating postman collection.....
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Generate Postman Collection
                  </>
                )}
              </Button>
            </div>
            <SummaryCards summary={state.analysis.summary} controllers={state.analysis.controllers} />
            <Tabs defaultValue="by-controller" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:w-[400px] border">
                <TabsTrigger value="by-controller">By Controller</TabsTrigger>
                <TabsTrigger value="all-endpoints">All Endpoints</TabsTrigger>
              </TabsList>
              <TabsContent value="by-controller">
                <ControllerApiTable controllers={state.analysis.controllers} title={state.analysis.specTitle} />
              </TabsContent>
              <TabsContent value="all-endpoints">
                <AllEndpointsTable endpoints={state.analysis.endpoints} title={state.analysis.specTitle} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
