# Coordinates lookup for lodging addresses
addresses = {
    "The Hague": (52.0785, 4.2994),  # 8 Veenkade
    "Ghent": (51.0565, 3.7303),  # 20 Sluizeken
    "Koblenz": (50.3569, 7.5985),  # Löhrstraße 84
    "Salzburg": (47.8100, 13.0447),  # Fanny-von-Lehnert-Straße 4
    "Trieste": (45.6503, 13.7784),  # Via Biasoletto 5
    "Pula": (44.8694, 13.8467),  # Viktor Car Emina 1
    "Plitvice": (44.8854, 15.6214),  # Smoljanac 95
    "Kranjska Gora": (46.4859, 13.7860),  # 18a Log
    "Most na Soči": (46.1880, 13.7353),  # Most na Soči 101
    "Cerknica": (45.8018, 14.3644),  # Hacetova ulica 16
    "Vižinada": (45.3347, 13.7628),  # BALDASI 10
    "Venice (Mestre)": (45.4897, 12.2451),  # Via Antonio Vivaldi 8A
    "Volastra": (44.1175, 9.7328),  # Via Montello 304
    "Lucca": (43.8430, 10.5024),  # Via San Pierino 3
    "Reykjavik": (64.1446, -21.9371),  # Skólavörðustígur 21A
}

# Station coordinates
stations = {
    "Den Haag Centraal": (52.0808, 4.3242),
    "Gent-Sint-Pieters": (51.0357, 3.7103),
    "Antwerpen-Centraal": (51.2171, 4.4214),
    "Bruxelles-Midi": (50.8353, 4.3363),
    "Köln Hbf": (50.9430, 6.9589),
    "Koblenz Hbf": (50.3569, 7.5985),
    "Salzburg Hbf": (47.8128, 13.0456),
    "Trieste Centrale": (45.6600, 13.7840),
    "Venezia Mestre": (45.4834, 12.2327),
    "La Spezia Centrale": (44.1157, 9.8250),
}

for name, coords in addresses.items():
    print(f"{name}: {coords}")
