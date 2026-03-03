require('dotenv').config()
const app = require('./src/index')
const Connect = require('./src/config/db')
const { connectRedis } = require('./src/config/redis')

const PORT = process.env.PORT || 3001;

Connect().then(async () => {
  await connectRedis()
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
  })
}).catch(err => {
  console.error("Startup error:", err);
});