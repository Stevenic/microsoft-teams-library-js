import { app } from '../../src/public/app';
import { chat, OpenGroupChatRequest, OpenSingleChatRequest } from '../../src/public/chat';
import { Utils } from '../utils';

describe('chat', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('openChat', () => {
    it('should not allow calls before initialization', () => {
      const chatRequest: OpenSingleChatRequest = {
        user: 'someUPN',
        message: 'someMessage',
      };
      return expect(chat.openChat(chatRequest)).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');
      const chatRequest: OpenSingleChatRequest = {
        user: 'someUPN',
        message: 'someMessage',
      };
      return expect(chat.openChat(chatRequest)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should successfully pass chatRequest', async () => {
      await utils.initializeWithContext('content');
      const chatRequest: OpenSingleChatRequest = {
        user: 'someUPN',
        message: 'someMessage',
      };

      chat.openChat(chatRequest);

      const chatResponse = {
        members: 'someUPN',
        message: 'someMessage',
      };

      const openChatMessage = utils.findMessageByFunc('chat.openChat');
      expect(openChatMessage).not.toBeNull();
      expect(openChatMessage.args).toEqual([chatResponse]);
    });
  });

  describe('openGroupChat', () => {
    it('should not allow calls before initialization', () => {
      const chatRequest: OpenGroupChatRequest = {
        users: ['someUPN', 'someUPN2'],
        message: 'someMessage',
      };
      return expect(chat.openGroupChat(chatRequest)).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls when no members are provided', () => {
      const chatRequest: OpenGroupChatRequest = {
        users: [],
        message: 'someMessage',
      };
      return expect(chat.openGroupChat(chatRequest)).rejects.toThrowError('OpenGroupChat Failed: No users specified');
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');
      const chatRequest: OpenGroupChatRequest = {
        users: ['someUPN', 'someUPN2'],
        message: 'someMessage',
      };
      return expect(chat.openGroupChat(chatRequest)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should successfully pass chatRequest', async () => {
      await utils.initializeWithContext('content');
      const chatRequest: OpenGroupChatRequest = {
        users: ['someUPN', 'someUPN2'],
        message: 'someMessage',
        topic: 'someTopic',
      };

      const chatResponse = {
        members: ['someUPN', 'someUPN2'],
        message: 'someMessage',
        topic: 'someTopic',
      };

      chat.openGroupChat(chatRequest);

      const openChatMessage = utils.findMessageByFunc('chat.openChat');
      expect(openChatMessage).not.toBeNull();
      expect(openChatMessage.args).toEqual([chatResponse]);
    });
  });
});
