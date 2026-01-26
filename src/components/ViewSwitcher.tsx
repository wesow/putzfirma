import { LayoutGrid, List } from 'lucide-react';

interface ViewSwitcherProps {
  viewMode: 'GRID' | 'TABLE';
  onViewChange: (mode: 'GRID' | 'TABLE') => void;
}

export default function ViewSwitcher({ viewMode, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="view-switcher-container shrink-0">
      <button 
        onClick={() => onViewChange('GRID')}
        className={`view-btn ${viewMode === 'GRID' ? 'view-btn-active' : 'view-btn-inactive'}`}
        title="Rasteransicht"
      >
        <LayoutGrid size={18} />
      </button>
      <button 
        onClick={() => onViewChange('TABLE')}
        className={`view-btn ${viewMode === 'TABLE' ? 'view-btn-active' : 'view-btn-inactive'}`}
        title="Listenansicht"
      >
        <List size={18} />
      </button>
    </div>
  );
}