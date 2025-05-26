   import React, { useEffect, useState } from 'react';
   import axios from 'axios';

   const CompanyList = () => {
       const [companies, setCompanies] = useState([]);

       useEffect(() => {
           const fetchCompanies = async () => {
               const response = await axios.get('http://localhost:5000/api/companies');
               setCompanies(response.data);
           };
           fetchCompanies();
       }, []);

       return (
           <div>
               <h1>Companies</h1>
               <ul>
                   {companies.map(company => (
                       <li key={company.id}>{company.name}</li>
                   ))}
               </ul>
           </div>
       );
   };

   export default CompanyList;
   