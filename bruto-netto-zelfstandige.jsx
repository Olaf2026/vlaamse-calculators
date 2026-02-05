import React, { useState } from 'react';

export default function BrutoNettoZelfstandige() {
  const [phase, setPhase] = useState('initial');
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  // Sociale bijdragen zelfstandigen 2025
  const SOCIALE_BIJDRAGEN_2025 = {
    schijf1: { max: 75024, percentage: 0.205 },  // 20,5%
    schijf2: { max: 108238.40, percentage: 0.1416 }  // 14,16%
  };

  const MINIMUM_BIJDRAGE = {
    hoofdberoep: 898.30 * 4,  // Per kwartaal €898,30, dus per jaar
    bijberoep: 0,  // Alleen als inkomen > €1.881,75
    drempel_bijberoep: 1881.75
  };

  // Belastingschalen 2026
  const TAX_BRACKETS = [
    { max: 15200, rate: 0.25 },
    { max: 26830, rate: 0.40 },
    { max: 49840, rate: 0.45 },
    { max: Infinity, rate: 0.50 }
  ];

  const BELASTINGVRIJE_SOM = {
    basis: 10910,
    perKind: 1890
  };

  const calculateNettoZelfstandige = (inputData) => {
    const brutoJaar = parseFloat(inputData.brutoJaarInkomen);
    const isBijberoep = inputData.statuut === 'bijberoep';
    const kinderen = parseInt(inputData.kinderenTenLaste) || 0;
    
    // Stap 1: Sociale bijdragen berekenen
    let socialeBijdragen = 0;
    
    if (isBijberoep && brutoJaar < MINIMUM_BIJDRAGE.drempel_bijberoep) {
      socialeBijdragen = 0;  // Vrijgesteld
    } else {
      // Progressieve bijdragen
      if (brutoJaar <= SOCIALE_BIJDRAGEN_2025.schijf1.max) {
        socialeBijdragen = brutoJaar * SOCIALE_BIJDRAGEN_2025.schijf1.percentage;
      } else if (brutoJaar <= SOCIALE_BIJDRAGEN_2025.schijf2.max) {
        socialeBijdragen = 
          (SOCIALE_BIJDRAGEN_2025.schijf1.max * SOCIALE_BIJDRAGEN_2025.schijf1.percentage) +
          ((brutoJaar - SOCIALE_BIJDRAGEN_2025.schijf1.max) * SOCIALE_BIJDRAGEN_2025.schijf2.percentage);
      } else {
        // Boven maximum
        socialeBijdragen = 
          (SOCIALE_BIJDRAGEN_2025.schijf1.max * SOCIALE_BIJDRAGEN_2025.schijf1.percentage) +
          ((SOCIALE_BIJDRAGEN_2025.schijf2.max - SOCIALE_BIJDRAGEN_2025.schijf1.max) * SOCIALE_BIJDRAGEN_2025.schijf2.percentage);
      }
      
      // Check minimum (alleen hoofdberoep)
      if (!isBijberoep) {
        socialeBijdragen = Math.max(socialeBijdragen, MINIMUM_BIJDRAGE.hoofdberoep);
      }
    }
    
    // Stap 2: Belastbaar inkomen (na sociale bijdragen)
    const naSocialeBijdragen = brutoJaar - socialeBijdragen;
    
    // Beroepskosten (forfaitair 30%, max €5.930)
    const beroepskosten = Math.min(naSocialeBijdragen * 0.30, 5930);
    const belastbaarInkomen = naSocialeBijdragen - beroepskosten;
    
    // Stap 3: Belastingvrije som
    const belastingvrijeSom = BELASTINGVRIJE_SOM.basis + (kinderen * BELASTINGVRIJE_SOM.perKind);
    const belastbaarNaVrijstelling = Math.max(0, belastbaarInkomen - belastingvrijeSom);
    
    // Stap 4: Progressieve belasting
    let personenbelasting = 0;
    let remaining = belastbaarNaVrijstelling;
    let previousMax = 0;
    
    for (const bracket of TAX_BRACKETS) {
      if (remaining <= 0) break;
      const bracketSize = bracket.max - previousMax;
      const taxableInBracket = Math.min(remaining, bracketSize);
      personenbelasting += taxableInBracket * bracket.rate;
      remaining -= taxableInBracket;
      previousMax = bracket.max;
    }
    
    // Gemeentebelasting (gemiddeld 7%)
    const gemeentebelasting = personenbelasting * 0.07;
    const totaleBelasting = personenbelasting + gemeentebelasting;
    
    // Netto berekening
    const nettoJaar = brutoJaar - socialeBijdragen - totaleBelasting;
    const nettoMaand = nettoJaar / 12;
    const brutoMaand = brutoJaar / 12;
    
    return {
      bruto: {
        maand: brutoMaand,
        jaar: brutoJaar
      },
      socialeBijdragen: {
        bedrag: socialeBijdragen,
        effectiefPercentage: (socialeBijdragen / brutoJaar) * 100
      },
      belastbaar: {
        naSocialeBijdragen: naSocialeBijdragen,
        beroepskosten: beroepskosten,
        belastbaarInkomen: belastbaarInkomen,
        belastingvrijeSom: belastingvrijeSom,
        belastbaar: belastbaarNaVrijstelling
      },
      belasting: {
        personenbelasting: personenbelasting,
        gemeentebelasting: gemeentebelasting,
        totaal: totaleBelasting
      },
      netto: {
        maand: nettoMaand,
        jaar: nettoJaar
      },
      nettoPercentage: (nettoMaand / brutoMaand) * 100,
      effectiefTarief: ((socialeBijdragen + totaleBelasting) / brutoJaar) * 100
    };
  };

  const restart = () => {
    setPhase('initial');
    setData({});
    setResult(null);
  };

  const goBack = () => {
    if (phase === 'result') setPhase('kinderen');
    else if (phase === 'kinderen') setPhase('statuut');
    else if (phase === 'statuut') setPhase('initial');
  };

  const handleBrutoInkomen = (value) => {
    setData({ brutoJaarInkomen: value });
    setPhase('statuut');
  };

  const handleStatuut = (value) => {
    setData({ ...data, statuut: value });
    setPhase('kinderen');
  };

  const handleKinderen = (value) => {
    const finalData = { ...data, kinderenTenLaste: value };
    setData(finalData);
    
    const berekening = calculateNettoZelfstandige(finalData);
    setResult(berekening);
    setPhase('result');
  };

  const adjustByPercentage = (percentage) => {
    const currentBruto = parseFloat(data.brutoJaarInkomen);
    const newBruto = currentBruto * (1 + percentage / 100);
    const newData = { ...data, brutoJaarInkomen: newBruto.toFixed(2) };
    setData(newData);
    
    const berekening = calculateNettoZelfstandige(newData);
    setResult(berekening);
  };

  // Result screen
  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <button
              onClick={goBack}
              className="mb-4 text-purple-600 hover:text-purple-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Terug
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Jouw Netto Inkomen als Zelfstandige</h2>
              
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Bruto per maand</div>
                  <div className="text-3xl font-bold text-purple-600">€{result.bruto.maand.toFixed(2)}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Netto per maand</div>
                  <div className="text-3xl font-bold text-green-600">€{result.netto.maand.toFixed(2)}</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Je houdt <span className="font-semibold text-green-600">{result.nettoPercentage.toFixed(1)}%</span> van je bruto inkomen • 
                Totaal aftrek: <span className="font-semibold">{result.effectiefTarief.toFixed(2)}%</span>
              </div>
            </div>

            {/* What-if scenarios */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-3 text-sm">🔮 Wat-als scenario's:</h3>
              <div className="flex flex-wrap gap-2">
                {[-10, -5, 5, 10, 20].map(pct => (
                  <button
                    key={pct}
                    onClick={() => adjustByPercentage(pct)}
                    className="px-3 py-1 bg-white border border-purple-300 rounded text-sm hover:bg-purple-50 transition"
                  >
                    {pct > 0 ? '+' : ''}{pct}%
                  </button>
                ))}
              </div>
              <p className="text-xs text-purple-700 mt-2">Simuleer een hoger of lager inkomen</p>
            </div>

            {/* Detailed breakdown */}
            <div className="space-y-4 mb-8">
              {/* Sociale bijdragen */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 text-purple-600 font-bold">1</span>
                  Sociale bijdragen
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bruto jaarinkomen:</span>
                    <span className="font-medium">€{result.bruto.jaar.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-purple-700">
                    <span>Sociale bijdragen ({result.socialeBijdragen.effectiefPercentage.toFixed(2)}%):</span>
                    <span className="font-medium">-€{result.socialeBijdragen.bedrag.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold">Na sociale bijdragen:</span>
                    <span className="font-semibold">€{result.belastbaar.naSocialeBijdragen.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Belastbare basis */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 text-orange-600 font-bold">2</span>
                  Belastbare basis
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Na sociale bijdragen:</span>
                    <span className="font-medium">€{result.belastbaar.naSocialeBijdragen.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-700">
                    <span>Forfaitaire beroepskosten (30%):</span>
                    <span className="font-medium">-€{result.belastbaar.beroepskosten.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold">Belastbaar inkomen:</span>
                    <span className="font-semibold">€{result.belastbaar.belastbaarInkomen.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Belastingvrije som:</span>
                    <span className="font-medium">-€{result.belastbaar.belastingvrijeSom.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold">Te belasten:</span>
                    <span className="font-semibold">€{result.belastbaar.belastbaar.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Belastingen */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600 font-bold">3</span>
                  Belastingen
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-red-700">
                    <span>Personenbelasting (progressief):</span>
                    <span className="font-medium">-€{result.belasting.personenbelasting.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-700">
                    <span>Gemeentebelasting (±7%):</span>
                    <span className="font-medium">-€{result.belasting.gemeentebelasting.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold">Totale belasting:</span>
                    <span className="font-semibold text-red-700">-€{result.belasting.totaal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Netto */}
              <div className="bg-green-50 rounded-lg p-6 border-2 border-green-300">
                <h3 className="font-bold text-lg text-green-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-3 text-green-700 font-bold">✓</span>
                  Netto resultaat
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-green-800">Netto per maand:</span>
                    <span className="font-bold text-green-700">€{result.netto.maand.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Netto per jaar:</span>
                    <span className="font-medium">€{result.netto.jaar.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-2">Belangrijke opmerkingen:</h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Dit is een <strong>vereenvoudigde berekening</strong> voor zelfstandigen</li>
                <li>• Sociale bijdragen: 20,5% tot €75.024, daarna 14,16% tot €108.238</li>
                <li>• Hoofdberoep: minimum €898,30 per kwartaal (€3.593,20/jaar)</li>
                <li>• Bijberoep: vrijgesteld tot inkomen van €1.881,75</li>
                <li>• Sociale bijdragen zijn AFTREKBAAR van je belastbaar inkomen</li>
                <li>• VAPZ-bijdragen kunnen je belastbaar inkomen verder verlagen</li>
                <li>• Voor exacte berekening: raadpleeg je sociaal verzekeringsfonds of accountant</li>
              </ul>
            </div>

            <button
              onClick={restart}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Nieuwe berekening
            </button>

            <div className="mt-6 text-center text-sm text-gray-500">
              Gebaseerd op Belgische regels 2025-2026 voor zelfstandigen
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Kinderen phase
  if (phase === 'kinderen') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <button
              onClick={goBack}
              className="mb-4 text-purple-600 hover:text-purple-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Terug
            </button>

            <div className="mb-6">
              <span className="text-sm font-medium text-purple-600">Stap 3 van 3</span>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Hoeveel kinderen heb je fiscaal ten laste?</h2>
            <p className="text-gray-600 mb-6">Kinderen ten laste verhogen je belastingvrije som met €{BELASTINGVRIJE_SOM.perKind} per kind</p>

            <div className="space-y-4">
              <input
                type="number"
                min="0"
                max="10"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-purple-600 focus:outline-none"
                placeholder="Bijv. 2"
                id="kinderenInput"
                defaultValue="0"
                key="kinderen-input"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('kinderenInput');
                  if (input) {
                    handleKinderen(input.value || '0');
                  }
                }}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition"
              >
                Bereken mijn netto inkomen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Statuut phase
  if (phase === 'statuut') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <button
              onClick={goBack}
              className="mb-4 text-purple-600 hover:text-purple-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Terug
            </button>

            <div className="mb-6">
              <span className="text-sm font-medium text-purple-600">Stap 2 van 3</span>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '66%' }}></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Wat is je statuut als zelfstandige?</h2>
            <p className="text-gray-600 mb-6">Dit bepaalt je minimumbijdrage en vrijstellingen</p>

            <div className="space-y-3">
              <button
                onClick={() => handleStatuut('hoofdberoep')}
                className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-purple-700 transition text-left"
              >
                <div className="font-semibold">Hoofdberoep</div>
                <div className="text-sm opacity-90">Je enige activiteit, minimum bijdrage €898,30/kwartaal</div>
              </button>
              <button
                onClick={() => handleStatuut('bijberoep')}
                className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-purple-700 transition text-left"
              >
                <div className="font-semibold">Bijberoep</div>
                <div className="text-sm opacity-90">Naast loondienst, vrijgesteld tot €1.881,75 inkomen</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Bruto-Netto Calculator: Zelfstandigen</h1>
            <p className="text-gray-600">Bereken je netto inkomen als zelfstandige in België</p>
          </div>

          <div className="mb-6">
            <span className="text-sm font-medium text-purple-600">Stap 1 van 3</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Wat is je geschat bruto jaarinkomen?</h2>
          <p className="text-gray-600 mb-2">Dit is je inkomen <strong>voor</strong> sociale bijdragen en belastingen</p>
          <p className="text-sm text-gray-500 mb-6">
            💡 Tip: Neem je omzet minus je bedrijfskosten
          </p>

          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 text-lg">€</span>
              <input
                type="number"
                min="0"
                step="1000"
                className="w-full border-2 border-gray-300 rounded-lg pl-10 pr-4 py-3 text-lg focus:border-purple-600 focus:outline-none"
                placeholder="Bijv. 40000"
                id="brutoInput"
                key="bruto-input"
              />
            </div>
            <button
              onClick={() => {
                const input = document.getElementById('brutoInput');
                if (input && input.value) {
                  handleBrutoInkomen(input.value);
                }
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Volgende
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Voor zelfstandigen in België • Regels 2025-2026
          </div>
        </div>
      </div>
    </div>
  );
}
