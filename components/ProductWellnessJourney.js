import './ProductWellnessJourney.css';

const JOURNEY_ART = {
  hairBottle: (
    <svg viewBox="0 0 240 240" role="img" aria-label="Herbal hair oil with amla and fresh botanicals">
      <defs>
        <linearGradient id="hair-bottle" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#164d25"/><stop offset=".55" stopColor="#082b14"/><stop offset="1" stopColor="#06190b"/></linearGradient>
        <linearGradient id="hair-oil" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#e6a62c"/><stop offset=".5" stopColor="#f7d37b"/><stop offset="1" stopColor="#b87316"/></linearGradient>
      </defs>
      <ellipse cx="120" cy="204" rx="77" ry="12" fill="#18291c" opacity=".15" />
      <g fill="#699847" stroke="#52763a" strokeWidth="2">
        <path d="M42 174Q20 128 39 69q38 42 18 91 13-43 42-52 5 48-46 75Z"/><path d="M198 176q25-48 4-107-37 42-18 91-14-42-42-51-5 48 44 74Z"/>
        <path d="M42 159q23-43 55-54M198 157q-22-41-54-52" fill="none" stroke="#d4e9ad" strokeWidth="2"/>
      </g>
      <circle cx="53" cy="183" r="18" fill="#8ebc45"/><circle cx="53" cy="183" r="10" fill="#e6efc8"/><circle cx="183" cy="183" r="16" fill="#84ad3b"/><circle cx="183" cy="183" r="9" fill="#e9f0c9"/>
      <rect x="100" y="48" width="40" height="20" rx="5" fill="#14251a"/><rect x="94" y="63" width="52" height="12" rx="4" fill="#d6d5c6"/>
      <rect x="81" y="73" width="78" height="118" rx="15" fill="url(#hair-bottle)" stroke="#d6bc69" strokeWidth="3"/>
      <rect x="88" y="110" width="64" height="58" rx="4" fill="#f4f0da"/><path d="m113 123 7-9 7 9-7 4z" fill="#78a53d"/><text x="120" y="143" textAnchor="middle" fontSize="10" fontWeight="700" fill="#234625">BABA HAKEEM</text><text x="120" y="156" textAnchor="middle" fontSize="9" fontWeight="700" fill="#234625">HERBAL HAIR OIL</text>
      <path d="M96 81v22" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".5"/>
    </svg>
  ),
  hairScalp: (
    <svg viewBox="0 0 240 240" role="img" aria-label="A nourishing oil drop above a healthy scalp and hair root">
      <defs><linearGradient id="hair-skin" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f4c7a3"/><stop offset="1" stopColor="#e9a98b"/></linearGradient><linearGradient id="hair-drop" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0a8"/><stop offset="1" stopColor="#d99616"/></linearGradient></defs>
      <circle cx="120" cy="120" r="97" fill="#f8f5ea"/>
      <path d="M29 132q42-12 91 0t91 0v52H29z" fill="url(#hair-skin)"/><path d="M29 132q42-12 91 0t91 0" fill="none" stroke="#d6856d" strokeWidth="5"/>
      <path d="M119 43c-5 30-10 47-10 65 0 27 21 37 31 16 12-25-9-53-21-81Z" fill="#28231d"/><path d="M119 43c-5 30-10 47-10 65" fill="none" stroke="#554a3a" strokeWidth="4"/>
      <path d="M103 143q17 15 35 0" fill="none" stroke="#c76c61" strokeWidth="6" strokeLinecap="round"/><path d="M104 160q15 12 30 0" fill="none" stroke="#d98973" strokeWidth="4"/>
      <path d="M65 51c-14 22-17 30-17 38a18 18 0 0 0 36 0c0-8-4-16-19-38Z" fill="url(#hair-drop)"/><path d="M58 82q3-10 9-16" fill="none" stroke="#fff8d9" strokeWidth="4" strokeLinecap="round"/>
      <path d="m73 114 12 9m81-9-12 9m-80 48 11-6m87 6-11-6" stroke="#78a943" strokeWidth="3" strokeLinecap="round"/><circle cx="169" cy="57" r="4" fill="#83b544"/><circle cx="185" cy="77" r="3" fill="#9dc65d"/>
    </svg>
  ),
  hairRoots: (
    <svg viewBox="0 0 240 240" role="img" aria-label="A strong looking hair root supported by botanical care">
      <defs><linearGradient id="hair-root-skin" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f6d0ac"/><stop offset="1" stopColor="#e8a68a"/></linearGradient></defs>
      <circle cx="120" cy="120" r="97" fill="#f8f5ea"/>
      <path d="M25 128q48-12 95 0t95 0v57H25z" fill="url(#hair-root-skin)"/><path d="M25 128q48-12 95 0t95 0" fill="none" stroke="#d88870" strokeWidth="5"/>
      <path d="M120 39c-5 33-12 50-12 75 0 22 10 34 18 34s18-12 18-34c0-25-17-52-24-75Z" fill="#27241e"/><path d="M121 40q-10 49-8 79" fill="none" stroke="#75634a" strokeWidth="4"/>
      <path d="M107 148q13 13 27 0m-25 14q11 10 23 0" fill="none" stroke="#d38369" strokeWidth="5" strokeLinecap="round"/>
      <path d="M69 116q-14-22 1-38 20 15 9 36 15-18 32-10-6 22-34 22" fill="#719d46" stroke="#547b38" strokeWidth="2"/><path d="M80 122q12-24 27-33" fill="none" stroke="#dce9c4" strokeWidth="2"/>
      <path d="M172 116q14-22-1-38-20 15-9 36-15-18-32-10 6 22 34 22" fill="#8cb653" stroke="#547b38" strokeWidth="2"/><path d="M161 122q-12-24-27-33" fill="none" stroke="#e5edcf" strokeWidth="2"/>
      <path d="m120 56 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#e6b83d"/>
    </svg>
  ),
  hairShine: (
    <svg viewBox="0 0 240 240" role="img" aria-label="Long, glossy, naturally cared-for hair">
      <defs><linearGradient id="hair-flow" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#151b12"/><stop offset=".48" stopColor="#51402a"/><stop offset=".72" stopColor="#201c14"/><stop offset="1" stopColor="#080d09"/></linearGradient></defs>
      <circle cx="120" cy="120" r="97" fill="#f8f5ea"/>
      <path d="M87 71q5-38 42-35 40 4 47 44 4 22-2 42 14 34-2 68-10 18-28 15 12-24 0-39-11 30-33 35 8-26-4-43-6 24-24 34 8-29-5-48-18-27-5-56 7-12 14-17Z" fill="url(#hair-flow)"/>
      <path d="M124 47q-13 30-4 62 13 35 4 79M143 50q-12 34 1 59 15 30 7 70M102 68q-12 28 1 53 14 25 7 49" fill="none" stroke="#c49a56" strokeWidth="3" strokeLinecap="round" opacity=".8"/>
      <path d="M67 171q25-24 34-55 8-27 30-34" fill="none" stroke="#6f9d47" strokeWidth="7" strokeLinecap="round"/><path d="M70 160q-15-16-31-12 7 24 31 20m12-30q-4-19-22-23-3 22 18 31" fill="#84aa54" stroke="#52793b" strokeWidth="2"/>
      <path d="m174 66 3 8 8 3-8 3-3 8-3-8-8-3 8-3zM67 83l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#e7bd52"/>
    </svg>
  ),
  jointBottle: (
    <svg viewBox="0 0 240 240" role="img" aria-label="Herbal joint massage oil with botanical ingredients">
      <defs><linearGradient id="joint-glass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#db9b24"/><stop offset=".45" stopColor="#f4d273"/><stop offset="1" stopColor="#9e5f15"/></linearGradient><linearGradient id="joint-leaf" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9bc85a"/><stop offset="1" stopColor="#3c702d"/></linearGradient></defs>
      <ellipse cx="120" cy="202" rx="82" ry="12" fill="#30271a" opacity=".13"/><circle cx="120" cy="120" r="98" fill="#f8f5ea"/>
      <g fill="url(#joint-leaf)" stroke="#54743b" strokeWidth="2"><path d="M46 174Q28 137 43 83q33 37 17 81 14-35 39-43 3 41-41 63Z"/><path d="M192 174q22-42 5-91-33 36-17 77-14-36-39-43-3 41 41 63Z"/></g><path d="M45 163q24-37 53-45m93 43q-23-37-52-45" fill="none" stroke="#dce8bd" strokeWidth="2"/>
      <path d="M107 56h26v15h-26z" fill="#845320"/><rect x="98" y="68" width="44" height="15" rx="5" fill="#d7d5c5"/><rect x="79" y="80" width="82" height="110" rx="18" fill="url(#joint-glass)" stroke="#a36e20" strokeWidth="3"/><rect x="86" y="119" width="68" height="47" rx="4" fill="#f6f0d8"/><path d="m113 126 7-8 7 8-7 4z" fill="#679447"/><text x="120" y="145" textAnchor="middle" fontSize="10" fontWeight="700" fill="#28452b">BABA HAKEEM</text><text x="120" y="158" textAnchor="middle" fontSize="9" fontWeight="700" fill="#28452b">JOINT OIL</text>
      <circle cx="54" cy="184" r="11" fill="#b53c32"/><circle cx="185" cy="186" r="12" fill="#bd4537"/><path d="M51 171q1-12 10-11m120 14q1-12 10-11" fill="none" stroke="#497a36" strokeWidth="4" strokeLinecap="round"/><path d="M55 182h-2m133 1h-2" stroke="#e8a38b" strokeWidth="2"/>
    </svg>
  ),
  jointMassage: (
    <svg viewBox="0 0 240 240" role="img" aria-label="A gentle massage over a knee joint">
      <defs><linearGradient id="joint-skin" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f5c8a2"/><stop offset="1" stopColor="#d89070"/></linearGradient><radialGradient id="joint-warm"><stop stopColor="#f7bd39" stopOpacity=".85"/><stop offset="1" stopColor="#f27d3b" stopOpacity="0"/></radialGradient></defs>
      <circle cx="120" cy="120" r="98" fill="#f8f5ea"/><path d="M85 34q27 5 36 32l9 39q4 15-5 31l-25 51q-8 14-23 9-15-6-9-22l19-47-16-43q-12-31 14-50Z" fill="url(#joint-skin)"/><path d="M156 43q-24 6-30 32l-8 35q-5 17 5 30l24 50q7 14 22 9 15-6 9-22l-18-46 14-43q11-30-18-45Z" fill="url(#joint-skin)" opacity=".88"/>
      <ellipse cx="120" cy="116" rx="49" ry="42" fill="url(#joint-warm)"/><path d="M78 94q20-19 43-9m-41 26q17-13 35-8m-28 31q14-13 30-12" fill="none" stroke="#80b846" strokeWidth="5" strokeLinecap="round"/><path d="M151 90q-12 11-20 26m32-13q-14 10-21 24" fill="none" stroke="#fff6e4" strokeWidth="7" strokeLinecap="round" opacity=".8"/><path d="m53 103 9 9m-7 12 13 3m112-34-8 10m12 11-13 5" stroke="#8ac64d" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  ),
  jointSupport: (
    <svg viewBox="0 0 240 240" role="img" aria-label="Illustration of a knee joint with a gentle botanical support motif">
      <defs><linearGradient id="joint-bone" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff5db"/><stop offset="1" stopColor="#dfba7d"/></linearGradient><radialGradient id="joint-glow"><stop stopColor="#ffb53d" stopOpacity=".75"/><stop offset="1" stopColor="#f27a32" stopOpacity="0"/></radialGradient></defs>
      <circle cx="120" cy="120" r="98" fill="#f8f5ea"/><ellipse cx="120" cy="122" rx="66" ry="76" fill="url(#joint-glow)"/>
      <path d="M94 35q-13 31-10 59 2 17 18 28l13 9 13-11q14-12 14-29 0-26-11-56-4-10-13-8-8 2-9 13-2-12-8-12t-7 7Z" fill="url(#joint-bone)" stroke="#d4ad6f" strokeWidth="3"/><path d="M103 128q-21 4-22 25-1 18 15 29l18 21q6 7 12 0l18-21q16-11 15-29-1-21-22-25l-17 12z" fill="url(#joint-bone)" stroke="#d4ad6f" strokeWidth="3"/><path d="M99 120q21 17 42 0m-47 10q27 15 54 0" fill="none" stroke="#81ad4c" strokeWidth="5" strokeLinecap="round"/>
      <path d="M47 139q-19-21-6-37 22 14 13 35 15-19 34-11-8 23-35 26m140-13q19-21 6-37-22 14-13 35-15-19-34-11 8 23 35 26" fill="#78a64b" stroke="#547b3b" strokeWidth="2"/><path d="M55 146q13-24 29-31m101 31q-13-24-29-31" fill="none" stroke="#e4edce" strokeWidth="2"/>
    </svg>
  ),
  jointMovement: (
    <svg viewBox="0 0 240 240" role="img" aria-label="A person walking with a comfortable, active stride">
      <defs><linearGradient id="joint-figure" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#385f35"/><stop offset="1" stopColor="#18391f"/></linearGradient></defs>
      <circle cx="120" cy="120" r="98" fill="#f8f5ea"/><circle cx="124" cy="52" r="17" fill="#d69e70"/><path d="M110 76q18-12 32 1l15 42-23 14-33-14 1-30z" fill="url(#joint-figure)"/><path d="m111 86-31 28-17-13m77-22 27 25 17-18" fill="none" stroke="#d69e70" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/><path d="m126 129-31 32-29 19m54-23 27 21 24 1" fill="none" stroke="#d69e70" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/><path d="m63 180-13 8m119-10 17 2" fill="none" stroke="#403426" strokeWidth="12" strokeLinecap="round"/><circle cx="96" cy="161" r="8" fill="#8bc64a"/><circle cx="147" cy="158" r="8" fill="#8bc64a"/><path d="M54 134q-18-14-9-27 19 9 16 27 13-18 28-12-4 20-28 22m111-13q18-14 9-27-19 9-16 27-13-18-28-12 4 20 28 22" fill="#80ad4d" stroke="#537b39" strokeWidth="2"/><path d="M62 138q13-20 26-25m96 25q-13-20-26-25" fill="none" stroke="#e4edcf" strokeWidth="2"/><path d="m179 58 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#e0b640"/>
    </svg>
  ),
  ingredients: (
    <svg viewBox="0 0 240 190" role="img" aria-label="Traditional herbs, seeds and a hand-carved mortar">
      <defs>
        <linearGradient id="journey-wood" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#edc28e"/><stop offset=".5" stopColor="#bd8250"/><stop offset="1" stopColor="#845438"/></linearGradient>
        <linearGradient id="journey-bowl" x1="0" y1="0" x2="0.8" y2="1"><stop stopColor="#d3a16f"/><stop offset="1" stopColor="#8b5d3d"/></linearGradient>
        <filter id="journey-shadow" x="-.3" y="-.3" width="1.6" height="1.8"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <ellipse cx="121" cy="163" rx="79" ry="9" fill="#27301f" opacity=".12" filter="url(#journey-shadow)"/>
      <circle cx="120" cy="94" r="72" fill="#f0eee6"/>
      <g fill="none" stroke="#597945" strokeWidth="2.5" strokeLinecap="round">
        <path d="M44 145Q35 95 58 46M64 146Q62 99 86 43M176 145Q191 91 182 48"/>
        <path d="m46 112-18-8m19-16-17-11m24-5L43 60m23 65-18-7m32-17-17-8m19-16-14-8m97 44 18-9m-14-13 17-7m-16-23 15-8"/>
      </g>
      <g fill="#6f9a50" stroke="#52743c" strokeWidth="1.2">
        <path d="M29 103Q18 87 28 77q15 8 11 22m-7-21 10 14M31 72Q18 55 30 44q15 10 10 22m-9-20 9 14M45 105Q33 91 42 80q15 7 13 21m-11-18 9 14"/>
        <path d="M61 124Q48 110 58 99q15 7 13 21m-11-18 9 14M72 86Q61 69 74 59q14 10 10 22m-8-19 8 14M177 111q-1-18 13-22 9 15-5 26m3-22-5 17M190 76q0-18 14-21 8 17-7 26m5-22-7 17"/>
      </g>
      <path d="m139 99 38-63q6-9 13-5t2 13l-39 64" fill="url(#journey-wood)" stroke="#835633" strokeWidth="2.5"/>
      <path d="m144 98 36-59" stroke="#f7dfb6" strokeWidth="3" strokeLinecap="round" opacity=".7"/>
      <path d="M60 108h120l-12 43q-2 10-48 10t-48-10z" fill="url(#journey-bowl)" stroke="#80553a" strokeWidth="2.5"/>
      <ellipse cx="120" cy="108" rx="60" ry="17" fill="#e2b783" stroke="#80553a" strokeWidth="2.5"/>
      <ellipse cx="120" cy="108" rx="44" ry="10" fill="#55402c"/>
      <path d="M77 111q43 14 86 0" fill="none" stroke="#f1d0a4" strokeWidth="2" opacity=".65"/>
      <g fill="#c49b59"><ellipse cx="100" cy="106" rx="2.4" ry="1.8"/><ellipse cx="112" cy="111" rx="2" ry="1.5"/><ellipse cx="123" cy="105" rx="2.4" ry="1.8"/><ellipse cx="135" cy="110" rx="2" ry="1.5"/><ellipse cx="145" cy="105" rx="1.8" ry="1.5"/></g>
      <path d="M78 130q40 10 82 0" fill="none" stroke="#f1d0a4" strokeWidth="2" opacity=".45"/>
    </svg>
  ),
  ritual: (
    <svg viewBox="0 0 240 190" role="img" aria-label="A wooden spoon measuring herbal powder beside a glass of water">
      <defs>
        <linearGradient id="journey-glass" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#b8d6d0" stopOpacity=".55"/><stop offset=".45" stopColor="#fff" stopOpacity=".85"/><stop offset="1" stopColor="#9cbdb7" stopOpacity=".45"/></linearGradient>
        <linearGradient id="journey-water" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#dff3e9"/><stop offset="1" stopColor="#a9d5cb"/></linearGradient>
        <linearGradient id="journey-spoon" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f0c990"/><stop offset="1" stopColor="#a46d42"/></linearGradient>
      </defs>
      <ellipse cx="119" cy="164" rx="79" ry="9" fill="#263629" opacity=".12"/>
      <circle cx="119" cy="94" r="72" fill="#f0eee6"/>
      <path d="m116 83 70-49q9-6 14 1t-3 12l-75 51" fill="url(#journey-spoon)" stroke="#92613c" strokeWidth="2.5"/>
      <ellipse cx="111" cy="88" rx="25" ry="11" transform="rotate(-34 111 88)" fill="#d7a36c" stroke="#92613c" strokeWidth="2"/>
      <path d="M89 88q19 2 34-13" fill="none" stroke="#f4d8ae" strokeWidth="2"/>
      <path d="M99 98q-3 10-7 16m21-13q0 12-2 17m13-21q3 9 4 14" stroke="#8d7048" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 5"/>
      <path d="M46 69h59l-7 79q-2 13-23 13t-22-13z" fill="url(#journey-glass)" stroke="#76958f" strokeWidth="2.5"/>
      <path d="M51 111h49l-4 36q-2 10-21 10t-21-10z" fill="url(#journey-water)" opacity=".9"/>
      <path d="M50 111q25 5 51 0" fill="none" stroke="#83bcb0" strokeWidth="2"/>
      <path d="M58 83v20m6-20v15m33-12-5 56" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8"/>
      <g fill="#8b7149" opacity=".88"><circle cx="112" cy="100" r="1.8"/><circle cx="119" cy="109" r="1.5"/><circle cx="104" cy="112" r="1.5"/><circle cx="114" cy="119" r="1.3"/></g>
      <path d="M157 144q-18-22-4-37 21 13 14 33 9-23 30-21-3 22-29 29" fill="#729752" stroke="#54783c" strokeWidth="2"/>
      <path d="M159 150q11-16 26-25" fill="none" stroke="#d9e6bd" strokeWidth="2"/>
      <path d="m41 51 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#8fba5c"/>
    </svg>
  ),
  comfort: (
    <svg viewBox="0 0 240 190" role="img" aria-label="A softly illustrated stomach with a fresh green leaf">
      <defs>
        <linearGradient id="journey-stomach" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0d7"/><stop offset="1" stopColor="#e8b889"/></linearGradient>
        <filter id="journey-glow" x="-.5" y="-.5" width="2" height="2"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <circle cx="120" cy="94" r="72" fill="#f0eee6"/>
      <circle cx="120" cy="96" r="58" fill="#e6f0d9" opacity=".48"/>
      <path d="M96 39c-1 19 0 29 9 35 10 7 20 3 29-1 13-6 29 0 32 17 5 29-19 53-47 59-29 7-57-9-60-34-2-17 6-28 19-37 11-8 16-16 18-39Z" fill="#c6e99a" opacity=".7" filter="url(#journey-glow)"/>
      <path d="M96 39c-1 19 0 29 9 35 10 7 20 3 29-1 13-6 29 0 32 17 5 29-19 53-47 59-29 7-57-9-60-34-2-17 6-28 19-37 11-8 16-16 18-39Z" fill="url(#journey-stomach)" stroke="#79ad45" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M104 48q-2 20 12 29 13 7 29 1" fill="none" stroke="#fff9eb" strokeWidth="4" strokeLinecap="round" opacity=".85"/>
      <path d="M110 117q11-28 39-33 2 27-24 43-12 7-15-10Z" fill="#719a48" stroke="#527638" strokeWidth="2.5"/>
      <path d="M113 126q14-21 30-31" fill="none" stroke="#e8f0d6" strokeWidth="2.5" strokeLinecap="round"/>
      <g fill="none" stroke="#86b957" strokeWidth="2.5" strokeLinecap="round" opacity=".85">
        <path d="m57 69-9-8m13-8 1-12m112 74 12 6m-6-19 12-4"/>
        <path d="M69 137q-12-6-19 1m128 13q13 1 18-8"/>
      </g>
      <path d="m50 93 2 6 6 2-6 2-2 6-2-6-6-2 6-2zm141-53 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#a2cc65"/>
    </svg>
  ),
  wellbeing: (
    <svg viewBox="0 0 240 190" role="img" aria-label="A calm figure framed by flourishing botanical leaves">
      <defs>
        <linearGradient id="journey-figure" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6e9e4c"/><stop offset="1" stopColor="#315f35"/></linearGradient>
      </defs>
      <circle cx="120" cy="93" r="72" fill="#f0eee6"/>
      <circle cx="120" cy="90" r="50" fill="#e3edd6"/>
      <circle cx="120" cy="90" r="39" fill="none" stroke="#d0dfbd" strokeWidth="1.5"/>
      <path d="M43 153q20-22 23-55m131 55q-20-22-23-55M54 137q-6-36-20-50m152 50q6-36 20-50" fill="none" stroke="#769657" strokeWidth="2" strokeLinecap="round"/>
      <g fill="#83a961">
        <path d="M62 121q-22-19-10-31 20 7 17 28-1-23 15-28 5 19-15 33m99-2q22-19 10-31-20 7-17 28 1-23-15-28-5 19 15 33"/>
        <path d="M46 105q-20-18-10-28 19 8 14 25 3-19 17-21 3 17-17 27m144-3q20-18 10-28-19 8-14 25-3-19-17-21-3 17 17 27" fill="#a3bd7b"/>
      </g>
      <circle cx="120" cy="47" r="14" fill="url(#journey-figure)"/>
      <path d="M108 68q12-10 24 0l10 38-22 12-22-12z" fill="url(#journey-figure)"/>
      <path d="m104 78-27-23m59 23 27-23M120 116l-24 37m24-37 24 37" fill="none" stroke="#426f3b" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M72 124q24 17 48 3 25 14 48-3" fill="none" stroke="#8db84f" strokeWidth="3" strokeLinecap="round"/>
      <path d="M114 48h12M114 88q6 4 12 0" fill="none" stroke="#dce9c9" strokeWidth="2" strokeLinecap="round"/>
      <path d="m52 57 2 6 6 2-6 2-2 6-2-6-6-2 6-2zm136 17 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#8db84f"/>
    </svg>
  ),
};

