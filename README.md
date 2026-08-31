# Hjärnträning

En webbapp för att testa och träna olika delar av din hjärna varje vecka.

## Vad appen gör

- **Veckotest**: ett genererat test som täcker sex kognitiva områden — minne,
  uppmärksamhet, snabbhet, logik, flexibilitet och språk. Ett nytt test går
  att göra varje vecka för att följa utvecklingen.
- **Fri träning**: valfritt område kan tränas när som helst, hur ofta som helst.
- **Adaptiv svårighetsgrad**: varje övning blir svårare i takt med att dina
  senaste resultat förbättras (progressive overload).
- **Utveckling över tid**: en radarprofil över dina senaste resultat och
  linjediagram per område som visar hur poängen förändras vecka för vecka.
- **Hjärnindex**: ett samlat mått 0–100 baserat på dina senaste resultat.
  Det är ett eget, transparent mått — inte ett kliniskt IQ-test.

All data sparas lokalt i webbläsaren (`localStorage`), det finns ingen
backend eller inloggning.

## Utveckling

```bash
npm install
npm run dev
```

```bash
npm run build   # produktionsbygge
npm run lint    # oxlint
```
