   require('dotenv').config();
   const express = require('express');
   const bodyParser = require('body-parser');
   const cors = require('cors');
   const companiesRoutes = require('./routes/companies');
   const usersRoutes = require('./routes/users');

   const app = express();
   app.use(cors());
   app.use(bodyParser.json());

   app.use('/api/companies', companiesRoutes);
   app.use('/api/users', usersRoutes);

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => {
       console.log(`Server is running on port ${PORT}`);
   });
   