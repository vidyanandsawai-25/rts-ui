import { ImageIcon, Map, PenTool } from 'lucide-react';

export const PhotoGallerySection = () => {
  return (
    <div className="w-full lg:w-2/12">
      <div className="grid grid-cols-1 gap-3">
        <div className="border border-dashed border-gray-300 rounded-lg p-3 flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
          <div className="w-150 h-50 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <ImageIcon className="text-gray-400" />
          </div>
        </div>
        <div className="border border-dashed border-gray-300 rounded-lg p-3 flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
          <div className="w-150 h-50 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <Map className="text-gray-400" />
          </div>
        </div>
        <div className="border border-dashed border-gray-300 rounded-lg p-3 flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
          <div className="w-150 h-50 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <PenTool className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
