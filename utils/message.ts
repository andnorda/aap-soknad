import messagesNb from '../translations/nb.json';
import messagesNn from '../translations/nn.json';

export type Locale = 'nb' | 'nn';

export type Messages = {
  [K in Locale]?: { [name: string]: string };
};

export function flattenMessages(nestedMessages: object, prefix = '') {
  return Object.keys(nestedMessages).reduce((messages, key) => {
    // @ts-ignore
    let value = nestedMessages[key];
    let prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      // @ts-ignore
      messages[prefixedKey] = value;
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey));
    }

    return messages;
  }, {});
}

export const messages: Messages = {
  nb: flattenMessages(messagesNb),
  nn: flattenMessages(messagesNn),
};
