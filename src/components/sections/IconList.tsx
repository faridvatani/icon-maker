import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { iconList } from "@/lib/iconConstants";
import Icon from "@/components/ui/Icon";

interface IconListProps {
  onIconSelect: (icon: string) => void;
}

export const IconList: React.FC<IconListProps> = ({ onIconSelect }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentIcon, setCurrentIcon] = useState<string>("FaceSlightlySmiling");

  const handleIconClick = () => {
    setIsDialogOpen(true);
  };

  const handleIconSelect = (icon: string) => {
    setCurrentIcon(icon);
    onIconSelect(icon);
    setIsDialogOpen(false);
  };
  return (
    <>
      <div>
        <Label htmlFor="icon">Icon</Label>
        <button
          type="button"
          id="icon"
          onClick={handleIconClick}
          aria-label="Choose an icon"
          className="w-12 h-12 p-2 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center"
        >
          <Icon name={currentIcon} />
        </button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pick your favorite icon</DialogTitle>
            <DialogDescription>
              Choose from a wide range of icons to suit your needs.
            </DialogDescription>
            <div className="flex flex-wrap gap-4 overflow-auto p-4 h-96">
              {iconList.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  aria-label={`Select ${icon}`}
                  title={icon}
                  className="w-12 h-12 p-2 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center"
                  onClick={() => handleIconSelect(icon)}
                >
                  <Icon name={icon} />
                </button>
              ))}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
