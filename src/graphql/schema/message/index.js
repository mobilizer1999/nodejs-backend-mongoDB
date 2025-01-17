const path = require('path');
const { gql, withFilter } = require('apollo-server');

const { MessageType } = require(path.resolve('src/lib/Enums'));

const pubsub = require(path.resolve('config/pubsub'));


const addMessage = require('./resolvers/addMessage');
const markMessageThreadReadBy = require('./resolvers/markMessageThreadReadBy');
const getMessageThreadCollection = require('./resolvers/getMessageThreadCollection');

const schema = gql`
    enum MessageSortFeature {
      CREATED_AT
    }

    enum MessageTypeEnum {
      ${MessageType.toGQL()}
    }

    input MessageSortInput {
      feature: MessageSortFeature! = CREATED_AT
      type: SortTypeEnum! = DESC
    }
    
    input MessageInput {
      thread: ID!
      type: MessageTypeEnum!
      data: String!
    }

    type Message {
      id: ID!
      thread: MessageThread!
      author: User!
      type: MessageTypeEnum!
      data: String!
      createdAt: Date!
      isRead: Boolean
    }

    type MessageThread {
      id: ID!
      tags: [String]!
      participants: [User!]!
      messages(limit: Int! = 10, sort: MessageSortInput = {}): [Message]!
      unreadMessages: Int!
    }

    type MessageThreadCollection {
      collection: [MessageThread]!
      pager: Pager
    }

    input MessageThreadFilterInput {
      hasUnreads: Boolean = null
    }

    extend type Query {
      """Allows: authorized user"""
      messages(thread: ID!, skip: Date, limit: Int! = 10, sort: MessageSortInput = {}): [Message]! @auth(requires: USER)
      messageThreads(filter: MessageThreadFilterInput = {}, page: PageInput = {}): MessageThreadCollection! @auth(requires: USER)
    }

    extend type Mutation {
      """Allows: authorized user"""
      addMessage(input: MessageInput!): Message! @auth(requires: USER)
      """Allows: authorized user"""
      markMessageThreadReadBy(thread: ID!, time: Date!): MessageThread! @auth(requires: USER)
    }

    extend type Subscription {
      """Allows: authorized user"""
      messageAdded(threads: [ID!], threadTags: [String!]): Message! @auth(requires: USER)
    }
`;

module.exports.typeDefs = [schema];

module.exports.resolvers = {
  Query: {
    messages(_, args, { user, dataSources: { repository } }) {
      return repository.message.get({
        blackList: user.blackList,
        ...args,
      });
    },
    messageThreads: getMessageThreadCollection,
  },
  Mutation: {
    addMessage,
    markMessageThreadReadBy,
  },
  Subscription: {
    messageAdded: {
      resolve: (payload) => payload,
      subscribe: withFilter(
        () => pubsub.asyncIterator(['MESSAGE_ADDED']),
        ({ thread, author }, { threads, threadTags }, { user }) => {
          if (!thread.participants.includes(user.id) || user.blackList.includes(author)) {
            return false;
          }

          if (threads || threadTags) {
            if (threads && threads.length) {
              if (threads.includes(thread.id)) {
                return true;
              }
            }

            if (threadTags && threadTags.length && thread.tags.length) {
              return thread.tags.reduce((acc, tag) => (acc || threadTags.includes(tag)), false);
            }

            return false;
          }

          return true;
        },
      ),
    },
  },
  Message: {
    thread(message, _, { dataSources: { repository } }) {
      return repository.messageThread.findOne(message.thread);
    },
    author(message, _, { dataSources: { repository } }) {
      return repository.user.load(message.author);
    },
    isRead(message, _, { dataSources: { repository }, user }) {
      if (!user) {
        return null;
      }
      return repository.userHasMessageThread.findOne(typeof message.thread === 'object' ? message.thread.id : message.thread, user.id).then(
        (threadRead) => (threadRead && threadRead.readBy ? message.createdAt.getTime() <= threadRead.readBy.getTime() : false),
      );
    },
  },
  MessageThread: {
    participants(thread, _, { dataSources: { repository }, user }) {
      if (!thread.participants.includes(user.id)) {
        return [];
      }
      return repository.user.loadList(thread.participants);
    },
    messages(thread, { limit, sort }, { user, dataSources: { repository } }) {
      return repository.message.get({
        blackList: user.blackList, thread, limit, sort,
      });
    },
    unreadMessages(thread, _, { dataSources: { repository }, user }) {
      return repository.userHasMessageThread.findOne(thread.id, user.id)
        .then((threadRead) => {
          if (threadRead) {
            return repository.message.getUnreadByTime({ blackList: user.blackList, thread: thread.id, time: threadRead.readBy });
          }
          return repository.message.get({ blackList: user.blackList, thread: thread.id });
        })
        .then((unreadMessages) => unreadMessages.length);
    },
  },
};
