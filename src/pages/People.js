import React, { useState, useEffect } from 'react';
import { User, Target, TrendingUp, MessageCircle, Lightbulb, Star, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const People = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const { user } = useAuth();

  // Listen for profile data from the Chrome extension side panel
  useEffect(() => {
    const handleWindowMessage = async (event) => {
      const payload = event.data;
      if (payload?.type === 'LINKIFY_PROFILE_DATA' && payload?.data) {
        setLoading(true);
        try {
          const peopledata = { profile: payload.data };

          console.log('peopledata', peopledata);
console.log(user.domain);
console.log(payload.data.linkedin_url);

          const response = await apiService.analyzePeopleData(payload.data.linkedin_url,user.domain,peopledata);
          setAnalysis(response.data);
          toast.success('Profile analyzed successfully');
        } catch (error) {
          console.error('Profile analysis error:', error);
          toast.error('Failed to analyze profile');
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, []);

  

  const getPersonaTypeColor = (type) => {
    const colors = {
      decision_maker: 'bg-red-100 text-red-800',
      sponsor: 'bg-blue-100 text-blue-800',
      influencer: 'bg-yellow-100 text-yellow-800',
      champion: 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Results */}
      {analysis?.analysis && (
        <div className="space-y-6">
          {/* Person Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start space-x-6">
              {/* <div className="bg-blue-100 rounded-full p-4">
               <User className="h-12 w-12 text-blue-600" /> 
              </div> */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{analysis.analysis.PersonDetails?.name}</h3>
                    <p className="text-gray-700 mt-1">{analysis.analysis.PersonDetails?.title}</p>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 mr-2" />
                        {analysis.analysis.PersonDetails?.company || '—'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {analysis.analysis.PersonDetails?.location || '—'}
                      </div>
                      {analysis.analysis.PersonDetails?.education && (
                        <div className="flex items-center text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          {analysis.analysis.PersonDetails.education}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.analysis.PersonDetails?.skills?.map((skill, idx) => (
                        <span key={idx} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ICP Fit Score and Personality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ICP Fit Score</h2>
              <div className="text-center mb-4">
                <div className={`text-3xl font-bold ${getScoreColor(analysis.analysis.ICP_FitScore?.score || 0, analysis.analysis.ICP_FitScore?.max_score || 10)}`}>
                  {analysis.analysis.ICP_FitScore?.score}/{analysis.analysis.ICP_FitScore?.max_score}
                </div>
              </div>
              <p className="text-sm text-gray-800 mb-3">{analysis.analysis.ICP_FitScore?.reasoning}</p>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Fit Factors</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {analysis.analysis.ICP_FitScore?.fit_factors?.map((factor, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="block w-1 h-1 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personality Profile</h2>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Communication Style</h4>
                  <p className="text-sm text-gray-800">{analysis.analysis.PersonalityTraits?.communication_style}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Decision Making Style</h4>
                  <p className="text-sm text-gray-800">{analysis.analysis.PersonalityTraits?.decision_making_style}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Motivators</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {analysis.analysis.PersonalityTraits?.key_motivators?.map((m, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="block w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Potential Objections</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {analysis.analysis.PersonalityTraits?.potential_objections?.map((o, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="block w-1 h-1 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Outreach Strategy */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Outreach Strategy</h2>
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Recommended Approach</h3>
                    <p className="text-gray-800">{analysis.analysis.OutreachPlan?.recommended_approach}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Key Talking Points</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {analysis.analysis.OutreachPlan?.key_talking_points?.map((p, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="block w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Method</h4>
                  <p className="text-sm text-gray-800 mb-3">{analysis.analysis.OutreachPlan?.best_contact_method}</p>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Timing</h4>
                  <p className="text-sm text-gray-800">{analysis.analysis.OutreachPlan?.timing_recommendations}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-start">
                  <MessageCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Personalized Message</h3>
                    <p className="text-gray-800 italic">{analysis.analysis.personalize_message_to_reach_out || analysis.analysis.personalize_linkedin_message_to_reach_out}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Insights */}
          {analysis.analysis.AdditionalInsights && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Shared Interests</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analysis.analysis.AdditionalInsights.shared_interests?.map((interest, idx) => (
                      <span key={idx} className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md">
                        {interest}
                      </span>
                    ))}
                  </div>
                  {/* <h4 className="text-sm font-medium text-gray-900 mb-3">Mutual Connections</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.analysis.AdditionalInsights.mutual_connections?.map((c, idx) => (
                      <span key={idx} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-md">
                        {c}
                      </span>
                    ))}
                  </div> */}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Conversation Starters</h4>
                  <ul className="text-sm text-gray-700 space-y-1 mb-4">
                    {analysis.analysis.AdditionalInsights.conversation_starters?.map((starter, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="block w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {starter}
                      </li>
                    ))}
                  </ul>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Red Flags</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {analysis.analysis.AdditionalInsights.red_flags?.map((flag, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="block w-1 h-1 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* If no analysis yet */}
      {!analysis?.analysis && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
          <p className="text-gray-600">Open a LinkedIn profile to populate this page automatically.</p>
        </div>
      )}
    </div>
  );
};

export default People;