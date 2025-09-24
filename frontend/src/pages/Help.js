import React, { useState, useEffect } from 'react';

export default function Help() {
  const [helpContent, setHelpContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('guide');

  useEffect(() => {
    loadHelpContent();
  }, [currentSection]);

  const loadHelpContent = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/help/${currentSection}`);
      const data = await response.json();
      setHelpContent(data);
    } catch (error) {
      console.error('Error loading help content:', error);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: '', label: 'Overview' },
    { id: 'guide', label: 'User Guide' },
    { id: 'faq', label: 'FAQ' },
    { id: 'videos', label: 'Video Tutorials' },
    { id: 'best-practices', label: 'Best Practices' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Help Topics</h2>
              <nav>
                <ul className="space-y-2">
                  {sections.map(section => (
                    <li key={section.id}>
                      <button
                        onClick={() => setCurrentSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                          currentSection === section.id
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {section.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {helpContent && (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    {helpContent.title}
                  </h1>
                  
                  {helpContent.description && (
                    <p className="text-gray-600 mb-8">{helpContent.description}</p>
                  )}

                  {/* Overview sections */}
                  {helpContent.sections && helpContent.sections.map((section, index) => (
                    <div key={index} className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {section.title}
                      </h2>
                      {section.description && (
                        <p className="text-gray-600 mb-4">{section.description}</p>
                      )}
                      {section.content && (
                        <div className="prose max-w-none">
                          <pre className="whitespace-pre-wrap text-gray-700">
                            {section.content}
                          </pre>
                        </div>
                      )}
                      {section.links && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {section.links.map((link, linkIndex) => (
                            <a
                              key={linkIndex}
                              href={link.url}
                              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              <h3 className="font-medium text-blue-600">{link.title}</h3>
                            </a>
                          ))}
                        </div>
                      )}
                      {section.practices && (
                        <div className="space-y-4 mt-4">
                          {section.practices.map((practice, practiceIndex) => (
                            <div key={practiceIndex} className="border-l-4 border-blue-500 pl-4">
                              <h3 className="font-medium text-gray-800">{practice.title}</h3>
                              <p className="text-gray-600 mt-1">{practice.description}</p>
                              {practice.example && (
                                <code className="block mt-2 p-2 bg-gray-100 rounded text-sm">
                                  {practice.example}
                                </code>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* FAQ categories */}
                  {helpContent.categories && helpContent.categories.map((category, index) => (
                    <div key={index} className="mb-8">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {category.title}
                      </h2>
                      <div className="space-y-4">
                        {category.questions.map((qa, qaIndex) => (
                          <div key={qaIndex} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium text-gray-800 mb-2">
                              {qa.question}
                            </h3>
                            <p className="text-gray-600">{qa.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Videos */}
                  {helpContent.videos && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {helpContent.videos.map((video, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                              <div className="text-gray-500 text-center">
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                                  </svg>
                                </div>
                                <p className="text-sm">Video: {video.duration}</p>
                              </div>
                            </div>
                            <h3 className="font-medium text-gray-800 mb-2">{video.title}</h3>
                            <p className="text-gray-600 text-sm">{video.description}</p>
                          </div>
                        ))}
                      </div>
                      
                      {helpContent.playlists && (
                        <div className="mt-8">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Playlists</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {helpContent.playlists.map((playlist, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-800">{playlist.title}</h4>
                                <p className="text-gray-600 text-sm mt-1">{playlist.description}</p>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                  <span>{playlist.video_count} videos</span>
                                  <span>{playlist.total_duration}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}