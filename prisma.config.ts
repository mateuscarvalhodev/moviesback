export default {
  schema: "src/prisma/schema.prisma",

  migrations: {
    source: "src/infra/db/migrations",
  },

  migrate: {},
};
