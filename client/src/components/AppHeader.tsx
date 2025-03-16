import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, FilterIcon, SearchIcon, BellIcon, HelpCircleIcon } from "lucide-react";

interface AppHeaderProps {
  onSearch: (query: string) => void;
}

export default function AppHeader({ onSearch }: AppHeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-neutral-400">Deal Pipeline</h1>
        <div className="ml-6 flex">
          <Button 
            className="bg-primary hover:bg-blue-700 text-white px-4 py-1 rounded text-sm flex items-center h-9"
          >
            <PlusIcon className="h-4 w-4 mr-1" /> New Deal
          </Button>
          <Button 
            variant="outline" 
            className="ml-3 border border-neutral-300 hover:bg-neutral-100 px-4 py-1 rounded text-sm flex items-center h-9"
          >
            <FilterIcon className="h-4 w-4 mr-1" /> Filter
          </Button>
        </div>
      </div>
      <div className="flex items-center">
        <div className="relative mr-4">
          <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
          <Input 
            type="text" 
            placeholder="Search deals..." 
            className="pl-8 pr-4 py-1 border border-neutral-200 rounded text-sm w-64"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4">
          <BellIcon className="h-5 w-5 text-neutral-300" />
          <HelpCircleIcon className="h-5 w-5 text-neutral-300" />
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
