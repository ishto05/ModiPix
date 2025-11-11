import React from 'react';

interface ImageSectionProps {
  imageUrl: string;
  uploadedDate: string;
  imageId: string;
  onShare: () => void;
  onDelete: () => void;
}

const ImageSection: React.FC<ImageSectionProps> = ({
  imageUrl,
  uploadedDate,
  imageId,
  onShare,
  onDelete
}) => {
  return (
    <div>
      <div 
        className="w-full bg-center bg-no-repeat aspect-[16/9] bg-cover rounded-xl mb-4" 
        style={{ backgroundImage: `url("${imageUrl}")` }}
      />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Uploaded: {uploadedDate}</p>
          <p className="text-muted-foreground text-sm">ID: {imageId}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg hover:bg-secondary/80"
            onClick={onShare}
          >
            <span className="material-symbols-outlined text-base">share</span> Share
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90"
            onClick={onDelete}
          >
            <span className="material-symbols-outlined text-base">delete</span> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSection;
