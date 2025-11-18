import React from 'react';
import { Music2, Mic2, Radio, ArrowRight, Sparkles, Play, Users, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onStartCreating: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartCreating }) => {
  const features = [
    {
      icon: <Music2 className="w-8 h-8 text-yellow-400 golden-icon-glow" />,
      title: "Neural Music Synthesis",
      description: "Advanced AI models transform your text into fully-produced songs with coherent vocals, harmonies, and instrumental arrangements—all generated from scratch in seconds"
    },
    {
      icon: <Mic2 className="w-8 h-8 text-cyan-400 golden-icon-glow" />,
      title: "Smart Lyrics Integration",
      description: "Professional structure tags for verses, choruses, and bridges ensure your custom lyrics align perfectly with musical arrangements, creating radio-ready compositions"
    },
    {
      icon: <Radio className="w-8 h-8 text-orange-400 golden-icon-glow" />,
      title: "Studio-Grade Output",
      description: "Export production-quality audio with mastered dynamics, balanced frequencies, and customizable formats—ready for streaming platforms, content creation, or professional use"
    }
  ];

  const stats = [
    { number: "60s", label: "Song Generation Time" },
    { number: "6", label: "Music Style Presets" },
    { number: "3000+", label: "Characters for Lyrics" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      {/* Golden Particles Background */}
      <div className="golden-particles">
        <div className="golden-particle"></div>
        <div className="golden-particle"></div>
        <div className="golden-particle"></div>
        <div className="golden-particle"></div>
        <div className="golden-particle"></div>
        <div className="golden-particle"></div>
      </div>

      {/* Header */}
      <header className="relative overflow-hidden golden-spotlight">
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center golden-sparkle">
                <Music2 className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white golden-glow-headline">Ice King AI Music Studio</h1>
                <p className="text-blue-200 text-sm">Professional Music Generation Platform • Instant Creation • Zero Experience Required</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-blue-200">
              <span className="flex items-center gap-1 golden-border-glow px-3 py-1 rounded-full">
                <Sparkles className="w-4 h-4 golden-icon-glow" />
                Professional Music Production
              </span>
              <span className="flex items-center gap-1 golden-border-glow px-3 py-1 rounded-full">
                <Play className="w-4 h-4 golden-icon-glow" />
                AI-Powered Music Generation
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24 golden-spotlight">
        <div className="max-w-5xl mx-auto">
          {/* Narrative Introduction */}
          <div className="mb-12 text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight golden-glow-headline">
              Ice King: The <span className="golden-text-gradient">AI Music Revolutionary</span> Building Tomorrow's Hit Factory
            </h2>

            {/* Main Story Paragraph */}
            <div className="text-left max-w-4xl mx-auto mb-10">
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed mb-6">
                <span className="font-bold text-white golden-text-gradient">Ice King is pioneering the future of AI-powered music creation from his digital fortress</span>,
                transforming text prompts into professional-grade songs with vocals, instrumentals, and studio-quality production
                in under 60 seconds. The platform that started as an experiment has evolved into a sophisticated music generation
                engine, capable of producing everything from ambient soundscapes to viral pop hits—all without requiring any
                musical training from its users.
              </p>

              <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                Unlike traditional music production that demands years of training and expensive equipment, Ice King's AI
                system democratizes creativity by offering <span className="font-semibold text-cyan-400">instant professional production,
                custom lyrics integration with structure tags, and six distinct musical style presets</span>. The platform
                processes complex musical arrangements through advanced neural networks, generating complete songs with coherent
                vocals, dynamic instrumentals, and mastered audio output—making professional music creation accessible to
                storytellers, content creators, and aspiring artists worldwide.
              </p>
            </div>
          </div>

          {/* Key Achievement Banner */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-yellow-400/40 rounded-2xl p-6 mb-10 golden-border-glow">
            <div className="text-center">
              <p className="text-lg text-yellow-400 font-bold mb-3 golden-text-gradient">
                Revolutionary AI Music Platform
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <span className="text-3xl font-bold text-white golden-glow-headline">60s</span>
                  <p className="text-blue-200 text-sm mt-1">Complete Song Generation</p>
                </div>
                <div>
                  <span className="text-3xl font-bold text-white golden-glow-headline">3000+</span>
                  <p className="text-blue-200 text-sm mt-1">Character Lyrics Support</p>
                </div>
                <div>
                  <span className="text-3xl font-bold text-white golden-glow-headline">∞</span>
                  <p className="text-blue-200 text-sm mt-1">Creative Possibilities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Capabilities */}
          <div className="text-center mb-10">
            <p className="text-lg text-blue-100 leading-relaxed max-w-3xl mx-auto mb-6">
              From viral content creators needing original soundtracks to musicians prototyping new ideas, Ice King's
              platform serves as a <span className="font-semibold text-yellow-400">creative co-pilot that transforms imagination
              into audio reality</span>. Each generation leverages cutting-edge AI models trained on vast musical
              datasets, ensuring outputs that rival human-composed tracks in complexity and emotional resonance.
            </p>
          </div>

          {/* Premium Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-yellow-400/30 rounded-full px-6 py-3 golden-border-glow golden-sparkle">
              <Sparkles className="w-5 h-5 text-yellow-400 golden-icon-glow" />
              <span className="text-yellow-400 font-medium">Zero Musical Experience Required • Studio-Quality Output</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={onStartCreating}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold text-lg px-8 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 shadow-2xl golden-glow-button"
            >
              <Music2 className="w-6 h-6" />
              Start Creating Your First AI Song
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-blue-300 text-sm mt-4">No signup • No downloads • Works instantly in your browser</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center transition-all duration-300 group golden-feature-card">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-slate-900/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 golden-sparkle">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-blue-200 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 golden-spotlight">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center golden-sparkle">
                <div className="text-5xl md:text-6xl font-bold golden-text-gradient mb-2">
                  {stat.number}
                </div>
                <p className="text-blue-200 text-lg font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 golden-feature-card">
            <h3 className="text-3xl font-bold text-white mb-6 golden-glow-headline">
              Join the AI Music Revolution
            </h3>
            <p className="text-xl text-blue-200 mb-8 leading-relaxed">
              Every day, creators worldwide use Ice King's platform to generate original soundtracks, viral content music, and professional demos.
              Whether you're a content creator seeking unique audio, a songwriter exploring new ideas, or simply curious about AI's creative potential—your
              next hit is just 60 seconds away.
            </p>
            <button
              onClick={onStartCreating}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold text-lg px-8 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 shadow-2xl golden-glow-button"
            >
              <Music2 className="w-6 h-6" />
              Start Creating Music Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer with Ice King YouTube Branding */}
      <footer className="px-4 py-8 border-t border-slate-700 footer-sparkles">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sparkle-burst">
              <div className="ice-king-profile-container">
                <img 
                  src="/images/ice-king-profile.jpg" 
                  alt="Ice King Profile Picture"
                  className="ice-king-profile"
                />
              </div>
              <span className="text-blue-200 font-medium">
                Created by{' '}
                <a 
                  href="http://www.youtube.com/@Iceking-612" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ice-king-link"
                  aria-label="Visit Ice King's YouTube channel"
                >
                  Ice King
                </a>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-blue-300">
              <span className="flex items-center gap-1 footer-sparkles">
                <Users className="w-4 h-4 golden-icon-glow" />
                Trusted by Musicians
              </span>
              <span className="flex items-center gap-1 footer-sparkles">
                <Music2 className="w-4 h-4 golden-icon-glow" />
                AI-Powered Creation
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;