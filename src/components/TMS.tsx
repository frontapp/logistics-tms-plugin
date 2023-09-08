import React, {useEffect, useState} from 'react';
import { useFrontContext, Message, PaginatedResults, Link } from '../providers/frontContext';
import {PluginLayout, PluginHeader, PluginFooter, Paragraph, Heading, Button, Tab, TabGroup, Task, Textarea, Select, SelectItem} from '@frontapp/ui-kit';
import TwoColumnLayout from './columnLayouts/twoColumnLayout';
import DocumentManager from './documents/documentManager';
import NotesManager from './notes/notesManager';
import SearchBar from './search/searchBar';

interface TMSRecord {
  fields: {
    ID: string;
    Customer: string;
    'Account Number': string;
    'PO Number': string;
    Status: string;
    Type: string;
    Flags: string;
    ETD: string;
    ETA: string;
    Carrier: string;
    Origin: string;
    Destination: string;
    'Leg 1 Destination': string;
    'Leg 1 ETA': string;
    'Leg 2 Destination': string;
    'Leg 2 ETA': string;
    'Leg 3 Destination': string;
    'Leg 3 ETA': string;
    'Operations Manager': string;
    'Key Account Manager': string;
    Broker: string;
    Documents: Document[];
  };
}

interface Document {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
}

