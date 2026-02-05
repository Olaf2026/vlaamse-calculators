import React, { useState } from 'react';

export default function VlaamseCalculatorsHub() {
  const [selectedCalculator, setSelectedCalculator] = useState(null);

  const calculators = [
    {
      id: 'bruto-netto-werknemer',
      titel: 'Bruto-Netto: Werknemers',
      beschrijving: 'Bereken je netto loon als werknemer in loondienst',
      icon: '💰',
      kleur: 'from-blue-500 to-cyan-600',
      status: 'beschikbaar'
    },
    {
      id: 'bruto-netto-zelfstandige',
      titel: 'Bruto-Netto: Zelfstandigen',
      beschrijving: 'Bereken je netto inkomen als zelfstandige (hoofd-/bijberoep)',
      icon: '🚀',
      kleur: 'from-purple-500 to-pink-600',
      status: 'beschikbaar'
    },
    {
      id: 'groeipakket',
      titel: 'Groeipakket Calculator',
      beschrijving: 'Bereken hoeveel kinderbijslag je ontvangt, inclusief alle toeslagen',
      icon: '👶',
      kleur: 'from-green-500 to-emerald-600',
      status: 'beschikbaar'
    },
    {
      id: 'werkloosheid',
      titel: 'Werkloosheidsuitkering Checker',
      beschrijving: 'Check of je recht hebt op werkloosheidsuitkering in Vlaanderen',
      icon: '💼',
      kleur: 'from-blue-500 to-indigo-600',
      status: 'beschikbaar'
    },
    {
      id: 'bruto-netto-uitkering',
      titel: 'Netto Uitkering Calculator',
      beschrijving: 'Bereken je netto werkloosheidsuitkering na belastingen',
      icon: '📊',
      kleur: 'from-orange-500 to-red-600',
      status: 'beschikbaar'
    }
  ];

  if (selectedCalculator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setSelectedCalculator(null)}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Terug naar overzicht
          </button>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <iframe
              src={`/${selectedCalculator}.html`}
              className="w-full"
              style={{ height: 'calc(100vh - 120px)', border: 'none' }}
              title={selectedCalculator}
            />
            <p className="text-center text-sm text-gray-500 mt-4">
              💡 Tip: Deze calculators zijn ook beschikbaar als standalone bestanden
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <span className="text-4xl">🇧🇪</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Vlaamse & Belgische Calculators
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Alle essentiële calculators voor burgers in Vlaanderen & België op één plek
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Alle berekeningen gebaseerd op officiële 2025-2026 regels
          </div>
        </div>

        {/* Calculator Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {calculators.map((calc) => (
            <div
              key={calc.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
              onClick={() => window.open(`${calc.id}.html`, '_blank')}
            >
              <div className={`h-32 bg-gradient-to-br ${calc.kleur} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <span className="text-6xl transform group-hover:scale-110 transition-transform">{calc.icon}</span>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {calc.titel}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {calc.beschrijving}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {calc.status}
                  </span>
                  
                  <svg className="w-6 h-6 text-blue-500 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-8 h-8 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hoe het werkt
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Kies je calculator</h3>
              <p className="text-sm text-gray-600">Selecteer de calculator die bij jouw situatie past</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Vul je gegevens in</h3>
              <p className="text-sm text-gray-600">Stap voor stap door een eenvoudige vragenlijst</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Krijg je resultaat</h3>
              <p className="text-sm text-gray-600">Direct een duidelijke berekening met alle details</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-6">Waarom deze calculators?</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold mb-1">Officiële regels 2025-2026</h3>
                <p className="text-sm text-blue-100">Alle berekeningen gebaseerd op de nieuwste Belgische/Vlaamse wetgeving</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h3 className="font-semibold mb-1">Privacy gewaarborgd</h3>
                <p className="text-sm text-blue-100">Alle berekeningen gebeuren lokaal, geen data wordt opgeslagen</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <h3 className="font-semibold mb-1">Direct resultaat</h3>
                <p className="text-sm text-blue-100">Geen wachttijden, krijg direct je berekening</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <div>
                <h3 className="font-semibold mb-1">Interactieve scenario's</h3>
                <p className="text-sm text-blue-100">Speel met percentages en zie direct het effect</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Belangrijke disclaimer</h3>
              <p className="text-sm text-yellow-800">
                Deze calculators zijn bedoeld als <strong>indicatie en hulpmiddel</strong>. Hoewel ze gebaseerd zijn op officiële regels, 
                kunnen exacte bedragen verschillen door persoonlijke omstandigheden, gemeentelijke variaties, en specifieke situaties. 
                Voor officiële berekeningen en advies: raadpleeg altijd de bevoegde instanties (RVA, FOD Financiën, je ziekenfonds, etc.) 
                of een erkend adviseur.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="text-sm">
            Gemaakt met ❤️ voor alle Vlamingen en Belgen • Laatste update: Februari 2026
          </p>
          <p className="text-xs mt-2">
            Heb je feedback of suggesties? We horen het graag!
          </p>
        </div>
      </div>
    </div>
  );
}