/** Data-driven product journey. Supply product-specific title, milestones and closing copy. */
export default function ProductWellnessJourney({
  eyebrow = '4-WEEK WELLNESS JOURNEY',
  title,
  milestones,
  closingTitle,
  closingText,
  variant = 'default',
}) {
  if (!title || !Array.isArray(milestones) || milestones.length !== 4) return null;

  return (
    <section className={`wellness-journey${variant ? ` wellness-journey--${variant} wellness-journey--themed` : ''}`} aria-labelledby="wellness-journey-title">
      <div className="wellness-journey__inner">
        <p className="wellness-journey__eyebrow">{eyebrow}</p>
        <h2 className="wellness-journey__title" id="wellness-journey-title">{title}</h2>
        <div className="wellness-journey__milestones">
          <div className="wellness-journey__line" aria-hidden="true" />
          {milestones.map((milestone, index) => (
            <article className="wellness-milestone" key={`${milestone.label}-${index}`}>
              <span className="wellness-milestone__number" aria-hidden="true">{index + 1}</span>
              <div className="wellness-milestone__art">{JOURNEY_ART[milestone.art] || JOURNEY_ART.ingredients}</div>
              <h3 className="wellness-milestone__label">{milestone.label}</h3>
              <p className="wellness-milestone__text">{milestone.text}</p>
            </article>
          ))}
        </div>
        {closingTitle && closingText && (
          <div className="wellness-journey__closing">
            <h3>{closingTitle}</h3>
            <p>{closingText}</p>
          </div>
        )}
      </div>
    </section>
  );
}
