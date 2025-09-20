import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
import { Dialog } from './Dialog';
import { FileText, AlertCircle, ExternalLink } from 'lucide-react';

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

  // Determine file type from URL
  const getFileType = (url: string): string => {
    if (url.includes('.pdf') || url.includes('pdf')) return 'pdf';
    if (url.includes('.pptx') || url.includes('pptx')) return 'pptx';
    if (url.includes('.ppt') || url.includes('ppt')) return 'ppt';
    // Default to pdf for better compatibility
    return 'pdf';
  };

  const fileType = getFileType(presentationUrl);
  
  const documents = [
    {
      uri: presentationUrl,
      fileType: fileType,
      fileName: `${title}.${fileType}`
    }
  ];


  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      title={title} 
      maxWidth="6xl"
      className="h-[90vh]"
    >
      <div className="h-[80vh] w-full">
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
            height: '100%',
            width: '100%'
          }}
        />
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