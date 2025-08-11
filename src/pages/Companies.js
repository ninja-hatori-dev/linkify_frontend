import React, { useState, useEffect } from 'react';
import { Building2, Users, Target, TrendingUp, Lightbulb, ExternalLink, Globe } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Companies = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [peopleResults, setPeopleResults] = useState([]);
  const { user } = useAuth();


  const [domData, setDomData] = useState(null);
  
  // Derived helpers
  const companyInfo = analysis?.company?.analysis_data?.company_information || null;
  const personas = analysis?.company?.analysis_data?.personas || [];
  const peopleByPersonaType = peopleResults.reduce((acc, r) => {
    if (!r || !r.personaType) return acc;
    if (!acc[r.personaType]) acc[r.personaType] = [];
    acc[r.personaType].push(r);
    return acc;
  }, {});

  useEffect(() => {

    //get url
    const url = window.location.href;
    console.log('url', url);






    const handleWindowMessage = async (event) => {
      // Optional: restrict to the extension origin
      // if (!event.origin.startsWith('chrome-extension://')) return;
  
      const payload = event.data;
      console.log('Payload:', payload);
      if (payload?.type === 'LINKIFY_EXTENSION_DATA') {
        try {
          console.log('Data received via window message:', payload.data);
          const { url, scrapedData } = payload.data;
          setLinkedinUrl(url);
          setDomData(scrapedData);
          toast.success("LinkedIn data loaded! Running analysis...");

          if (!user?.domain) {
            toast.error('Account domain not found. Please check your profile settings.');
            return;
          }

          setLoading(true);
          const response = await apiService.analyzeCompanyData(url, user.domain, scrapedData);
          console.log('Analysis response:', response.data);
          setAnalysis(response.data);
          toast.success('Analysis completed successfully');
          if (response.data?.company?.analysis_data && window.parent) {
            console.log('Sending message to parent');
            window.parent.postMessage({
              type: 'START_PEOPLE_SEARCH',
             
              data: {
                companyName: response.data.company.analysis_data.company_information.company_name,
                personas: response.data.company.analysis_data.personas.map(persona => {
                  return {
                    type: persona.type,
                    linkedin_search_title: persona.linkedin_search_title
                  }
                })
              }
            }, '*');


console.log("window.parent", window.parent);

            console.log('Message sent to parent');
          }
        } catch (err) {
          console.error('Analysis error:', err);
          toast.error(err?.response?.data?.error || 'Failed to analyze company');
        } finally {
          setLoading(false);
        }
      } else if (payload?.type === 'LINKIFY_PEOPLE_RESULT') {
        try {
          const result = payload.data;
          setPeopleResults(prev => [...prev, result]);
          toast.success(`Received person for ${result.personaType}`);
        } catch (e) {
          console.error('Error handling people result:', e);
        }
      }
    };
  
    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, []);





 

 
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {loading && !analysis && (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      )}
      {!loading && !analysis && (
        <div className="min-h-[40vh] flex items-center justify-center text-gray-500">
          Load a LinkedIn company page via the extension to start analysis.
        </div>
      )}
      {analysis && (
        <>
          {/* Company Header */}
          {companyInfo && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <h1 className="text-2xl font-semibold text-gray-900">{companyInfo.company_name}</h1>
                  </div>
                  {companyInfo.industry && (
                    <p className="text-sm text-gray-500 mt-1">{companyInfo.industry}</p>
                  )}
                </div>
                {analysis?.company?.linkedin_url && (
                  <a
                    href={analysis.company.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View on LinkedIn <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              {companyInfo.description && (
                <p className="mt-4 text-gray-700 leading-relaxed">{companyInfo.description}</p>
              )}
            </div>
          )}

          {/* Personas to Reach */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Personas to Reach</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personas
                .filter((persona) => (peopleByPersonaType[persona.type] || []).length > 0)
                .map((persona, idx) => {
                  const matches = peopleByPersonaType[persona.type] || [];
                  const match = matches[0];
                  return (
                    <div key={`${persona.type}-${idx}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-gray-500">{persona.type.replace(/_/g, ' ')}</div>
                        </div>
                        {/* <div className="text-xs rounded-full px-2 py-1 bg-purple-50 text-purple-700 whitespace-nowrap">{persona.linkedin_search_title}</div> */}
                      </div>

                      {/* First match if available */}
                      {match?.person && (
                        <div className="mt-4 flex items-start gap-3">
                          {match.person.imageUrl ? (
                            <img src={match.person.imageUrl} alt={match.person.name} className="h-10 w-10 rounded-full object-cover border" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-100" />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <a
                                href={match.person.profileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-gray-900 hover:underline truncate"
                              >
                                {match.person.name}
                              </a>
                              <a href={match.person.profileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                            {match.person.title && (
                              <div className="text-sm text-gray-600 mt-0.5 line-clamp-2">{match.person.title}</div>
                            )}
                            {match.person.summary && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-1">{match.person.summary}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Companies;