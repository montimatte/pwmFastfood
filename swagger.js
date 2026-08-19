const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.0'});

const doc = {
    info: {
      title: 'Fastfood',
      description: 'Swagger delle api del progetto Fastfood'
    },
    host: 'localhost:3000'
  };

const outputFile = './swagger.json';
const inputFiles = ['./main.js'];

swaggerAutogen(outputFile,inputFiles, doc);
