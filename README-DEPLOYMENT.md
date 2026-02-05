# 🇧🇪 Vlaamse & Belgische Calculators - Deployment Handleiding

## 📋 Wat je hebt

Een complete website met 5 calculators:
1. 💰 Bruto-Netto Werknemers
2. 🚀 Bruto-Netto Zelfstandigen  
3. 👶 Groeipakket Calculator
4. 💼 Werkloosheidsuitkering Checker
5. 📊 Netto Uitkering Calculator

---

## 🚀 OPTIE 1: GitHub Pages (GRATIS & AANBEVOLEN)

### Stap 1: Maak een GitHub account
1. Ga naar https://github.com
2. Klik "Sign up"
3. Maak een gratis account

### Stap 2: Maak een nieuwe repository
1. Klik op het "+" icoon rechtsboven
2. Selecteer "New repository"
3. Naam: `vlaamse-calculators` (of een andere naam)
4. Zet op "Public"
5. ✅ Vink aan: "Add a README file"
6. Klik "Create repository"

### Stap 3: Upload je bestanden
1. Klik op "Add file" → "Upload files"
2. Sleep ALLE bestanden hierheen:
   - `index.html` (hoofdpagina)
   - Alle `.jsx` bestanden
3. Schrijf bij commit: "Initial upload"
4. Klik "Commit changes"

### Stap 4: Activeer GitHub Pages
1. Ga naar "Settings" (tandwiel icoon)
2. Scroll naar "Pages" in het linkermenu
3. Bij "Source": selecteer "main" branch
4. Klik "Save"
5. ⏰ Wacht 1-2 minuten

### Stap 5: Bezoek je website! 🎉
Je website is nu live op:
```
https://jouw-gebruikersnaam.github.io/vlaamse-calculators/
```

**Voorbeeld:**
Als je GitHub gebruikersnaam "jan123" is:
```
https://jan123.github.io/vlaamse-calculators/
```

---

## 🌐 OPTIE 2: Netlify (OOK GRATIS)

### Via Website Upload:

1. Ga naar https://www.netlify.com
2. Klik "Sign up" (kan met GitHub account)
3. Klik "Add new site" → "Deploy manually"
4. Sleep ALLE bestanden in de drop zone
5. Klaar! Je krijgt een URL zoals: `https://random-naam-123.netlify.app`

### Je eigen domeinnaam toevoegen (optioneel):
1. Koop een domein bij (bijv. €10/jaar):
   - Combell.be
   - One.com
   - Namecheap.com
2. In Netlify: "Domain settings" → "Add custom domain"
3. Volg de instructies om DNS in te stellen

---

## 🔧 Bestanden die je moet uploaden

**ESSENTIEEL:**
- ✅ `index.html` - Hoofdpagina (hub)
- ✅ `vlaamse-calculators-hub.jsx` - React component
- ✅ `bruto-netto-calculator.jsx` - Werknemers calculator
- ✅ `bruto-netto-zelfstandige.jsx` - Zelfstandigen calculator
- ✅ `groeipakket-calculator.jsx` - Groeipakket
- ✅ `werkloosheid-checker.jsx` - Werkloosheid checker
- ✅ `netto-uitkering-calculator.jsx` - Uitkering calculator

**OPTIONEEL:**
- `README.md` - Deze instructies
- `favicon.ico` - Icoon in browser tab (maak je eigen)

---

## 💡 TIPS & TRUCS

### 1. **Testen voor je upload**
Open `index.html` gewoon in je browser (dubbelklik)
→ Werkt het? Dan werkt het ook online!

### 2. **Updates maken**
- GitHub: Upload gewoon nieuwe versie van bestand
- Netlify: Sleep nieuwe bestanden in drop zone
→ Updates zijn direct live!

### 3. **Analytics toevoegen** (optioneel)
Voeg Google Analytics toe om te zien hoeveel bezoekers je hebt:
1. Maak account op analytics.google.com
2. Voeg tracking code toe aan `index.html` in `<head>` sectie

### 4. **Eigen domeinnaam**
In plaats van `gebruikersnaam.github.io` kun je hebben:
- `vlaamse-calculators.be` (€10-12/jaar)
- `mijn-calculators.com` (€12-15/jaar)

Waar te kopen:
- Combell.be (Belgisch)
- One.com (Goedkoop)
- Namecheap.com (Internationaal)

---

## 🆘 TROUBLESHOOTING

### "Mijn pagina toont niks"
- ✅ Check of `index.html` in de hoofdmap staat (niet in een subfolder)
- ✅ Wacht 2-3 minuten na upload
- ✅ Hard refresh: Ctrl+F5 (Windows) of Cmd+Shift+R (Mac)

### "Links werken niet"
- In `index.html`: verander `.jsx` naar `.html` voor alle links
- Of: maak aparte HTML pagina's voor elke calculator

### "Ik zie een 404 error"
- Check of GitHub Pages is geactiveerd in Settings
- Check of je branch "main" hebt geselecteerd

---

## 📊 KOSTEN OVERZICHT

| Item | Kosten | Optioneel? |
|------|--------|-----------|
| GitHub Pages hosting | €0 | ❌ Gratis! |
| Domeinnaam | €10-12/jaar | ✅ Optioneel |
| SSL Certificaat | €0 | ❌ Gratis! |
| Updates | €0 | ❌ Gratis! |

**Totaal: €0 (of €10-12 met eigen domein)**

---

## 🎯 VOLGENDE STAPPEN

1. ✅ Upload naar GitHub Pages
2. ✅ Test alle calculators
3. ✅ Deel de link met vrienden/familie
4. 💡 Verzamel feedback
5. 🔄 Update regelmatig met nieuwe features

---

## 📞 HULP NODIG?

- GitHub Pages docs: https://pages.github.com
- Netlify docs: https://docs.netlify.com
- YouTube: Zoek "GitHub Pages tutorial"

---

## 🎉 SUCCES!

Je hebt nu een gratis, professionele website met alle Vlaamse calculators.
Deel hem met iedereen die hem kan gebruiken! 🇧🇪

**Live voorbeeld URL (vervang met jouw username):**
```
https://jouw-naam.github.io/vlaamse-calculators/
```
