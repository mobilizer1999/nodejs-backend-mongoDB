const { gql } = require('apollo-server');

const schema = gql`
    type ProductCategory {
        id: ID!
        name: String!
        level: Int!
        parent: ProductCategory
        parents: [ProductCategory]!
        hasChildren: Boolean!
        image: Asset
        liveStreamCategory: LiveStreamCategory
    }

    type ProductCategoryCollection {
        collection: [ProductCategory]!
        pager: Pager
    }

    extend type Query {
        searchProductCategory(query: String!, page: PageInput = {}): ProductCategoryCollection!
        productCategories(parent: ID): [ProductCategory]!
        productCategory(id: ID!): ProductCategory
    }
`;

module.exports.typeDefs = [schema];


const emptyResult = {
  collection: [],
  pager: {
    total: 0,
  },
};

function composeTypeResult(page) {
  return ([collection, total]) => ({
    ...emptyResult,
    collection: collection || [],
    pager: {
      ...page, total,
    },
  });
}

module.exports.resolvers = {
  Query: {
    searchProductCategory: async (_, { query, page }, { dataSources: { repository } }) => {
      if (query.length < 2) {
        return composeTypeResult(page)([null, 0]);
      }

      return Promise.all([
        repository.productCategory.searchByName(query, page),
        repository.productCategory.getCountBySearch(query),
      ])
        .then(composeTypeResult(page));
    },
    productCategories: async (_, { parent = null }, { dataSources: { repository } }) => (
      repository.productCategory.getByParent(parent)
    ),
    productCategory: async (_, { id }, { dataSources: { repository } }) => (
      repository.productCategory.getById(id)
    ),
  },
  ProductCategory: {
    parent: async (productCategory, _, { dataSources: { repository } }) => {
      if (!productCategory.parent) {
        return null;
      }
      return repository.productCategory.getById(productCategory.parent);
    },
    parents: async ({ parents }, _, { dataSources: { repository } }) => {
      if (parents.length === 0) {
        return [];
      }
      return repository.productCategory.findByIds(parents);
    },
    image: async ({ image }, _, { dataSources: { repository } }) => {
      if (!image) {
        return null;
      }
      return repository.asset.getById(image);
    },
    liveStreamCategory: async (productCategory, _, { dataSources: { repository } }) => {
      if (!productCategory.liveStreamCategory) {
        return null;
      }
      return repository.liveStreamCategory.getById(productCategory.liveStreamCategory);
    },
  },
};
