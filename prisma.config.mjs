export default {
  datasources: {
    db: {
      provider: "mysql",
      url: process.env.DATABASE_URL,
    },
  },
};