function TMS() {
  const tabs = ['Overview', 'Documents', 'Notes'] as const;
  const context = useFrontContext();
  const [recordIds, setRecordIds] = useState<string[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [recordData, setRecordData] = useState<any>({});
  const [noMatch, setNoMatch] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [notesData, setNotesData] = useState<any[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [emptySearch, setEmptySearch] = useState<boolean>(false);
  const [latestMessageId, setLatestMessageId] = useState<string | undefined>();
  const [selectedTab, setSelectedTab] = useState<typeof tabs[number]>(tabs[0]);

  const displayOrder = ['Customer', 'Account Number', 'PO Number', 'Status', 'Type', 'Flags', 'ETD', 'ETA', 'Carrier', 'Origin', 'Destination', 'Leg 1 Destination', 'Leg 1 ETA', 'Leg 2 Destination', 'Leg 2 ETA', 'Leg 3 Destination', 'Leg 3 ETA'];
  const contactDisplayOrder = ['Operations Manager', 'Key Account Manager', 'Broker'];

  const recipient = (context.conversation && context.conversation.recipient && context.conversation.recipient.name) ? context.conversation.recipient.name : 'there';



  // Watches the context and selects the latest message ID from the available messages.
  // The latest message ID is used to associate a draft reply to a message
  // If a message does not exist, buttons related to new message drafts are hidden
  useEffect(() => {
    context.listMessages()
      .then((response: PaginatedResults<Message>) => {
        if (response.results.length > 0) {
          const latestMessageIndex = response.results.length - 1;
          setLatestMessageId(response.results[latestMessageIndex].id);
        } else {
          setLatestMessageId(undefined);
        }
      });
  }, [context]);

  // Fetches TMS data (mocked through Airtable API)
  useEffect(() => {
    setRecordData({});
    setRecordIds([]);
    setSelectedItemId('');
    setLoading(true);
    setNoMatch(true);
    setEmptySearch(false);
    setSelectedTab(tabs[0]);

    // Searches through conversation links to identify context links with the record pattern https://example.com/order/S123456
    const links: Link[] = context.conversation.links;
    let lookupIds: string[] = [];
    if (links.length > 0) {
      links.map((link) => {
        // Adapt this lookup pattern for your TMS system
        const match = link.externalUrl.match(/\/order\/(S\d{6})/);
        if (match) {
          lookupIds.push(match[1]);
        }
      });
      fetchData(lookupIds)
        .catch(console.error);
    } else {
      setNoMatch(true);
      setLoading(false);
    }

  }, [context]);

  // Fetches internal note data (mocked through Airtable API)
  useEffect(() => {
    fetchNotes()
      .catch(console.error);
  }, [context]);

  const fetchData = async (lookupIds) => {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_ID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching TMS record data');
      }

      const data = await response.json();
      const newRecordIds: string[] = [];

      data.records.forEach((record: TMSRecord) => {
        if (lookupIds.includes(record.fields.ID) && !recordIds.includes(record.fields.ID)) {
          newRecordIds.push(record.fields.ID);
          setSelectedItemId(record.fields.ID);
          setEmptySearch(false);
          setRecordData(record.fields);
          setNoMatch(false);
          setLoading(false);
          return;
        }
      });

      setRecordIds(newRecordIds);
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_NOTES_ID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await response.json();
      setNotesData(data.records);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  // Handles the Reply button
  const onCreateDraftClick = () => {
    if (!latestMessageId)
      return;

    // Updates the draft if one exists on the conversation
    if (typeof context.conversation.draftId !== 'undefined') {
      context.updateDraft(context.conversation.draftId, {
        updateMode: 'insert',
        content: {
          body: `Hello ${recipient}! Order ${recordData['PO Number']} is ${recordData['Status']} and expected to arrive on ${recordData['ETA']}.`,
          type: 'text'
        },
        replyOptions: {
          type: 'replyAll',
          originalMessageId: latestMessageId
        }
      });
    } else {
      // Creates a new draft if one does not exist
      context.createDraft({
        content: {
          body: `Hello ${recipient}! Order ${recordData['PO Number']} is ${recordData['Status']} and expected to arrive on ${recordData['ETA']}.`,
          type: 'text'
        },
        replyOptions: {
          type: 'replyAll',
          originalMessageId: latestMessageId
        }
      });
    }
    
  };

  // Display or hide plugin tabs
  const toggleDivs = (tabName: string) => {
    const tabs = document.getElementsByClassName('Tab');
    for (let tab of tabs) {
      (tab.id === tabName) ? tab.classList.remove('hidden') : tab.classList.add('hidden');
    }
  };

  // Update the value of the note as the user makes changes
  const onAddNoteChange = (value: string) => {
    setNewNote(value);
  };

  // Add a new note when user clicks Add Note button (mocked with Airtable API)
  const onAddNoteClick = async (newNote: string) => {
    if (newNote) {
      const newNoteObject = {
        fields: {
          Notes: newNote,
          Author: context.teammate.name,
          Date: new Date().toISOString().split('T')[0]
        }
      };

      try {
        const postResponse = await fetch(
          `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_NOTES_ID}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newNoteObject)
          }
        );

        if (!postResponse.ok) {
          throw new Error('Failed to post new note');
        }

        const getResponse = await fetch(
          `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_NOTES_ID}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`
            }
          }
        );

        if (!getResponse.ok) {
          throw new Error('Failed to fetch notes after post');
        }

        const data = await getResponse.json();
        setNotesData(data.records);
        setNewNote('');
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Update the value of the search as the user makes changes
  const onSearchChange = (value: string) => {
    setSearch(value);
  };

  // Search for a TMS record (mocked with Airtable API)
  const onSearchClick = async (search: string) => {
    if (search) {
      try {
        const response = await fetch(
          `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_ID}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Search request failed');
        }

        const data = await response.json();
        const matchFound = data.records.some((record: TMSRecord) => {
          if (record.fields.ID === search) {
            setSelectedItemId(record.fields.ID);
            setRecordData(record.fields);
            setNoMatch(false);
            setLoading(false);
            return true;
          } else {
            return false;
          }
        });

        if (!matchFound) {
          setEmptySearch(true);
        } else {
          setEmptySearch(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };


  const onRecordSelect = (recordId: string) => {
    setSelectedItemId(recordId);
    onSearchClick(recordId);
  };

  return (
    <div className="App">
      {loading && <PluginLayout><PluginHeader>Loading...</PluginHeader></PluginLayout>}
      {!loading && <SearchBar onSearchChange={onSearchChange} onSearchClick={onSearchClick} emptySearch={emptySearch} />}
      {!loading && !noMatch && <div>
        <PluginLayout>
          <PluginHeader>
            TMS Information for&nbsp;&nbsp;<Select placeholder={selectedItemId} headerLabel="Related TMS records" selectedValues={selectedItemId} layerRootId='story--components-select-basic'>
            {recordIds.map(item => (
              <SelectItem key={item} onClick={() => onRecordSelect(item) } isSelected={item === selectedItemId}>
                {item}
              </SelectItem>
              ))}
          </Select>
          </PluginHeader>
          <TabGroup>
            {tabs.map(tab => (
              <Tab key={tab} name={tab} isSelected={tab === selectedTab} onClick={ () => {
                setSelectedTab(tab);
                toggleDivs(tab);
                }
              } />
            ))}
          </TabGroup>
          <div id="Overview" className="Tab">
            <TwoColumnLayout data={recordData} displayOrder={displayOrder} />
            <hr />
            <TwoColumnLayout data={recordData} displayOrder={contactDisplayOrder} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <iframe src={`https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_MAPS_KEY}&origin=${recordData['Origin']}}&destination=${recordData['Destination']}&waypoints=${recordData['Leg 1 Destination']}|${recordData['Leg 2 Destination']}`} referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
          <div id="Documents" className="Tab hidden">
            {recordData.Documents && <DocumentManager data={recordData.Documents} />}
          </div>
          <div id="Notes" className="Tab hidden">
            {notesData && <NotesManager notes={notesData} onAddNoteChange={onAddNoteChange} onAddNoteClick={onAddNoteClick} />}
          </div>
        </PluginLayout>
        <PluginFooter>
          {latestMessageId && <Button type="primary" onClick={onCreateDraftClick}>Reply</Button>}
        </PluginFooter>
      </div>}
    </div>
  );
}

export default TMS;