import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { ethers } from 'ethers';
import MyNFT from '../utils/MyNFT.json'; 
import env from "react-dotenv";


const MapComponent = ({ center, selectedLocation, address }) => {
  const map = useMap();
  
  // Update the map center
  map.setView(center);

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {selectedLocation && (
        <Marker position={selectedLocation} icon={L.icon({ iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png', iconSize: [38, 95], popupAnchor: [0, -45] })}>
          <Popup>{address}</Popup>
        </Marker>
      )}
    </>
  );
};

const Map = () => {

  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [nftMinted, setNftMinted] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [txnHash, setTxnHash] = useState('');

  const handleAddressChange = (e) => {
    setAddress(e.target.value);

    if (e.target.value.length > 2) {
      const encodedAddress = encodeURIComponent(e.target.value);
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodedAddress}&apiKey=9c327f9d05ce48c7a382c9ebb033ad29`;

      axios.get(url)
        .then(response => {
          setSuggestions(response.data.features);
          console.log(response);
        })
        .catch(err => {
          console.error('Error fetching autocomplete suggestions', err);
        });
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const { lat, lon } = suggestion.properties;
    setSelectedLocation([lat, lon]);
    setMapCenter([lat, lon]);
    setAddress(suggestion.properties.formatted);
    setSuggestions([]);
  };

  // Mint NFT
  const mintNFT = async () => {
    if (!selectedLocation || !address) {
      alert("Please select a location on the map.");
      return;
    }

    setLoading(true); // Start loading


    const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon_amoy');
    const wallet = new ethers.Wallet(env.REACT_APP_PRIVATE_KEY, provider);
    const nftContract = new ethers.Contract(MyNFT.contractAddress, MyNFT.abi, wallet);

    function generateOSMUrl(feature) {
      const { formatted } = feature.properties;
      const [lon, lat] = feature.properties.coordinates;
      const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
      return `${formatted}: ${url}`;
    }

    // Generate the OSM URL for the selected location
    const feature = {
      properties: {
        coordinates: [selectedLocation[1], selectedLocation[0]], // Geoapify uses [lon, lat]
        formatted: address,
      }
    };

    const osmUrl = generateOSMUrl(feature);
    console.log(osmUrl, "URL");

    const tokenURI = `${osmUrl}`;

    try {
      const tx = await nftContract.createNFT(wallet.address, tokenURI);
      console.log("Transaction hash:", tx.hash);
      setTxnHash(tx.hash); // Save transaction hash
      await tx.wait();
      console.log("NFT minted successfully.");
      setNftMinted(true); // Set the NFT minted state to true
    } catch (error) {
      console.error("Error minting NFT:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  

  return (
    <div style={{ padding: "5rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Search with Map and Generate NFT</h1>
      <input 
        type="text" 
        value={address} 
        onChange={handleAddressChange} 
        placeholder="Enter address" 
        style={{ width: '300px', padding: '8px' }}
      />
      <div>
        {suggestions.length > 0 && (
          <ul style={{ border: '1px solid #ccc', maxHeight: '150px', overflowY: 'auto', padding: '0', listStyleType: 'none' }}>
            {suggestions.map((suggestion, index) => (
              <li 
                key={index} 
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ padding: '8px', cursor: 'pointer', backgroundColor: '#fff', color: "black" }}
              >
                {suggestion.properties.formatted}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* <button 
        onClick={mintNFT}
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          backgroundColor: '#007BFF', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer', 
          position: 'relative',
          opacity: loading ? 0.6 : 1, // Show loading effect
          pointerEvents: loading ? 'none' : 'auto' // Disable button while loading
        }}
        disabled={loading}
      >
        {loading ? 'Minting NFT...' : 'Mint NFT'}
      </button> */}

    

        <div style={{ marginTop: '20px' }}>
          <h3>Mint NFT</h3>
          <input 
            type="text" 
            value={recipientAddress} 
            onChange={(e) => setRecipientAddress(e.target.value)} 
            placeholder="Enter recipient address" 
            style={{ width: '300px', padding: '8px' }}
            disabled={loading}
          />
          <button 
            onClick={mintNFT}
            style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
             {loading ? 'Minting NFT...' : 'Mint NFT'}
          </button>
        </div>

        {txnHash && (
          <p style={{ marginTop: '10px', color: '#007BFF' }}>
            Transaction Hash: {txnHash}
          </p>
        )}
      

      <MapContainer center={mapCenter} zoom={13} style={{ height: '500px', width: '100%', marginTop: '20px' }}>
        <MapComponent center={mapCenter} selectedLocation={selectedLocation} address={address} />
      </MapContainer>
    </div>
  );
};

export default Map;
