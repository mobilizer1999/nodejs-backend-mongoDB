const path = require('path');
const { Validator } = require('node-input-validator');

const { ErrorHandler } = require(path.resolve('src/lib/ErrorHandler'));
const { UserInputError, ApolloError, ForbiddenError } = require('apollo-server');

const errorHandler = new ErrorHandler();

module.exports = async (obj, args, { dataSources: { repository }, user }) => {
  const validator = new Validator(
    args,
    { id: ['required', ['regex', '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}']] },
  );

  return validator.check()
    .then(async (matched) => {
      if (!matched) {
        throw errorHandler.build(validator.errors);
      }
    })
    .then(() => repository.userCartItem.getById(args.id))
    .then((userCartItem) => {
      if (!userCartItem) {
        throw new UserInputError(`Cart item (${args.id}) does not exist`, { invalidArgs: 'id' });
      }

      if (userCartItem.user !== user.id) {
        throw new ForbiddenError('You can not delete this Cart Item');
      }

      return repository.userCartItem.delete(args.id);
    })
    .catch((error) => {
      throw new ApolloError(`Failed to delete Cart Item. Original error: ${error.message}`, 400);
    });
};
