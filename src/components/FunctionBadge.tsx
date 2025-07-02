import { useState, useCallback, useMemo } from "react";
import { X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getFunctionById, getAllFunctions } from "@/data";

interface FunctionBadgeProps {
  functionId: string;
  onUpdate: (newFunctionId: string) => void;
  onDelete: () => void;
}

export function FunctionBadge({
  functionId,
  onUpdate,
  onDelete,
}: FunctionBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentFunction = useMemo(() => getFunctionById(functionId), [functionId]);
  const allFunctions = useMemo(() => getAllFunctions(), []);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this function?")) {
      onDelete();
    }
  }, [onDelete]);

  const handleSelect = useCallback((newFunctionId: string) => {
    onUpdate(newFunctionId);
    setIsOpen(false);
  }, [onUpdate]);

  // Handle unknown function gracefully
  if (!currentFunction) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md">
        Unknown function
        <button
          onClick={onDelete}
          className="hover:text-red-900 focus:outline-none"
          aria-label="Delete unknown function"
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    );
  }

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <span 
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md cursor-pointer hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                role="button"
                tabIndex={0}
                aria-label={`Function: ${currentFunction.displayName}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
              >
                {currentFunction.displayName}
                <button
                  onClick={handleDelete}
                  className="hover:text-blue-900 focus:outline-none"
                  aria-label={`Delete ${currentFunction.displayName}`}
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </PopoverTrigger>
          </TooltipTrigger>
          {!isOpen && (
            <TooltipContent>
              {currentFunction.description}
            </TooltipContent>
          )}
        </Tooltip>
        <PopoverContent className="w-80 p-0" align="start">
          <div 
            className="max-h-[300px] overflow-auto"
            role="listbox"
            aria-label="Select a function"
          >
            {allFunctions.map((func) => (
              <button
                key={func.id}
                onClick={() => handleSelect(func.id)}
                className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors focus:outline-none focus:bg-accent ${
                  func.id === functionId ? "bg-accent" : ""
                }`}
                role="option"
                aria-selected={func.id === functionId}
              >
                <div className="font-medium text-sm">{func.displayName}</div>
                <div className="text-xs text-muted-foreground">
                  {func.description}
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}