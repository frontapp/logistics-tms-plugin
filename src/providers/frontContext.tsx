import {createContext, useContext, useEffect, useState, FC} from 'react';
import {ConversationContext} from '@frontapp/plugin-sdk';
import Front from '@frontapp/plugin-sdk';

/*
 * Context.
 */

export const FrontContext = createContext<ConversationContext | undefined>(undefined);

/*
 * Hook.
 */

export function useFrontContext() {
  return useContext(FrontContext);
}

/*
 * Component.
 */

export const FrontContextProvider: FC<{children: React.ReactElement}> = ({children}) => {
  const [context, setContext] = useState<ConversationContext>();

  useEffect(() => {
    const subscription = Front.contextUpdates.subscribe(frontContext => {
      setContext(frontContext as ConversationContext);
    })
    return () => subscription.unsubscribe();
  }, [])

  return (
    <FrontContext.Provider value={context}>
      {children}  
    </FrontContext.Provider>
  )
}