require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ dataPARC API bridge running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 dataPARC Server: ${process.env.DATAPARC_BASE_URL}`);
});

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://13.201.40.224',
    'http://13.201.40.224:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));