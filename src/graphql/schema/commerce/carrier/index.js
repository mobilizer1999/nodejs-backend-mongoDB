const { gql } = require('apollo-server');

const schema = gql`
    type Carrier {
        id: ID!
        name: String!
        workInCountries: [Country]!
    }

    extend type Query {
        """
        Allows: authorized user
        Fetch carriers which User can use in his country
        """
        carriers: [Carrier]! @auth(requires: USER)
    }
`;

module.exports.typeDefs = [schema];

module.exports.resolvers = {
  Query: {
    carriers(_, args, { dataSources: { repository }, user }) {
      return repository.carrier.getAll({ workInCountries: user.address.country });
    },
  },
  Carrier: {
    workInCountries({ workInCountries }, args, { dataSources: { repository } }) {
      return repository.country.loadList(workInCountries);
    },
  },
};
