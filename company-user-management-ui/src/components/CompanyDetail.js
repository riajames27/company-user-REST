   import React from 'react';
   import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

   const CompanyDetail = ({ company }) => {
       return (
           <div>
               <h2>{company.name}</h2>
               <p>{company.address}</p>
               <LoadScript googleMapsApiKey="YOUR_API_KEY">
                   <GoogleMap
                       mapContainerStyle={{ height: "400px", width: "800px" }}
                       center={{ lat: company.latitude, lng: company.longitude }}
                       zoom={10}
                   >
                       <Marker position={{ lat: company.latitude, lng: company.longitude }} />
                   </GoogleMap>
               </LoadScript>
           </div>
       );
   };

   export default CompanyDetail;
   