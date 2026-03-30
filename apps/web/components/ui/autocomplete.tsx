'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, XIcon } from 'lucide-react';

interface AutocompleteItem {
  id: string;
  label: string;
  email?: string;
  [key: string]: any;
}

interface AutocompleteProps {
  items: AutocompleteItem[];
  value: string;
  onChange: (value: string) => void;
  onItemSelect?: (item: AutocompleteItem) => void;
  placeholder?: string;
  displayKey?: string;
  searchKeys?: string[];
  className?: string;
  isLoading?: boolean;
}

export function Autocomplete({
  items,
  value,
  onChange,
  onItemSelect,
  placeholder = 'Buscar...',
  displayKey = 'email',
  searchKeys = ['email'],
  className,
  isLoading = false,
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState<AutocompleteItem | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredItems = React.useMemo(() => {
    if (!searchValue) return items;
    const lowerSearch = searchValue.toLowerCase();
    return items.filter((item) =>
      searchKeys.some((key) =>
        String(item[key] || '').toLowerCase().includes(lowerSearch)
      )
    );
  }, [items, searchValue, searchKeys]);

  const handleItemSelect = (item: AutocompleteItem) => {
    setSelectedItem(item);
    onChange(item.id);
    setSearchValue('');
    setOpen(false);
    onItemSelect?.(item);
  };

  const handleClear = () => {
    setSelectedItem(null);
    onChange('');
    setSearchValue('');
    setOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!value && selectedItem) {
      setSelectedItem(null);
      setSearchValue('');
    }
  }, [value]);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={selectedItem ? selectedItem[displayKey] : placeholder}
          value={selectedItem ? '' : searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          disabled={isLoading}
          className={cn(
            'h-8 w-full min-w-0 rounded-lg border border-slate-300 bg-transparent px-2.5 py-1 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50',
            selectedItem && 'text-slate-900'
          )}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {selectedItem && value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:bg-slate-100 rounded transition-colors"
              tabIndex={-1}
            >
              <XIcon className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <ChevronDownIcon
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform',
              open && 'rotate-180'
            )}
          />
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-slate-500">Carregando...</div>
          ) : filteredItems.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">
              {searchValue ? 'Nenhum resultado encontrado' : 'Nenhum item disponível'}
            </div>
          ) : (
            <ul className="py-1">
              {filteredItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleItemSelect(item)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-slate-100 focus:bg-slate-100 outline-none transition-colors',
                      value === item.id && 'bg-blue-50 text-blue-700'
                    )}
                  >
                    <div className="font-medium">{item[displayKey]}</div>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {searchKeys
                        .filter((key) => key !== displayKey && item[key])
                        .map((key) => (
                          <span
                            key={key}
                            className="inline-block text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                          >
                            {item[key]}
                          </span>
                        ))}
                      {item.label && item.label !== item[displayKey] && (
                        <span className="inline-block text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {item.label}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
