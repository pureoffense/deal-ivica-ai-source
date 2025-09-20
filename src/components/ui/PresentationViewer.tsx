import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
import { Dialog } from './Dialog';
import { FileText, AlertCircle, ExternalLink, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PresentationViewerProps {
  title: string;
  presentationUrl?: string | undefined;
  editUrl?: string | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function PresentationViewer({ 
  title, 
  presentationUrl, 
  editUrl,
  isOpen, 
  onClose 
}: PresentationViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [viewerType, setViewerType] = useState<'pdf' | 'docviewer'>('pdf');

  // Fetch presentation file as blob to avoid CORS issues
  useEffect(() => {
    const fetchPresentationBlob = async () => {
      if (!presentationUrl || !isOpen) {
        return;
      }

      setLoading(true);
      setError(null);
      setBlobUrl(null);

      try {
        console.log('Fetching presentation from:', presentationUrl);
        
        const response = await fetch(presentationUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,*/*'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        console.log('Successfully created blob URL for presentation');

      } catch (fetchError) {
        console.error('Failed to fetch presentation:', fetchError);
        setError(`Failed to load presentation: ${fetchError instanceof Error ? fetchError.message : 'Network error'}`);
        
        // Fallback to DocViewer for direct URL
        console.log('Falling back to DocViewer with direct URL');
        setViewerType('docviewer');
      } finally {
        setLoading(false);
      }
    };

    fetchPresentationBlob();

    // Cleanup blob URL when component unmounts or presentation changes
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [presentationUrl, isOpen]);

  // Reset page number when presentation changes
  useEffect(() => {
    setPageNumber(1);
    setScale(1.0);
  }, [blobUrl, presentationUrl]);

  // Determine file type from URL
  const getFileType = (url: string): string => {
    if (url.includes('.pdf') || url.includes('pdf')) return 'pdf';
    if (url.includes('.pptx') || url.includes('pptx')) return 'pptx';
    if (url.includes('.ppt') || url.includes('ppt')) return 'ppt';
    // Default to pdf for better compatibility
    return 'pdf';
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    console.log(`PDF loaded successfully with ${numPages} pages`);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError(`Failed to load PDF: ${error.message}`);
    setViewerType('docviewer');
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const changeScale = (delta: number) => {
    setScale(prevScale => {
      const newScale = prevScale + delta;
      return Math.min(Math.max(0.5, newScale), 3.0);
    });
  };

  if (!presentationUrl) {
    return (
      <Dialog open={isOpen} onClose={onClose} title={title} maxWidth="4xl">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Presentation Not Available
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            This presentation doesn't have a preview available yet.
          </p>
          {editUrl && (
            <a
              href={editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Presenton
            </a>
          )}
        </div>
      </Dialog>
    );
  }



  const renderPDFViewer = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading presentation...</p>
          </div>
        </div>
      );
    }

    if (error && !blobUrl && viewerType === 'pdf') {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12">
          <AlertCircle className="w-16 h-16 text-amber-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Trying Alternative Viewer
          </h3>
          <p className="text-gray-600 mb-4 text-center max-w-md">
            {error}
          </p>
        </div>
      );
    }

    if (viewerType === 'pdf' && blobUrl) {
      return (
        <div className="flex flex-col h-full">
          {/* PDF Controls */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => changePage(-1)}
                disabled={pageNumber <= 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                {pageNumber} of {numPages || '?'}
              </span>
              <button
                onClick={() => changePage(1)}
                disabled={pageNumber >= (numPages || 1)}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeScale(-0.2)}
                disabled={scale <= 0.5}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => changeScale(0.2)}
                disabled={scale >= 3.0}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* PDF Viewer */}
          <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
            <Document
              file={blobUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className="text-gray-600">Loading PDF...</div>}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        </div>
      );
    }

    // Fallback to DocViewer
    const documents = [{
      uri: presentationUrl || '',
      fileType: getFileType(presentationUrl || ''),
      fileName: `${title}.${getFileType(presentationUrl || '')}`
    }];

    return (
      <div className="h-full">
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            Using fallback viewer. For best experience, ensure CORS is enabled on the file server.
          </p>
        </div>
        <DocViewer
          documents={documents}
          pluginRenderers={DocViewerRenderers}
          config={{
            header: {
              disableHeader: false,
              disableFileName: false,
              retainURLParams: false,
            }
          }}
          style={{ 
            height: 'calc(100% - 80px)',
            width: '100%'
          }}
        />
      </div>
    );
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      title={title} 
      maxWidth="6xl"
      className="h-[90vh]"
    >
      <div className="h-[75vh] w-full">
        {renderPDFViewer()}
      </div>
      
      {/* Action buttons in footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
        <p className="text-sm text-gray-500">
          Having trouble viewing? Try downloading or opening in Presenton.
        </p>
        <div className="flex gap-2">
          <a
            href={presentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FileText className="w-4 h-4 mr-1" />
            Download
          </a>
          {editUrl && (
            <a
              href={editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Edit Online
            </a>
          )}
        </div>
      </div>
    </Dialog>
  );
}