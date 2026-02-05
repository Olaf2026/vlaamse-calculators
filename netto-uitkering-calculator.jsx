import React, { useState } from 'react';

export default function NettoUitkeringCalculator() {
  const [phase, setPhase] = useState('initial');
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  // Loonplafonds RVA 2025 (geldig vanaf 1/2/2025)
  const LOONPLAFOND = {
    eerste6maanden: 2754.76,
    rest: 2574.25
  };

  const BEDRIJFSVOORHEFFING = 0.1009;  // 10,09%

  const berekenNetto = (inputData) => {
    const brutoLoon = parseFloat(inputData.brutoLoon);
    const gezinssituatie = inputData.gezinssituatie;
    const maandenWerkloos = parseInt(inputData.maandenWerkloos) || 0;
    const jarenWerkervaring = parseInt(inputData.werkervaring) || 0;
    
    // Bepaal toepasselijk loonplafond
    const plafond = maandenWerkloos < 6 ? LOONPLAFOND.eerste6maanden : LOONPLAFOND.rest;
    const begrensLoon = Math.min(brutoLoon, plafond);
    
    // Bepaal percentage op basis van periode en gezinssituatie
    let percentage;
    let fase;
    
    if (maandenWerkloos < 3) {
      // Eerste 3 maanden
      percentage = 0.65;
      fase = "Eerste 3 maanden (instapfase)";
    } else if (maandenWerkloos < 12) {
      // Maand 4-12
      if (gezinssituatie === 'gezinslast') {
        percentage = 0.60;
      } else if (gezinssituatie === 'alleenwonend') {
        percentage = 0.60;
      } else {
        percentage = 0.55;
      }
      fase = "Maand 4-12 (eerste periode)";
    } else {
      // Na 12 maanden - degressief systeem
      const extraMaanden = Math.floor(jarenWerkervaring) * 2;  // 2 maanden per jaar werkervaring
      const totaleEerstePeriodemanden = Math.min(12 + extraMaanden, 48);
      
      if (maandenWerkloos < totaleEerstePeriodemanden) {
        // Nog in eerste periode met dezelfde percentages
        if (gezinssituatie === 'gezinslast') {
          percentage = 0.60;
        } else if (gezinssituatie === 'alleenwonend') {
          percentage = 0.60;
        } else {
          percentage = 0.55;
        }
        fase = `Verlengde eerste periode (${maandenWerkloos}/${totaleEerstePeriodemanden} maanden)`;
      } else {
        // Tweede periode - degressief
        if (gezinssituatie === 'gezinslast') {
          percentage = 0.55;
        } else if (gezinssituatie === 'alleenwonend') {
          percentage = 0.50;
        } else {
          percentage = 0.40;
        }
        fase = "Tweede periode (degressieve fase)";
      }
    }
    
    // Berekening
    const brutoUitkering = begrensLoon * percentage;
    const bedrijfsvoorheffing = brutoUitkering * BEDRIJFSVOORHEFFING;
    const nettoUitkering = brutoUitkering - bedrijfsvoorheffing;
    
    // Vergelijking met netto loon (schatting: ~67% van bruto)
    const geschatNetto LoonWasWerk = brutoLoon * 0.67;
    const inkomstenverlies = geschatNettoLoonWasWerk - nettoUitkering;
    const verliesPercentage = (inkomstenverlies / geschatNettoLoonWasWerk) * 100;
    
    return {
      brutoLoon: brutoLoon,
      loonplafond: plafond,
      begrensLoon: begrensLoon,
      percentage: percentage * 100,
      brutoUitkering: brutoUitkering,
      bedrijfsvoorheffing: bedrijfsvoorheffing,
      nettoUitkering: nettoUitkering,
      fase: fase,
      vergelij king: {
        geschatNettoLoonWasWerk: geschatNettoLoonWasWerk,
        inkomstenverlies: inkomstenverlies,
        verliesPercentage: verliesPercentage
      }
    };
  };

  const restart = () => {
    setPhase('initial');
    setData({});
    setResult(null);
  };

  const goBack = () => {
    if (phase === 'result') setPhase('werkervaring');
    else if (phase === 'werkervaring') setPhase('maanden');
    else if (phase === 'maanden') setPhase('gezinssituatie');
    else if (phase === 'gezinssituatie') setPhase('initial');
  };

  const handleBrutoLoon = (value) => {
    setData({ brutoLoon: value });
    setPhase('gezinssituatie');
  };

  const handleGezinssituatie = (value) => {
    setData({ ...data, gezinssituatie: value });
    setPhase('maanden');
  };

  const handleMaanden = (value) => {
    setData({ ...data, maandenWerkloos: value });
    setPhase('werkervaring');
  };

  const handleWerkervaring = (value) => {
    const finalData = { ...data, werkervaring: value };
    setData(finalData);
    
    const berekening = berekenNetto(finalData);
    setResult(berekening);
    setPhase('result');
  };

  // Result screen
  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <button
              onClick={goBack}
              className="mb-4 text-orange-600 hover:text-orange-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Terug
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Jouw Netto Werkloosheidsuitkering</h2>
              
              <div className="bg-orange-50 rounded-lg p-6 mt-6 border-2 border-orange-200">
                <div className="text-sm text-gray-600 mb-2">{result.fase}</div>
                <div className="text-5xl font-bold text-orange-600 mb-2">€{result.nettoUitkering.toFixed(2)}</div>
                <div className="text-sm text-gray-600">netto per maand</div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Uitkering berekend op <span className="font-semibold">{result.percentage.toFixed(0)}%</span> van je begrensd bruto loon
              </div>
            </div>

            {/* Detailed breakdown */}
            <div className="space-y-4 mb-8">
              {/* Berekening */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 text-orange-600 font-bold">1</span>
                  Berekening uitkering
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Je laatste bruto maandloon:</span>
                    <span className="font-medium">€{result.brutoLoon.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-700">
                    <span>RVA loonplafond:</span>
                    <span className="font-medium">€{result.loonplafond.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold">Begrensd loon voor berekening:</span>
                    <span className="font-semibold">€{result.begrensLoon.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-700">
                    <span>Uitkeringspercentage ({result.fase}):</span>
                    <span className="font-medium">{result.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold">Bruto uitkering:</span>
                    <span className="font-semibold">€{result.brutoUitkering.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Aftrek */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600 font-bold">2</span>
                  Bedrijfsvoorheffing
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bruto uitkering:</span>
                    <span className="font-medium">€{result.brutoUitkering.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-700">
                    <span>Bedrijfsvoorheffing ({(BEDRIJFSVOORHEFFING * 100).toFixed(2)}%):</span>
                    <span className="font-medium">-€{result.bedrijfsvoorheffing.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold">Netto uitkering:</span>
                    <span className="font-semibold text-green-700">€{result.nettoUitkering.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Vergelijking */}
              <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                <h3 className="font-bold text-lg text-blue-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600 font-bold">📉</span>
                  Vergelijking met je netto loon
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Geschat netto loon (was je werkend):</span>
                    <span className="font-medium">€{result.vergelijking.geschatNettoLoonWasWerk.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Je netto uitkering:</span>
                    <span className="font-medium">€{result.nettoUitkering.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-300">
                    <span className="font-semibold text-blue-800">Inkomstenverlies:</span>
                    <span className="font-semibold text-red-600">-€{result.vergelijking.inkomstenverlies.toFixed(2)} ({result.vergelijking.verliesPercentage.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-2">Belangrijke informatie:</h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Dit is een <strong>schatting</strong> van je netto werkloosheidsuitkering</li>
                <li>• Uitkeringen zijn <strong>degressief</strong>: ze dalen over tijd</li>
                <li>• Eerste 3 maanden: 65% van begrensd loon</li>
                <li>• Daarna 60% (gezinslast/alleenwonend) of 55% (samenwonend)</li>
                <li>• Na 12 maanden + 2 maanden per jaar werkervaring dalen de percentages verder</li>
                <li>• Bedrijfsvoorheffing van 10,09% wordt maandelijks ingehouden</li>
                <li>• Exacte bedragen kunnen verschillen - raadpleeg de RVA of je vakbond</li>
              </ul>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                LET OP: Belastingvermindering wordt afgeschaft!
              </h3>
              <p className="text-sm text-red-800">
                Vanaf 2026 wordt de belastingvermindering voor werkloosheidsuitkeringen geleidelijk afgeschaft. 
                Dit betekent dat je bij je belastingaangifte mogelijk <strong>extra belasting</strong> zult moeten betalen 
                bovenop de bedrijfsvoorheffing die al is ingehouden. Het werkelijke netto bedrag kan dus lager uitvallen.
              </p>
            </div>

            <button
              onClick={restart}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Nieuwe berekening
            </button>

            <div className="mt-6 text-center text-sm text-gray-500">
              Gebaseerd op RVA-regels 2025-2026 • Loonplafonds geïndexeerd
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Werkervaring phase
  if (phase === 'werkervaring') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <button
              onClick={goBack}
              className="mb-4 text-orange-600 hover:text-orange-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Terug
            </button>

            <div className="mb-6">
              <span className="text-sm font-medium text-orange-600">Stap 4 van 4</span>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Hoeveel jaar werkervaring heb je?</h2>
            <p className="text-gray-600 mb-6">Dit bepaalt hoe lang je de hogere uitkering behoudt (2 maanden extra per jaar ervaring)</p>

            <div className="space-y-4">
              <input
                type="number"
                min="0"
                max="45"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-orange-600 focus:outline-none"
                placeholder="Bijv. 10"
                id="werkervaringInput"
                defaultValue="0"
                key="werkervaring-input"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('werkervaringInput');
                  if (input) {
                    handleWerkervaring(input.value || '0');
                  }
                }}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition"
              >
                Bereken mijn netto uitkering
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Maanden werkloos phase
  if (phase === 'maanden') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <button
              onClick={goBack}
              className="mb-4 text-orange-600 hover:text-orange-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Terug
            </button>

            <div className="mb-6">
              <span className="text-sm font-medium text-orange-600">Stap 3 van 4</span>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Hoeveel maanden ben je al werkloos?</h2>
            <p className="text-gray-600 mb-6">Uitkeringen zijn degressief en dalen over tijd</p>

            <div className="space-y-4">
              <input
                type="number"
                min="0"
                max="120"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-orange-600 focus:outline-none"
                placeholder="Bijv. 6"
                id="maandenInput"
                defaultValue="0"
                key="maanden-input"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('maandenInput');
                  if (input) {
                    handleMaanden(input.value || '0');
                  }
                }}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition"
              >
                Volgende
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Gezinssituatie phase
  if (phase === 'gezinssituatie') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <button
              onClick={goBack}
              className="mb-4 text-orange-600 hover:text-orange-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Terug
            </button>

            <div className="mb-6">
              <span className="text-sm font-medium text-orange-600">Stap 2 van 4</span>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Wat is je gezinssituatie?</h2>
            <p className="text-gray-600 mb-6">Dit bepaalt je uitkeringspercentage</p>

            <div className="space-y-3">
              <button
                onClick={() => handleGezinssituatie('gezinslast')}
                className="w-full bg-orange-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-orange-700 transition text-left"
              >
                <div className="font-semibold">Met gezinslast</div>
                <div className="text-sm opacity-90">Partner werkt niet + kinderen ten laste</div>
              </button>
              <button
                onClick={() => handleGezinssituatie('alleenwonend')}
                className="w-full bg-orange-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-orange-700 transition text-left"
              >
                <div className="font-semibold">Alleenwonend</div>
                <div className="text-sm opacity-90">Je woont alleen</div>
              </button>
              <button
                onClick={() => handleGezinssituatie('samenwonend')}
                className="w-full bg-orange-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-orange-700 transition text-left"
              >
                <div className="font-semibold">Samenwonend</div>
                <div className="text-sm opacity-90">Partner werkt ook of je deelt kosten</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Netto Uitkering Calculator</h1>
            <p className="text-gray-600">Bereken je netto werkloosheidsuitkering na bedrijfsvoorheffing</p>
          </div>

          <div className="mb-6">
            <span className="text-sm font-medium text-orange-600">Stap 1 van 4</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Wat was je laatste bruto maandloon?</h2>
          <p className="text-gray-600 mb-2">Dit is het bruto loon van je laatste werkmaand</p>
          <p className="text-sm text-gray-500 mb-6">
            💡 Tip: Check je laatste loonbrief
          </p>

          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 text-lg">€</span>
              <input
                type="number"
                min="0"
                step="100"
                className="w-full border-2 border-gray-300 rounded-lg pl-10 pr-4 py-3 text-lg focus:border-orange-600 focus:outline-none"
                placeholder="Bijv. 3000"
                id="brutoInput"
                key="bruto-input"
              />
            </div>
            <button
              onClick={() => {
                const input = document.getElementById('brutoInput');
                if (input && input.value) {
                  handleBrutoLoon(input.value);
                }
              }}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Volgende
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Voor werklozen in België • RVA 2025-2026
          </div>
        </div>
      </div>
    </div>
  );
}
