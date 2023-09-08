import { FC, useState, useEffect } from 'react';
import { useFrontContext, Message, PaginatedResults } from '../../providers/frontContext';
import { File as UIFile, Button, Heading, FileTypesEnum } from '@frontapp/ui-kit';

interface Document {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
}

interface DocumentManagerProps {
  data: Document[];
}

const DocumentManager: FC<DocumentManagerProps> = ({ data }) => {
  // A component that renders attachments from an external system and from the current conversation
  // Allows the user to add attachments to the draft
  const context = useFrontContext();
  const [latestMessageId, setLatestMessageId] = useState<string | undefined>();
  const [conversationFiles, setConversationFiles] = useState<Document[]>([]);

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

  // Calls the function to list all attachments in the conversation
useEffect(() => {
  const collectedPairs: { messageId: string; attachmentId: string }[] = [];

  const listConversationAttachments = async (context: any, nextPageToken?: string) => {
    try {
      // Get the list of messages in the conversation
      const messagesResponse = await context.listMessages(nextPageToken);

      // Collect the IDs of every message and attachment pair
      if (messagesResponse.results.length > 0) {
        for (const result of messagesResponse.results) {
          if (result.content && result.content.attachments && result.content.attachments.length > 0) {
            const messageWithAttachment = {
              messageId: result.id,
              attachmentId: result.content.attachments[0].id,
            };

            collectedPairs.push(messageWithAttachment);
          }
        }

        // If there are more message pages, call the function recursively
        if (messagesResponse.nextPageToken) {
          await listConversationAttachments(context, messagesResponse.nextPageToken);
        } else {
          // Download the identified attachments from the SDK to get file details
          const attachmentPromises = collectedPairs.map(pair =>
            context.downloadAttachment(pair.messageId, pair.attachmentId)
              .then((downloadResponse: File | undefined) => ({
                id: downloadResponse?.lastModified,
                filename: downloadResponse?.name,
                size: downloadResponse?.size,
                type: downloadResponse?.type,
                url: 'https://front.com',
              }))
          );

          // Update the state with the result of the promises from the downloadAttachment method
          const updatedFiles = await Promise.all(attachmentPromises);
          setConversationFiles(updatedFiles);
        }
      }
    } catch (error) {
      console.error('Error listing or downloading attachments:', error);
    }
  };

  listConversationAttachments(context);
}, [context]);

  const addAttachment = async (filePath: string, name: string, type: string) => {
    // Adds attachments to an existing or new draft when the user clicks the Attach button
    // Note: Attachments are mocked with the sample.txt file when this function is called
    // A production version should process attachments from a file server or document API
    try {
      // Fetch the file content using the fetch API
      const response = await fetch(filePath);
      const fileBlob = await response.blob(); // Convert the response to a Blob

      // Create the File object
      const attachment = new File([fileBlob], name, {
        type: type,
      });

      if (typeof context.conversation.draftId !== 'undefined') {
        context.updateDraft(context.conversation.draftId, {
          updateMode: 'insert',
          attachments: [attachment],
        });
      } else {
        if (!latestMessageId) return;

        context.createDraft({
          content: {
            body: `Hello there. Please see attached.`,
            type: 'text',
          },
          attachments: [attachment],
          replyOptions: {
            type: 'replyAll',
            originalMessageId: latestMessageId,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching or processing the file:', error);
    }
  };

  const getExtension = (filetype: string): FileTypesEnum => {
    const lowercaseFiletype = filetype.toLowerCase();

    switch (true) {
      case lowercaseFiletype.includes('image'):
        return FileTypesEnum.IMAGE;
      case lowercaseFiletype.includes('pdf'):
        return FileTypesEnum.PDF;
      case lowercaseFiletype.includes('word'):
        return FileTypesEnum.WORD;
      case lowercaseFiletype.includes('powerpoint'):
        return FileTypesEnum.POWERPOINT;
      case lowercaseFiletype.includes('csv'):
      case lowercaseFiletype.includes('excel'):
        return FileTypesEnum.EXCEL;
      case lowercaseFiletype.includes('video'):
        return FileTypesEnum.VIDEO;
      case lowercaseFiletype.includes('audio'):
        return FileTypesEnum.AUDIO;
      case lowercaseFiletype.includes('text/plain'):
        return FileTypesEnum.TEXT;
      default:
        return FileTypesEnum.GENERIC;
    }
};

  return (
    <div style={{ padding: '30px' }}>
      <Heading>From TMS</Heading>
      {data.map((document) => (
        <div key={document.id} style={{ display: 'flex' }}>
          <div style={{ flex: '50%' }}>
            <a href={document.url} target="_blank" style={{ textDecoration: 'none' }}>
              <UIFile
                fileName={document.filename}
                fileSize={document.size / 1000}
                fileType={getExtension(document.type)}
              />
            </a>
          </div>
          <div style={{ flex: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {latestMessageId && (
              <Button
                type="secondary"
                onClick={() => addAttachment('./sample.txt', document.filename, document.type)}
              >
                Attach
              </Button>
            )}
          </div>
        </div>
      ))}
      <Heading>From this conversation</Heading>
      {conversationFiles.map((document) => (
        <div key={document.id} style={{ display: 'flex' }}>
          <div style={{ flex: '50%' }}>
            <a href={document.url} target="_blank" style={{ textDecoration: 'none' }}>
              <UIFile
                fileName={document.filename}
                fileSize={document.size / 1000}
                fileType={getExtension(document.type)}
              />
            </a>
          </div>
          <div style={{ flex: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {latestMessageId && (
              <Button
                type="secondary"
                onClick={() => addAttachment('./sample.txt', document.filename, document.type)}
              >
                Attach
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentManager;