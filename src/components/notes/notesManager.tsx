import { useState } from 'react';
import { Textarea, Button } from '@frontapp/ui-kit';

interface Note {
  fields: {
    Notes: string;
    Author: string;
    Date: string;
  };
}

interface NotesManagerProps {
  notes: Note[];
  onAddNoteChange: (value: string) => void;
  onAddNoteClick: () => void;
}

const NotesManager: React.FC<NotesManagerProps> = ({ notes, onAddNoteChange, onAddNoteClick }) => {
  // A component that displays notes with author and dates and allows users to add new notes
  const [value, setValue] = useState<string>('');

  const sortedNotes = [...notes].sort((a, b) => {
    // Compare dates in reverse order (newest first)
    return new Date(b.fields.Date).getTime() - new Date(a.fields.Date).getTime();
  });

  return (
    <div>
      {sortedNotes.map((note, index) => (
        <div key={index} style={{ margin: '10px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{note.fields.Notes}</div>
          <div style={{ fontSize: '14px', color: '#777' }}>Author: {note.fields.Author}</div>
          <div style={{ fontSize: '14px', color: '#777' }}>Date: {note.fields.Date}</div>
        </div>
      ))}
      <hr />
      <div style={{ marginTop: '20px', padding: '15px' }}>
        <Textarea
          value={value}
          placeholder="Enter a new note..."
          onChange={(newValue) => {
            //const newValue = event.target.value;
            setValue(newValue);
            onAddNoteChange(newValue);
          }}
        />
        <Button type="secondary" onClick={() => {
          onAddNoteClick();
          setValue('');
        }}>
          Add note
        </Button>
      </div>
    </div>
  );
};

export default NotesManager;