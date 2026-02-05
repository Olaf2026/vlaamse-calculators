import React, { useState } from 'react';

// Extra toeslagen component met interactieve calculators
function ExtraToeslagenBlock({ result }) {
  const [expandedToeslag, setExpandedToeslag] = useState(null);
  const [kinderopvangData, setKinderopvangData] = useState({});
  const [schooltoeslagData, setSchooltoeslagData] = useState({});
  const [studietoelageData, setStudietoelageData] = useState({});
  const [zorgtoeslagData, setZorgtoeslagData] = useState({});

  const berekenKinderopvang = () => {
    const { aantalDagen, soort } = kinderopvangData;
    if (!aantalDagen) return null;
    
    const bedragPerDag = 3.66;
    const perMaand = aantalDagen * bedragPerDag;
    const perJaar = perMaand * 12;
    
    return { perMaand, perJaar };
  };

  const berekenSchooltoeslag = () => {
    const { onderwijsniveau } = schooltoeslagData;
    const income = result.familyData.gezinsinkomen;
    const familySize = result.familyData.gezinsgrootte;
    
    if (!onderwijsniveau || !income) return null;
    
    // Vereenvoudigde berekening - in werkelijkheid complexer puntensysteem
    const inkomensgrens = 32000 + (familySize * 3500);
    
    if (income > inkomensgrens) {
      return { bedrag: 0, heeftRecht: false };
    }
    
    // Minimale bedragen per niveau
    let minimumBedrag;
    if (onderwijsniveau === 'kleuter') minimumBedrag = 113;
    else if (onderwijsniveau === 'lager') minimumBedrag = 132;
    else if (onderwijsniveau === 'secundair') minimumBedrag = 215;
    
    // Hoger bedrag bij lager inkomen
    const ratio = income / inkomensgrens;
    const bedrag = ratio < 0.5 ? minimumBedrag * 2 : minimumBedrag;
    
    return { bedrag: Math.round(bedrag), heeftRecht: true };
  };

  const berekenStudietoelage = () => {
    const { woonsituatie, afstand } = studietoelageData;
    const income = result.familyData.gezinsinkomen;
    const familySize = result.familyData.gezinsgrootte;
    
    if (!woonsituatie || !income) return null;
    
    // Vereenvoudigde berekening - werkelijke formule is complexer
    const inkomensgrens = 40000 + (familySize * 5000);
    
    if (income > inkomensgrens * 1.5) {
      return { bedrag: 0, heeftRecht: false };
    }
    
    let basisbedrag = 0;
    
    // Woonsituatie
    if (woonsituatie === 'thuis') {
      basisbedrag = income < inkomensgrens * 0.5 ? 2000 : 500;
    } else if (woonsituatie === 'kot') {
      basisbedrag = income < inkomensgrens * 0.5 ? 5000 : 2500;
    }
    
    // Afstand bonus
    if (afstand === 'ver' && basisbedrag > 0) {
      basisbedrag += 500;
    }
    
    return { bedrag: Math.round(basisbedrag), heeftRecht: basisbedrag > 0 };
  };

  const berekenZorgtoeslag = () => {
    const { punten } = zorgtoeslagData;
    
    if (!punten) return null;
    
    const score = parseInt(punten);
    let bedragPerMaand = 0;
    
    if (score >= 6 && score <= 8) bedragPerMaand = 100;
    else if (score >= 9 && score <= 11) bedragPerMaand = 200;
    else if (score >= 12 && score <= 14) bedragPerMaand = 350;
    else if (score >= 15 && score <= 17) bedragPerMaand = 500;
    else if (score >= 18) bedragPerMaand = 650;
    
    if (bedragPerMaand === 0) return null;
    
    return {
      perMaand: bedragPerMaand,
      perJaar: bedragPerMaand * 12
    };
  };

  const kinderopvangResultaat = berekenKinderopvang();
  const schooltoeslagResultaat = berekenSchooltoeslag();
  const studietoelageResultaat = berekenStudietoelage();
  const zorgtoeslagResultaat = berekenZorgtoeslag();

  const toeslagen = [
    {
      id: 'kinderopvang',
      titel: 'Kinderopvangtoeslag',
      beschrijving: 'Voor niet-inkomensgerelateerde kinderopvang',
      bedrag: '€3,66 per dag',
      voorwaarden: [
        'Erkende kinderopvang in Vlaanderen',
        'Geen inkomenstarief (subsidie)',
        'Automatisch toegekend via Kind en Gezin'
      ]
    },
    {
      id: 'schooltoeslag',
      titel: 'Schooltoeslag',
      beschrijving: 'Jaarlijkse steun voor kleuter-, lager- en secundair onderwijs',
      bedrag: '€113 - €905 per jaar',
      voorwaarden: [
        'Gezinsinkomen onder grens',
        'Kind 3+ jaar in kleuter, lager of secundair onderwijs',
        'Erkende school in Vlaanderen/Brussel',
        'Voldoende aanwezigheid op school',
        'Automatisch uitbetaald augustus-december'
      ]
    },
    {
      id: 'studietoelage',
      titel: 'Studietoelage (Studiebeurs)',
      beschrijving: 'Voor studenten in hoger onderwijs',
      bedrag: 'Variabel (tot €6.000+ per jaar)',
      voorwaarden: [
        'Student hoger onderwijs (hogeschool/universiteit)',
        'Gezinsinkomen onder grens',
        'Minstens 54 studiepunten inschrijven',
        'Moet ZELF aangevraagd worden (niet automatisch!)',
        'Aanvragen via vlaanderen.be/studietoelage'
      ]
    },
    {
      id: 'zorgtoeslag',
      titel: 'Zorgtoeslag',
      beschrijving: 'Voor kinderen met erkende handicap of zorgbehoefte',
      bedrag: 'Variabel (€50-€650/maand)',
      voorwaarden: [
        'Erkenning door multidisciplinair team',
        'Puntensysteem 6-27 punten',
        'Aanvraag bij uitbetalingsinstelling'
      ]
    }
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="font-semibold text-blue-900 mb-4">Extra toeslagen die je mogelijk kunt krijgen:</h3>
      
      <div className="space-y-3">
        {toeslagen.map((toeslag) => (
          <div key={toeslag.id} className="bg-white rounded-lg border border-blue-200 overflow-hidden">
            <button
              onClick={() => setExpandedToeslag(expandedToeslag === toeslag.id ? null : toeslag.id)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-blue-50 transition"
            >
              <div className="flex-1">
                <div className="font-semibold text-blue-900">{toeslag.titel}</div>
                <div className="text-sm text-blue-700">{toeslag.beschrijving} • {toeslag.bedrag}</div>
              </div>
              <svg 
                className={`w-5 h-5 text-blue-600 transition-transform ${expandedToeslag === toeslag.id ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedToeslag === toeslag.id && (
              <div className="px-4 py-4 border-t border-blue-200 bg-blue-25">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Voorwaarden:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {toeslag.voorwaarden.map((voorwaarde, idx) => (
                      <li key={idx}>• {voorwaarde}</li>
                    ))}
                  </ul>
                </div>

                {/* Kinderopvang calculator */}
                {toeslag.id === 'kinderopvang' && (
                  <div className="mt-4 p-3 bg-white rounded border border-blue-300">
                    <p className="text-sm font-semibold text-blue-900 mb-3">Bereken je kinderopvangtoeslag:</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-700 block mb-1">Gemiddeld aantal volle opvangdagen per maand:</label>
                        <input
                          type="number"
                          min="0"
                          max="31"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          placeholder="Bijv. 15"
                          value={kinderopvangData.aantalDagen || ''}
                          onChange={(e) => setKinderopvangData({ ...kinderopvangData, aantalDagen: parseInt(e.target.value) || 0 })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Let op: 2 halve dagen = 1 volle dag</p>
                      </div>

                      {kinderopvangResultaat && (
                        <div className="bg-green-50 border border-green-300 rounded p-3">
                          <p className="text-sm font-semibold text-green-900">Geschatte kinderopvangtoeslag:</p>
                          <p className="text-lg font-bold text-green-700">€{kinderopvangResultaat.perMaand.toFixed(2)}/maand</p>
                          <p className="text-sm text-green-700">€{kinderopvangResultaat.perJaar.toFixed(2)}/jaar</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Schooltoeslag calculator */}
                {toeslag.id === 'schooltoeslag' && (
                  <div className="mt-4 p-3 bg-white rounded border border-blue-300">
                    <p className="text-sm font-semibold text-blue-900 mb-3">Check je recht op schooltoeslag:</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-700 block mb-1">Onderwijsniveau:</label>
                        <select
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={schooltoeslagData.onderwijsniveau || ''}
                          onChange={(e) => setSchooltoeslagData({ ...schooltoeslagData, onderwijsniveau: e.target.value })}
                        >
                          <option value="">Selecteer...</option>
                          <option value="kleuter">Kleuteronderwijs (3-5 jaar)</option>
                          <option value="lager">Lager onderwijs (6-11 jaar)</option>
                          <option value="secundair">Secundair onderwijs (12-18 jaar)</option>
                        </select>
                      </div>

                      {schooltoeslagResultaat && (
                        <div className={`${schooltoeslagResultaat.heeftRecht ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'} border rounded p-3`}>
                          {schooltoeslagResultaat.heeftRecht ? (
                            <>
                              <p className="text-sm font-semibold text-green-900">Je hebt waarschijnlijk recht op schooltoeslag!</p>
                              <p className="text-lg font-bold text-green-700">Ongeveer €{schooltoeslagResultaat.bedrag}/jaar</p>
                              <p className="text-xs text-green-700 mt-1">Dit is een schatting. Het exacte bedrag wordt automatisch berekend.</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-semibold text-yellow-900">Je inkomen ligt boven de grens</p>
                              <p className="text-sm text-yellow-800">Op basis van je gezinsinkomen (€{result.familyData.gezinsinkomen}) heb je waarschijnlijk geen recht op schooltoeslag.</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Studietoelage calculator */}
                {toeslag.id === 'studietoelage' && (
                  <div className="mt-4 p-3 bg-white rounded border border-blue-300">
                    <p className="text-sm font-semibold text-blue-900 mb-2">⚠️ Let op: Dit moet je ZELF aanvragen!</p>
                    <p className="text-sm text-blue-800 mb-4">
                      Anders dan schooltoeslag wordt studietoelage NIET automatisch toegekend. 
                      Je moet elk jaar opnieuw aanvragen via <strong>vlaanderen.be/studietoelage</strong>
                    </p>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-sm text-gray-700 block mb-1">Woonsituatie:</label>
                        <select
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={studietoelageData.woonsituatie || ''}
                          onChange={(e) => setStudietoelageData({ ...studietoelageData, woonsituatie: e.target.value })}
                        >
                          <option value="">Selecteer...</option>
                          <option value="thuis">Thuis wonend</option>
                          <option value="kot">Op kot / zelfstandig</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm text-gray-700 block mb-1">Afstand tot campus:</label>
                        <select
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={studietoelageData.afstand || ''}
                          onChange={(e) => setStudietoelageData({ ...studietoelageData, afstand: e.target.value })}
                        >
                          <option value="">Selecteer...</option>
                          <option value="dichtbij">Minder dan 30 km</option>
                          <option value="ver">Meer dan 30 km</option>
                        </select>
                      </div>

                      {studietoelageResultaat && (
                        <div className={`${studietoelageResultaat.heeftRecht ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'} border rounded p-3`}>
                          {studietoelageResultaat.heeftRecht ? (
                            <>
                              <p className="text-sm font-semibold text-green-900">Je hebt waarschijnlijk recht op studietoelage!</p>
                              <p className="text-lg font-bold text-green-700">Ongeveer €{studietoelageResultaat.bedrag}/jaar</p>
                              <p className="text-xs text-green-700 mt-2">
                                ⚠️ Dit is een ruwe schatting. Het exacte bedrag hangt af van veel factoren zoals studierichting, 
                                aantal studiepunten, gezinssamenstelling, etc. Doe de officiële aanvraag om je exacte bedrag te kennen!
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-semibold text-yellow-900">Je inkomen ligt waarschijnlijk te hoog</p>
                              <p className="text-sm text-yellow-800">
                                Doe toch de aanvraag - er zijn veel extra criteria en je kunt misschien wel in aanmerking komen!
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 rounded p-3">
                      <p className="text-xs font-semibold text-blue-900 mb-1">📅 Aanvragen:</p>
                      <p className="text-xs text-blue-800">
                        Aanvraagperiode: augustus - oktober (voor dat academiejaar)<br/>
                        Ga naar <strong>vlaanderen.be/studietoelage</strong> en log in met eID of itsme
                      </p>
                    </div>
                  </div>
                )}

                {/* Zorgtoeslag calculator */}
                {toeslag.id === 'zorgtoeslag' && (
                  <div className="mt-4 p-3 bg-white rounded border border-blue-300">
                    <p className="text-sm font-semibold text-blue-900 mb-3">Bereken je mogelijke zorgtoeslag:</p>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-sm text-gray-700 block mb-2">
                          Heeft je kind al een puntenscore van het multidisciplinair team?
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={zorgtoeslagData.punten || ''}
                          onChange={(e) => setZorgtoeslagData({ ...zorgtoeslagData, punten: e.target.value })}
                        >
                          <option value="">Selecteer puntenscore...</option>
                          <option value="0">Nog geen score / onder 6 punten</option>
                          <option value="6">6-8 punten</option>
                          <option value="9">9-11 punten</option>
                          <option value="12">12-14 punten</option>
                          <option value="15">15-17 punten</option>
                          <option value="18">18+ punten</option>
                        </select>
                      </div>

                      {zorgtoeslagResultaat && (
                        <div className="bg-green-50 border border-green-300 rounded p-3">
                          <p className="text-sm font-semibold text-green-900">Geschatte zorgtoeslag:</p>
                          <p className="text-lg font-bold text-green-700">€{zorgtoeslagResultaat.perMaand}/maand</p>
                          <p className="text-sm text-green-700">€{zorgtoeslagResultaat.perJaar}/jaar</p>
                          <p className="text-xs text-green-700 mt-2">
                            Dit bedrag wordt automatisch toegevoegd aan je Groeipakket zodra de erkenning is goedgekeurd.
                          </p>
                        </div>
                      )}

                      {zorgtoeslagData.punten === '0' && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <p className="text-sm font-semibold text-blue-900 mb-2">Hoe zorgtoeslag aanvragen:</p>
                          <ol className="text-sm text-blue-800 space-y-2">
                            <li>1. <strong>Contact opnemen:</strong> Neem contact op met Kind & Gezin (0-3 jaar) of CLB van de school (3+ jaar)</li>
                            <li>2. <strong>Multidisciplinair onderzoek:</strong> Je kind wordt onderzocht door een team van specialisten</li>
                            <li>3. <strong>Puntenscore:</strong> Het team kent punten toe (6-27 op medisch-sociale schaal)</li>
                            <li>4. <strong>Attest:</strong> Team stuurt attest naar je uitbetalingsinstelling (ziekenfonds/Fons)</li>
                            <li>5. <strong>Automatische toekenning:</strong> Zorgtoeslag wordt toegevoegd aan je Groeipakket</li>
                          </ol>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                      <strong>Wat bepaalt de punten?</strong><br/>
                      • Medische diagnose en impact<br/>
                      • Zorgbehoefte (therapie, behandeling)<br/>
                      • Sociale gevolgen (integratie, participatie)<br/>
                      • Extra kosten voor het gezin
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-blue-600 mt-4 italic">
        💡 Tip: Alle toeslagen behalve zorgtoeslag worden automatisch toegekend als je eraan voldoet. Je hoeft geen aparte aanvraag te doen!
      </p>
    </div>
  );
}

export default function GroeipakketCalculator() {
  const [phase, setPhase] = useState('initial'); // initial, children, family, result
  const [aantalKinderen, setAantalKinderen] = useState(0);
  const [children, setChildren] = useState([]);
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [currentChildData, setCurrentChildData] = useState({});
  const [familyData, setFamilyData] = useState({});
  const [result, setResult] = useState(null);

  // Officiële bedragen vanaf 1 september 2025
  const RATES_2025 = {
    nieuwSysteem: {
      basis: 184.62,
      socialeToeslag: {
        min: 37.31,
        mid: 72.60,
        max: 108.29
      },
      schoolbonus: {
        '0-5': 0,
        '6-11': 23.07,
        '12-17': 46.14,
        '18-24': 69.22
      }
    },
    oudSysteem: {
      basis: [106.27, 196.55, 293.11, 293.11],
      leeftijdsbijslag: {
        '6': 23.22,
        '12': 34.82,
        '18': 41.46
      }
    }
  };

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const isNewSystem = (birthdate) => {
    return new Date(birthdate) >= new Date('2019-01-01');
  };

  const getSchoolbonusAge = (age) => {
    if (age < 6) return '0-5';
    if (age < 12) return '6-11';
    if (age < 18) return '12-17';
    return '18-24';
  };

  const calculateSocialeToeslag = (income, familySize) => {
    const baseLimit = 35000;
    const perPersonLimit = 6500;
    const incomeLimit = baseLimit + (familySize * perPersonLimit);

    if (income > incomeLimit * 1.5) return 0;
    if (income > incomeLimit) return RATES_2025.nieuwSysteem.socialeToeslag.min;
    if (income > incomeLimit * 0.5) return RATES_2025.nieuwSysteem.socialeToeslag.mid;
    return RATES_2025.nieuwSysteem.socialeToeslag.max;
  };

  const calculateChildBenefit = (child, index, allChildren, family) => {
    const age = child.leeftijd;
    const newSystem = child.nieuwSysteem;
    
    let calculation = {
      basis: 0,
      socialeToeslag: 0,
      schoolbonus: 0,
      zorgtoeslag: 0,
      leeftijdsbijslag: 0,
      perMaand: 0,
      perJaar: 0,
      systeem: newSystem ? 'Nieuw systeem (≥ 1/1/2019)' : 'Oud systeem (< 1/1/2019)'
    };

    if (age >= 18 && !child.studerend) {
      return { ...calculation, opmerking: 'Geen recht: kind is 18+ en studeert niet' };
    }
    if (age >= 25) {
      return { ...calculation, opmerking: 'Geen recht: kind is 25 jaar of ouder' };
    }

    if (newSystem) {
      calculation.basis = RATES_2025.nieuwSysteem.basis;
      
      if (family.gezinsinkomen && family.gezinsgrootte) {
        calculation.socialeToeslag = calculateSocialeToeslag(
          family.gezinsinkomen,
          family.gezinsgrootte
        );
      }
      
      const ageCategory = getSchoolbonusAge(age);
      calculation.schoolbonus = RATES_2025.nieuwSysteem.schoolbonus[ageCategory];
      
    } else {
      const rangordeIndex = Math.min(index, 3);
      calculation.basis = RATES_2025.oudSysteem.basis[rangordeIndex];
      
      if (age >= 18) {
        calculation.leeftijdsbijslag = RATES_2025.oudSysteem.leeftijdsbijslag['18'];
      } else if (age >= 12) {
        calculation.leeftijdsbijslag = RATES_2025.oudSysteem.leeftijdsbijslag['12'];
      } else if (age >= 6) {
        calculation.leeftijdsbijslag = RATES_2025.oudSysteem.leeftijdsbijslag['6'];
      }
      
      if (family.gezinsinkomen && family.gezinsgrootte) {
        calculation.socialeToeslag = calculateSocialeToeslag(
          family.gezinsinkomen,
          family.gezinsgrootte
        );
      }
      
      const ageCategory = getSchoolbonusAge(age);
      calculation.schoolbonus = RATES_2025.nieuwSysteem.schoolbonus[ageCategory];
    }

    if (child.handicap) {
      calculation.zorgtoeslag = 100;
      calculation.zorgtoeslagOpmerking = 'Indicatief bedrag - exacte zorgtoeslag hangt af van erkende punten';
    }

    calculation.perMaand = calculation.basis + calculation.socialeToeslag + calculation.leeftijdsbijslag + calculation.zorgtoeslag;
    calculation.perJaar = (calculation.perMaand * 12) + calculation.schoolbonus;

    return calculation;
  };

  const startCalculation = (aantal) => {
    setAantalKinderen(aantal);
    setPhase('children');
    setCurrentChildIndex(0);
    setCurrentChildData({});
  };

  const handleBirthdate = (date) => {
    const age = calculateAge(date);
    setCurrentChildData({
      geboortedatum: date,
      leeftijd: age,
      nieuwSysteem: isNewSystem(date)
    });
  };

  const handleStudying = (value) => {
    const updatedChild = { ...currentChildData, studerend: value };
    setCurrentChildData(updatedChild);
  };

  const handleHandicap = (value) => {
    const updatedChild = { ...currentChildData, handicap: value };
    
    // Child complete, add to array
    const updatedChildren = [...children, updatedChild];
    setChildren(updatedChildren);

    if (updatedChildren.length < aantalKinderen) {
      // Next child
      setCurrentChildIndex(updatedChildren.length);
      setCurrentChildData({});
    } else {
      // All children done, move to family questions
      setPhase('family');
    }
  };

  const handleIncome = (income) => {
    setFamilyData({ ...familyData, gezinsinkomen: income });
  };

  const handleFamilySize = (size) => {
    setFamilyData({ ...familyData, gezinsgrootte: size });
  };

  const handleKinderopvang = (value) => {
    const finalFamilyData = { ...familyData, kinderopvang: value };
    setFamilyData(finalFamilyData);
    
    // Calculate final result
    const calculations = children.map((child, index) => ({
      kind: `Kind ${index + 1}`,
      leeftijd: child.leeftijd,
      ...calculateChildBenefit(child, index, children, finalFamilyData)
    }));

    const totaalPerMaand = calculations.reduce((sum, c) => sum + c.perMaand, 0);
    const totaalPerJaar = calculations.reduce((sum, c) => sum + c.perJaar, 0);

    setResult({
      calculations,
      totaalPerMaand,
      totaalPerJaar,
      familyData: finalFamilyData
    });
    setPhase('result');
  };

  const restart = () => {
    setPhase('initial');
    setAantalKinderen(0);
    setChildren([]);
    setCurrentChildIndex(0);
    setCurrentChildData({});
    setFamilyData({});
    setResult(null);
  };

  // Result screen
  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Je Groeipakket berekening</h2>
              <div className="flex justify-center gap-8 mt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">€{result.totaalPerMaand.toFixed(2)}</div>
                  <div className="text-gray-600 mt-1">per maand</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">€{result.totaalPerJaar.toFixed(2)}</div>
                  <div className="text-gray-600 mt-1">per jaar</div>
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              {result.calculations.map((calc, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{calc.kind} ({calc.leeftijd} jaar)</h3>
                      <p className="text-sm text-gray-600">{calc.systeem}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">€{calc.perMaand.toFixed(2)}/maand</div>
                      <div className="text-sm text-gray-600">€{calc.perJaar.toFixed(2)}/jaar</div>
                    </div>
                  </div>

                  {calc.opmerking ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                      {calc.opmerking}
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Basisbedrag:</span>
                        <span className="font-medium">€{calc.basis.toFixed(2)}/maand</span>
                      </div>
                      
                      {calc.socialeToeslag > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sociale toeslag:</span>
                          <span className="font-medium text-green-600">+€{calc.socialeToeslag.toFixed(2)}/maand</span>
                        </div>
                      )}
                      
                      {calc.leeftijdsbijslag > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Leeftijdsbijslag:</span>
                          <span className="font-medium text-green-600">+€{calc.leeftijdsbijslag.toFixed(2)}/maand</span>
                        </div>
                      )}
                      
                      {calc.schoolbonus > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Schoolbonus:</span>
                          <span className="font-medium text-green-600">+€{calc.schoolbonus.toFixed(2)}/jaar</span>
                        </div>
                      )}
                      
                      {calc.zorgtoeslag > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Zorgtoeslag (indicatief):</span>
                          <span className="font-medium text-green-600">+€{calc.zorgtoeslag.toFixed(2)}/maand</span>
                        </div>
                      )}
                      
                      {calc.zorgtoeslagOpmerking && (
                        <div className="mt-2 text-xs text-gray-500 italic">
                          {calc.zorgtoeslagOpmerking}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <ExtraToeslagenBlock result={result} />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-2">Belangrijke opmerkingen:</h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Dit is een <strong>schatting</strong> op basis van de huidige tarieven (geïndexeerd per 1 sept 2025)</li>
                <li>• De exacte bedragen kunnen verschillen afhankelijk van je specifieke situatie</li>
                <li>• Sociale toeslagen worden automatisch berekend op basis van je fiscale gegevens</li>
                <li>• Groeipakket wordt automatisch uitbetaald, je hoeft dit niet aan te vragen</li>
                <li>• Bij twijfel: contacteer je uitbetalingsinstelling (ziekenfonds of Fons)</li>
              </ul>
            </div>

            <button
              onClick={restart}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
            >
              Nieuwe berekening
            </button>

            <div className="mt-6 text-center text-sm text-gray-500">
              Gebaseerd op officiële Groeipakket-tarieven • Bedragen per 1 september 2025
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Family questions phase
  if (phase === 'family') {
    if (!familyData.gezinsinkomen) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Wat is je bruto gezinsinkomen per jaar?</h2>
              <p className="text-gray-600 mb-6">Dit bepaalt of je recht hebt op sociale toeslagen. Tel alle inkomens in het gezin bij elkaar.</p>

              <div className="space-y-4">
                <input
                  type="number"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-green-600 focus:outline-none"
                  placeholder="Bijv. 45000"
                  id="incomeInput"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('incomeInput');
                    if (input && input.value) {
                      handleIncome(parseInt(input.value));
                    }
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Volgende
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!familyData.gezinsgrootte) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Hoeveel personen wonen er in je gezin?</h2>
              <p className="text-gray-600 mb-6">Ouders + kinderen die in hetzelfde huis wonen</p>

              <div className="space-y-4">
                <input
                  type="number"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-green-600 focus:outline-none"
                  placeholder="Bijv. 4"
                  id="sizeInput"
                  defaultValue=""
                  key="family-size-input"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('sizeInput');
                    if (input && input.value) {
                      handleFamilySize(parseInt(input.value));
                    }
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Volgende
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Kinderopvang question
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Gaan er kinderen naar erkende kinderopvang?</h2>
            <p className="text-gray-600 mb-6">Dit kan recht geven op kinderopvangtoeslag (apart aan te vragen)</p>

            <div className="space-y-3">
              <button
                onClick={() => handleKinderopvang(true)}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 transition text-left flex items-center justify-between"
              >
                <span>Ja</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={() => handleKinderopvang(false)}
                className="w-full bg-gray-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-700 transition text-left flex items-center justify-between"
              >
                <span>Nee</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Children questions phase
  if (phase === 'children') {
    const child = currentChildData;

    // Birthdate question
    if (!child.geboortedatum) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <span className="text-sm font-medium text-green-600">
                  Kind {currentChildIndex + 1} van {aantalKinderen}
                </span>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all" 
                    style={{ width: `${((currentChildIndex + 1) / aantalKinderen) * 100}%` }}
                  ></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Wat is de geboortedatum van kind {currentChildIndex + 1}?</h2>
              <p className="text-gray-600 mb-6">Dit bepaalt of het oude of nieuwe systeem van toepassing is (1 januari 2019 is de grens)</p>

              <div className="space-y-4">
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-green-600 focus:outline-none"
                  id="dateInput"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('dateInput');
                    if (input && input.value) {
                      handleBirthdate(input.value);
                    }
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Volgende
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Studying question (only if 18+)
    if (child.leeftijd >= 18 && child.studerend === undefined) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Studeert kind {currentChildIndex + 1} nog?</h2>
              <p className="text-gray-600 mb-6">Alleen relevant voor kinderen tussen 18-25 jaar</p>

              <div className="space-y-3">
                <button
                  onClick={() => handleStudying(true)}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 transition text-left flex items-center justify-between"
                >
                  <span>Ja</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStudying(false)}
                  className="w-full bg-gray-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-700 transition text-left flex items-center justify-between"
                >
                  <span>Nee</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Handicap question (final for each child)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Heeft kind {currentChildIndex + 1} een erkende handicap of aandoening?</h2>
            <p className="text-gray-600 mb-6">Dit kan recht geven op een zorgtoeslag</p>

            <div className="space-y-3">
              <button
                onClick={() => handleHandicap(true)}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 transition text-left flex items-center justify-between"
              >
                <span>Ja</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={() => handleHandicap(false)}
                className="w-full bg-gray-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-700 transition text-left flex items-center justify-between"
              >
                <span>Nee</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Groeipakket Calculator</h1>
            <p className="text-gray-600">Bereken hoeveel kinderbijslag (Groeipakket) je ontvangt in Vlaanderen</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Hoeveel kinderen heb je?</h2>
            <p className="text-gray-600 text-sm">Tel alle kinderen waarvoor je Groeipakket wilt berekenen</p>
          </div>

          <div className="space-y-4">
            <input
              type="number"
              min="1"
              max="10"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-green-600 focus:outline-none"
              placeholder="Bijv. 2"
              id="childrenInput"
            />
            <button
              onClick={() => {
                const input = document.getElementById('childrenInput');
                if (input && input.value) {
                  startCalculation(parseInt(input.value));
                }
              }}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
            >
              Start berekening
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Gebaseerd op officiële Groeipakket-tarieven (geïndexeerd per 1 sept 2025)
          </div>
        </div>
      </div>
    </div>
  );
}
