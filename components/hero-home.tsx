"use client";

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { FaUser,FaFilter,FaSearchMinus, FaBars , FaChevronLeft, FaChevronRight ,FaCalendarAlt,FaSearch,FaInfoCircle, FaRegStar, FaMapMarkerAlt, FaStar, FaChevronDown, FaChevronUp  , FaBrain , FaShare, FaInstagram ,FaFacebook , FaTwitter , FaLinkedin} from 'react-icons/fa';
import Logo from "@/components/ui/logo";
import { FaEnvelope } from 'react-icons/fa';

// Use the URLs to fetch the CSVs
const CSV_URLS = [
    'https://canadabuys.canada.ca/opendata/pub/newTenderNotice-nouvelAvisAppelOffres.csv',
    'https://canadabuys.canada.ca/opendata/pub/openTenderNotice-ouvertAvisAppelOffres.csv'
];

const LOCAL_CSV_FILES = [
    './newTenderNotice.csv',
    './openTenderNotice.csv'
];

const SearchBar: React.FC = () => {
    const [contractsData, setContractsData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedContractType, setSelectedContractType] = useState('All');
    const [selectedCompanySize, setSelectedCompanySize] = useState('All');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedDistance, setSelectedDistance] = useState('');
    const [selectedContractValue, setSelectedContractValue] = useState<'All' | '<$10k' | '$10k - $20k' | '$20k+'>('All');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [popupVisible, setPopupVisible] = useState(true); // State for popup visibility

    useEffect(() => {
        const fetchAndParseCSV = async (url: string) => {
            const response = await fetch(`https://corsproxy.io/?url=${url}`);
            const data = await response.text();
            return new Promise<any>((resolve, reject) => {
                Papa.parse(data, {
                    complete: (result: any) => resolve(result.data),
                    error: (error: any) => reject(error)
                });
            });
        };

        const loadLocalCSV = async (path: string) => {
            const response = await fetch(path);
            const data = await response.text();
            return new Promise<any>((resolve, reject) => {
                Papa.parse(data, {
                    complete: (result: any) => resolve(result.data),
                    error: (error: any) => reject(error)
                });
            });
        };

        const loadData = async () => {
            try {
                // Attempt to fetch remote CSV files
                const dataArrays = await Promise.all(CSV_URLS.map(fetchAndParseCSV));
                const allData = dataArrays.flat();
                const contractsData = allData.map((row: any, index: number) => ({
                    id: index + 1,
                    title: row[0],
                    description: row[16],
                    startdate: row[5],
                    status: row[2],
                    clientName: row[33],
                    value: row[49],
                    duration: row[34],
                    contractType: row[7],
                    location: row[8],
                    companySize: row[9],
                    distance: row[10],
                    action: "Open",
                    link: row[63]
                }));
                setContractsData(contractsData);
            } catch (error) {
                console.error('Error fetching remote CSV files, falling back to local files:', error);

                try {
                    // Attempt to load local CSV files
                    const dataArrays = await Promise.all(LOCAL_CSV_FILES.map(loadLocalCSV));
                    const allData = dataArrays.flat();
                    const contractsData = allData.map((row: any, index: number) => ({
                        id: index + 1,
                        title: row[0],
                        description: row[16],
                        startdate: row[5],
                        status: row[2],
                        clientName: row[33],
                        value: row[49],
                        duration: row[34],
                        contractType: row[7],
                        location: row[8],
                        companySize: row[9],
                        distance: row[10],
                        action: "Open",
                        link: row[63]
                    }));
                    setContractsData(contractsData);
                } catch (localError) {
                    console.error('Error loading local CSV files:', localError);
                }
            }
        };

        loadData();
    }, []);


    const handleChangeSearchTerm = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleChangeStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStatus(event.target.value);
    };
    const handleToggleBookmark = (id: number) => {
        setContractsData((prevContracts) =>
            prevContracts.map((contract) =>
                contract.id === id ? { ...contract, bookmarked: !contract.bookmarked } : contract
            )
        );
    };



    const handleChangeContractType = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedContractType(event.target.value);
    };

    const handleChangeCompanySize = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCompanySize(event.target.value);
    };

    const handleChangeLocation = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedLocation(event.target.value);
    };

    const handleChangeDistance = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDistance(event.target.value);
    };

    const handleChangeContractValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedContractValue(event.target.value as 'All' | '<$10k' | '$10k - $20k' | '$20k+');
    };

    const toggleFilters = () => {
        setFiltersOpen(!filtersOpen);
    };

    const filteredContracts = contractsData
        .filter((contract) => {
            const matchesSearchTerm = contract.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = selectedStatus === 'All' || contract.status === selectedStatus;
            const matchesContractType = selectedContractType === 'All' || contract.contractType === selectedContractType;
            const matchesCompanySize = selectedCompanySize === 'All' || contract.companySize === selectedCompanySize;
            const matchesLocation = selectedLocation === '' || contract.location.toLowerCase().includes(selectedLocation.toLowerCase());
            const matchesDistance = selectedDistance === '' || parseInt(contract.distance.replace(/[^0-9]/g, '')) <= parseInt(selectedDistance);
            const matchesContractValue =
                selectedContractValue === 'All' ||
                (selectedContractValue === '<$10k' && parseInt(contract.value.replace(/[^0-9]/g, '')) < 10000) ||
                (selectedContractValue === '$10k - $20k' && parseInt(contract.value.replace(/[^0-9]/g, '')) >= 10000 && parseInt(contract.value.replace(/[^0-9]/g, '')) <= 20000) ||
                (selectedContractValue === '$20k+' && parseInt(contract.value.replace(/[^0-9]/g, '')) > 20000);

            return (
                matchesSearchTerm &&
                matchesStatus &&
                matchesContractType &&
                matchesCompanySize &&
                matchesLocation &&
                matchesDistance &&
                matchesContractValue
            );
        })
        .sort((a, b) => Number(b.bookmarked) - Number(a.bookmarked)); // Bookmarked contracts first


    // return (

    //     <div className="pt-20 pb-10 px-32 text-center bg-gray-100">

    //         {popupVisible && (
    //             <div className="fixed inset-0 bg-gray-800 bg-opacity-30 flex items-center justify-center z-50">
    //                 <div
    //                     className="relative bg-white rounded-lg shadow-md max-w-md w-full overflow-hidden animate-fade-in">
    //                     {/* Header */}
    //                     <div className="px-6 py-4 border-b border-gray-200">
    //                         <h2 className="text-lg font-semibold text-gray-800">
    //                             Contractual Beta Notice
    //                         </h2>
    //                     </div>

    //                     {/* Content */}
    //                     <div className="p-6 text-center">
    //                         <p className="text-gray-600 text-sm mb-4">
    //                             <strong>Version 1.1.1 Beta</strong>
    //                         </p>
    //                         <p className="text-gray-600 text-sm mb-4">
    //                             You may experience bugs while using this version. Not all features are in public beta as
    //                             of <strong>{new Date().toLocaleDateString()}</strong>.
    //                         </p>
    //                         <p className="text-gray-600 text-sm">
    //                             To use Contractual’s contract-getting tools, or to enlist the services of our
    //                             professionals, please contact us.
    //                         </p>
    //                     </div>

    //                     {/* Footer with Button */}
    //                     <div className="flex justify-center items-center px-6 py-4 bg-gray-50">
    //                         <button
    //                             onClick={() => setPopupVisible(false)}
    //                             className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-gray-900 transition-all"
    //                         >
    //                             I Understand
    //                         </button>
    //                     </div>
    //                 </div>
    //             </div>
    //         )}


    //         <div className="mb-16">
    //             <Logo/>
    //             <h1 className="text-5xl text-gray-800 mb-10 font-fantasy font-semibold">Contractual</h1>
    //         </div>

    //         <div className="w-full max-w-4xl mx-auto mb-6">
    //             <input
    //                 type="text"
    //                 placeholder="Search contracts..."
    //                 value={searchTerm}
    //                 onChange={handleChangeSearchTerm}
    //                 className="w-full p-4 text-lg border-2 border-blue-500 rounded-full focus:border-green-500 focus:shadow-md outline-none transition-colors duration-300 bg-gray-100"
    //             />
    //         </div>

    //         <div className="flex justify-between items-center mb-6">
    //             <h2 className="text-xl font-semibold">Filters</h2>
    //             <button
    //                 onClick={toggleFilters}
    //                 className="text-blue-500 hover:text-blue-700 transition-colors duration-300 flex items-center gap-2"
    //             >
    //                 {filtersOpen ? <FaChevronUp/> : <FaChevronDown/>}
    //                 <span>{filtersOpen ? 'Collapse' : 'Expand'}</span>
    //             </button>
    //         </div>

    //         <div
    //             className={`transition-all duration-500 ease-in-out ${filtersOpen ? 'max-h-[500px]' : 'max-h-0'} overflow-hidden`}
    //         >
    //             <div className="flex flex-wrap gap-6 justify-center mb-6">
    //                 <select
    //                     value={selectedStatus}
    //                     onChange={handleChangeStatus}
    //                     className="p-3 pr-12 pl-4 border-2 rounded-lg bg-gray-50 w-full sm:w-auto"
    //                 >
    //                     <option value="All">All Statuses</option>
    //                     <option value="Active">Active</option>
    //                     <option value="Inactive">Inactive</option>
    //                 </select>

    //                 <select
    //                     value={selectedContractType}
    //                     onChange={handleChangeContractType}
    //                     className="p-3 pr-12 pl-4 border-2 rounded-lg bg-gray-50 w-full sm:w-auto"
    //                 >
    //                     <option value="All">All Types</option>
    //                     <option value="Construction">Construction</option>
    //                     <option value="Plumbing">Plumbing</option>
    //                     <option value="HVAC">HVAC</option>
    //                 </select>

    //                 <select
    //                     value={selectedCompanySize}
    //                     onChange={handleChangeCompanySize}
    //                     className="p-3 pr-12 pl-4 border-2 rounded-lg bg-gray-50 w-full sm:w-auto"
    //                 >
    //                     <option value="All">All Company Sizes</option>
    //                     <option value="Individual">Individual</option>
    //                     <option value="Company of 5">Company of 5</option>
    //                     <option value="Company of 10">Company of 10</option>
    //                 </select>

    //                 <input
    //                     type="text"
    //                     placeholder="Location"
    //                     value={selectedLocation}
    //                     onChange={handleChangeLocation}
    //                     className="p-3 pr-12 pl-4 border-2 rounded-lg bg-gray-50 w-full sm:w-auto"
    //                 />

    //                 <input
    //                     type="text"
    //                     placeholder="Distance (miles)"
    //                     value={selectedDistance}
    //                     onChange={handleChangeDistance}
    //                     className="p-3 pr-12 pl-4 border-2 rounded-lg bg-gray-50 w-full sm:w-auto"
    //                 />

    //                 <select
    //                     value={selectedContractValue}
    //                     onChange={handleChangeContractValue}
    //                     className="p-3 pr-12 pl-4 border-2 rounded-lg bg-gray-50 w-full sm:w-auto"
    //                 >
    //                     <option value="All">All Values</option>
    //                     <option value="<$10k">Less than $10k</option>
    //                     <option value="$10k - $20k">$10k - $20k</option>
    //                     <option value="$20k+">Greater than $20k</option>
    //                 </select>
    //             </div>
    //         </div>

    //         <div className="flex flex-wrap gap-6 mt-10 justify-center">
    //             {filteredContracts
    //                 .sort((a, b) => Number(b.bookmarked) - Number(a.bookmarked)) // Sort to display bookmarked contracts first
    //                 .map((contract) => (
    //                     <div
    //                         key={contract.id}
    //                         className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-sm shadow-lg transform transition-transform duration-300 hover:scale-105"
    //                     >
    //                         <div className="flex items-center gap-3 justify-between mb-3">
    //                             <h3 className="text-lg text-gray-800 font-semibold hover:text-blue-500 transition-colors">
    //                                 {contract.title}
    //                             </h3>
    //                             <span
    //                                 className={`px-3 py-1 rounded-full text-sm font-medium ${
    //                                     contract.status === "Active"
    //                                         ? "bg-green-100 text-green-600"
    //                                         : "bg-red-100 text-red-600"
    //                                 }`}
    //                             >
    //                     {contract.status}
    //                 </span>
    //                         </div>
    //                         <p className="text-sm text-gray-600 leading-6 mb-3">
    //                             {contract.description}
    //                         </p>
    //                         <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
    //                             <FaUser/> Client: {contract.clientName}
    //                         </div>
    //                         <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
    //                             <FaEnvelope/> Contact Email: {contract.value}
    //                         </div>
    //                         <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
    //                             <FaTools/> Type: {contract.contractType}
    //                         </div>
    //                         <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
    //                             <FaMapMarkerAlt/> Location: {contract.duration}
    //                         </div>
    //                         <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
    //                             <FaCalendarAlt/> Contract Start Date: {contract.startdate}
    //                         </div>
    //                         <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
    //                             <FaCalendarAlt/> Publication Date: {contract.location}
    //                         </div>
    //                         <div className="flex items-center gap-4">
    //                             <button
    //                                 className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-green-500 transition-colors duration-300 font-medium focus:outline-none"
    //                             >
    //                                 <a href={contract.link}>{contract.action}</a>
    //                             </button>
    //                             <button
    //                                 title="AI Summary"
    //                                 className="bg-gray-200 text-gray-600 p-2 rounded-full hover:bg-gray-300 transition-colors focus:outline-none"
    //                             >
    //                                 <FaBrain/>
    //                             </button>
    //                             <button
    //                                 title="Save"
    //                                 onClick={() => handleToggleBookmark(contract.id)} // Bookmark toggle action
    //                                 className={`p-2 rounded-full transition-colors focus:outline-none ${
    //                                     contract.bookmarked
    //                                         ? "bg-yellow-400 text-white hover:bg-yellow-500"
    //                                         : "bg-gray-200 text-gray-600 hover:bg-gray-300"
    //                                 }`}
    //                             >
    //                                 <FaSave/>
    //                             </button>
    //                         </div>
    //                     </div>
    //                 ))}
    //         </div>

    //     </div>
    // );

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          {/* Navbar */}
          
      
          {/* Beta Notice Modal */}
          {popupVisible && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <div className="text-blue-600 text-lg">
                        <FaInfoCircle />
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Beta Version Notice</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                    Version 1.1.1 Beta
                  </div>
                  <p className="text-gray-700 mb-4">
                    You may experience bugs while using this version. Not all features are in public beta as of <strong>{new Date().toLocaleDateString()}</strong>.
                  </p>
                  <p className="text-gray-600 text-sm p-3 bg-gray-50 rounded-lg">
                    To use Contractual's contract-getting tools, or to enlist the services of our professionals, please contact us.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end">
                  <button
                    onClick={() => setPopupVisible(false)}
                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            </div>
          )}
      
          {/* Main Content */}
          <main className="pt-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Find Your Perfect Contract</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Browse our marketplace of contracts from trusted professionals across multiple industries
              </p>
            </div>
      
            {/* Search and Filters Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
              {/* Search */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={handleChangeSearchTerm}
                  className="w-full p-4 pl-12 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaSearch />
                </div>
              </div>
      
              {/* Filters Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-blue-600" />
                  <h2 className="text-lg font-medium text-gray-800">Filters</h2>
                </div>
                <button
                  onClick={toggleFilters}
                  className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  <span>{filtersOpen ? 'Hide Filters' : 'Show Filters'}</span>
                  {filtersOpen ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
      
              {/* Filter Options */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  filtersOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={handleChangeStatus}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
      
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Contract Type</label>
                    <select
                      value={selectedContractType}
                      onChange={handleChangeContractType}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="All">All Types</option>
                      <option value="Construction">Construction</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="HVAC">HVAC</option>
                    </select>
                  </div>
      
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Company Size</label>
                    <select
                      value={selectedCompanySize}
                      onChange={handleChangeCompanySize}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="All">All Company Sizes</option>
                      <option value="Individual">Individual</option>
                      <option value="Company of 5">Company of 5</option>
                      <option value="Company of 10">Company of 10</option>
                    </select>
                  </div>
      
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter location"
                        value={selectedLocation}
                        onChange={handleChangeLocation}
                        className="w-full p-3 pl-9 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <FaMapMarkerAlt />
                      </div>
                    </div>
                  </div>
      
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Distance</label>
                    <input
                      type="text"
                      placeholder="Distance (miles)"
                      value={selectedDistance}
                      onChange={handleChangeDistance}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
      
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Contract Value</label>
                    <select
                      value={selectedContractValue}
                      onChange={handleChangeContractValue}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="All">All Values</option>
                      <option value="<$10k">Less than $10k</option>
                      <option value="$10k - $20k">$10k - $20k</option>
                      <option value="$20k+">Greater than $20k</option>
                    </select>
                  </div>
                </div>
      
                <div className="flex justify-end">
                  <button className="text-sm text-gray-600 hover:text-gray-800 mr-4">
                    Reset Filters
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all text-sm">
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
      
            {/* Results Stats */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing <span className="font-medium text-gray-900">{filteredContracts.length}</span> results
              </p>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm">Sort by:</span>
                <select className="border border-gray-200 rounded-lg bg-white p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Most Recent</option>
                  <option>Highest Value</option>
                  <option>Closest Location</option>
                </select>
              </div>
            </div>
      
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContracts
                .sort((a, b) => Number(b.bookmarked) - Number(a.bookmarked))
                .map((contract) => (
                  <div
                    key={contract.id}
                    className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border ${
                      contract.bookmarked ? 'border-blue-200' : 'border-gray-100'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-800 line-clamp-1">{contract.title}</h3>
                        <button
                          onClick={() => handleToggleBookmark(contract.id)}
                          className={`p-2 rounded-full transition-colors focus:outline-none ${
                            contract.bookmarked
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-gray-400 hover:text-gray-500'
                          }`}
                        >
                          {contract.bookmarked ? <FaStar /> : <FaRegStar />}
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            contract.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {contract.status}
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
                          {contract.contractType}
                        </span>
                      </div>
                    </div>
      
                    {/* Card Body */}
                    <div className="p-5">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {contract.description}
                      </p>
                      
                      <div className="space-y-2 mb-5">
                        <div className="flex items-center gap-2 text-sm">
                          <FaUser className="text-gray-400" />
                          <span className="text-gray-700">{contract.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FaEnvelope className="text-gray-400" />
                          <span className="text-gray-700">{contract.value}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FaMapMarkerAlt className="text-gray-400" />
                          <span className="text-gray-700">{contract.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FaCalendarAlt className="text-gray-400" />
                          <span className="text-gray-700">{contract.startdate}</span>
                        </div>
                      </div>
      
                      {/* Card Actions */}
                      <div className="flex items-center gap-2">
                        <a 
                          href={contract.link}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex-1 py-2.5 px-4 rounded-lg transition-all text-center font-medium text-sm"
                        >
                          {contract.action}
                        </a>
                        <button
                          title="AI Summary"
                          className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                        >
                          <FaBrain />
                        </button>
                        <button
                          title="Share"
                          className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                        >
                        <FaShare />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
      
      {/* Empty State */}
      {filteredContracts.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-md">
          <div className="flex justify-center mb-4 text-gray-400">
            <FaSearchMinus className="text-5xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No contracts found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filter criteria to find what you're looking for.
          </p>
          <button 
            onClick={() => {
              /* Reset filters function here */
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}
      
      {/* Pagination */}
      <div className="mt-12 flex justify-center">
        <nav className="flex items-center gap-1">
          <button className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            <FaChevronLeft className="text-sm" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600 text-white">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
            2
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
            3
          </button>
          <span className="w-10 h-10 flex items-center justify-center text-gray-500">...</span>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
            10
          </button>
          <button className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            <FaChevronRight className="text-sm" />
          </button>
        </nav>
      </div>
    </main>
    
    {/* Footer */}
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo />
              <h3 className="text-xl font-bold">Contractual</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting professionals with the perfect contracts since 2020.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Find Contracts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Post Contracts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contract Templates</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Tools</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">© 2025 Contractual. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaTwitter />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaLinkedin />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaInstagram />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaFacebook />
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
);
};

export default SearchBar;
