import React, { useState, ChangeEvent } from 'react';
import { Input, Button, Paragraph } from '@frontapp/ui-kit';

interface SearchBarProps {
  onSearchChange: (value: string) => void;
  onSearchClick: (value: string) => void;
  emptySearch: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchChange, onSearchClick, emptySearch }) => {
  // A component that searches for a TMS record
  const [value, setValue] = useState<string>('');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px' }}>
        <Input
          value={value}
          placeholder="Search for a TMS record..."
          onChange={(newValue) => {
            setValue(newValue);
            onSearchChange(newValue);
          }}
        />
        <Button type="secondary" onClick={() => {
          onSearchClick(value);
          setValue('');
        }}>
          Search
        </Button>
      </div>
      {emptySearch && <div>
        <Paragraph>No records found.</Paragraph>
      </div>}
    </div>
  );
};

export default SearchBar;