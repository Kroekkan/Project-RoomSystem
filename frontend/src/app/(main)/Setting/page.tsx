'use client'

import { useState, useEffect } from "react";

const Theme = [
    { name: "Ocean Blue", background: "#F0F7FF", navbar: "#0B4F6C", header: "#1E88E5"},
    { name: "Forest Green", background: "#F1F8F0", navbar: "#1B4332", header: "#2D6A4F"},
    { name: "Sunset Orange", background: "#FFF6EE", navbar: "#7C2D12", header: "#EA580C"},
    { name: "Royal Purple", background: "#F6F0FB", navbar: "#3B0764", header: "#7C3AED"},
    { name: "Rose Pink", background: "#FFF0F5", navbar: "#831843", header: "#DB2777"},
    { name: "Midnight Dark", background: "#121212", navbar: "#000000", header: "#1F1F1F"},
    { name: "Sunny Yellow", background: "#FFFDF0", navbar: "#78350F", header: "#F59E0B"},
    { name: "Mint Fresh", background: "#F0FDF9", navbar: "#134E4A", header: "#14B8A6"},
    { name: "Crimson Red", background: "#FFF1F1", navbar: "#7F1D1D", header: "#DC2626" },
    { name: "Sky Cyan", background: "#ECFEFF", navbar: "#164E63", header: "#06B6D4" },
    { name: "Coffee Brown", background: "#FBF7F2", navbar: "#3E2723", header: "#795548" },
    { name: "Lavender Soft", background: "#F5F3FF", navbar: "#4C1D95", header: "#A78BFA" },
    { name: "Steel Gray", background: "#F5F5F5", navbar: "#374151", header: "#6B7280" },
    { name: "Emerald Luxury", background: "#0F172A", navbar: "#022C22", header: "#059669" },
    { name: "Peach Cream", background: "#FFF8F0", navbar: "#9A3412", header: "#FDBA74" },
    { name: "Indigo Night", background: "#1E1B4B", navbar: "#000000", header: "#4338CA" },
    { name: "Lime Zest", background: "#F7FEE7", navbar: "#365314", header: "#84CC16" },
    { name: "Coral Reef", background: "#FFF5F5", navbar: "#9F1239", header: "#FB7185" },
    { name: "Navy Classic", background: "#F8FAFC", navbar: "#0F172A", header: "#1E3A8A" },
    { name: "Graphite Mono", background: "#FAFAFA", navbar: "#18181B", header: "#27272A" },
]

const SetColor = [
    { name: "red", set: [
        { color: "oklch(97.1% 0.013 17.38)" },
        { color: "oklch(93.6% 0.032 17.717)" },
        { color: "oklch(88.5% 0.062 18.334)" },
        { color: "oklch(80.8% 0.114 19.571)" },
        { color: "oklch(70.4% 0.191 22.216)" },
        { color: "oklch(63.7% 0.237 25.331)" },
        { color: "oklch(57.7% 0.245 27.325)" },
        { color: "oklch(50.5% 0.213 27.518)" },
        { color: "oklch(44.4% 0.177 26.899)" },
        { color: "oklch(39.6% 0.141 25.723)" },
        { color: "oklch(25.8% 0.092 26.042)" },
    ]},
    { name: "orange", set: [
        { color: "oklch(98% 0.016 73.684)" },
        { color: "oklch(95.4% 0.038 75.164)" },
        { color: "oklch(90.1% 0.076 70.697)" },
        { color: "oklch(83.7% 0.128 66.29)" },
        { color: "oklch(75% 0.183 55.934)" },
        { color: "oklch(70.5% 0.213 47.604)" },
        { color: "oklch(64.6% 0.222 41.116)" },
        { color: "oklch(55.3% 0.195 38.402)" },
        { color: "oklch(47% 0.157 37.304)" },
        { color: "oklch(40.8% 0.123 38.172)" },
        { color: "oklch(26.6% 0.079 36.259)" },
    ]},
    { name: "amber", set: [
        { color: "oklch(98.7% 0.022 95.277)" },
        { color: "oklch(96.2% 0.059 95.617)" },
        { color: "oklch(92.4% 0.12 95.746)" },
        { color: "oklch(87.9% 0.169 91.605)" },
        { color: "oklch(82.8% 0.189 84.429)" },
        { color: "oklch(76.9% 0.188 70.08)" },
        { color: "oklch(66.6% 0.179 58.318)" },
        { color: "oklch(55.5% 0.163 48.998)" },
        { color: "oklch(47.3% 0.137 46.201)" },
        { color: "oklch(41.4% 0.112 45.904)" },
        { color: "oklch(27.9% 0.077 45.635)" },
    ]},
    { name: "yellow", set: [
        { color: "oklch(98.7% 0.026 102.212)" },
        { color: "oklch(97.3% 0.071 103.193)" },
        { color: "oklch(94.5% 0.129 101.54)" },
        { color: "oklch(90.5% 0.182 98.111)" },
        { color: "oklch(85.2% 0.199 91.936)" },
        { color: "oklch(79.5% 0.184 86.047)" },
        { color: "oklch(68.1% 0.162 75.834)" },
        { color: "oklch(55.4% 0.135 66.442)" },
        { color: "oklch(47.6% 0.114 61.907)" },
        { color: "oklch(42.1% 0.095 57.708)" },
        { color: "oklch(28.6% 0.066 53.813)" },
    ]},
    { name: "lime", set: [
        { color: "oklch(98.6% 0.031 120.757)" },
        { color: "oklch(96.7% 0.067 122.328)" },
        { color: "oklch(93.8% 0.127 124.321)" },
        { color: "oklch(89.7% 0.196 126.665)" },
        { color: "oklch(84.1% 0.238 128.85)" },
        { color: "oklch(76.8% 0.233 130.85)" },
        { color: "oklch(64.8% 0.2 131.684)" },
        { color: "oklch(53.2% 0.157 131.589)" },
        { color: "oklch(45.3% 0.124 130.933)" },
        { color: "oklch(40.5% 0.101 131.063)" },
        { color: "oklch(27.4% 0.072 132.109)" },
    ]},
    { name: "green", set: [
        { color: "oklch(98.2% 0.018 155.826)" },
        { color: "oklch(96.2% 0.044 156.743)" },
        { color: "oklch(92.5% 0.084 155.995)" },
        { color: "oklch(87.1% 0.15 154.449)" },
        { color: "oklch(79.2% 0.209 151.711)" },
        { color: "oklch(72.3% 0.219 149.579)" },
        { color: "oklch(62.7% 0.194 149.214)" },
        { color: "oklch(52.7% 0.154 150.069)" },
        { color: "oklch(44.8% 0.119 151.328)" },
        { color: "oklch(39.3% 0.095 152.535)" },
        { color: "oklch(26.6% 0.065 152.934)" },
    ]},
    { name: "emerald", set: [
        { color: "oklch(97.9% 0.021 166.113)" },
        { color: "oklch(95% 0.052 163.051)" },
        { color: "oklch(90.5% 0.093 164.15)" },
        { color: "oklch(84.5% 0.143 164.978)" },
        { color: "oklch(76.5% 0.177 163.223)" },
        { color: "oklch(69.6% 0.17 162.48)" },
        { color: "oklch(59.6% 0.145 163.225)" },
        { color: "oklch(50.8% 0.118 165.612)" },
        { color: "oklch(43.2% 0.095 166.913)" },
        { color: "oklch(37.8% 0.077 168.94)" },
        { color: "oklch(26.2% 0.051 172.552)" },
    ]},
    { name: "teal", set: [
        { color: "oklch(98.4% 0.014 180.72)" },
        { color: "oklch(95.3% 0.051 180.801)" },
        { color: "oklch(91% 0.096 180.426)" },
        { color: "oklch(85.5% 0.138 181.071)" },
        { color: "oklch(77.7% 0.152 181.912)" },
        { color: "oklch(70.4% 0.14 182.503)" },
        { color: "oklch(60% 0.118 184.704)" },
        { color: "oklch(51.1% 0.096 186.391)" },
        { color: "oklch(43.7% 0.078 188.216)" },
        { color: "oklch(38.6% 0.063 188.416)" },
        { color: "oklch(27.7% 0.046 192.524)" },
    ]},
    { name: "cyan", set: [
        { color: "oklch(98.4% 0.019 200.873)" },
        { color: "oklch(95.6% 0.045 203.388)" },
        { color: "oklch(91.7% 0.08 205.041)" },
        { color: "oklch(86.5% 0.127 207.078)" },
        { color: "oklch(78.9% 0.154 211.53)" },
        { color: "oklch(71.5% 0.143 215.221)" },
        { color: "oklch(60.9% 0.126 221.723)" },
        { color: "oklch(52% 0.105 223.128)" },
        { color: "oklch(45% 0.085 224.283)" },
        { color: "oklch(39.8% 0.07 227.392)" },
        { color: "oklch(30.2% 0.056 229.695)" },
    ]},
    { name: "sky", set: [
        { color: "oklch(97.7% 0.013 236.62)" },
        { color: "oklch(95.1% 0.026 236.824)" },
        { color: "oklch(90.1% 0.058 230.902)" },
        { color: "oklch(82.8% 0.111 230.318)" },
        { color: "oklch(74.6% 0.16 232.661)" },
        { color: "oklch(68.5% 0.169 237.323)" },
        { color: "oklch(58.8% 0.158 241.966)" },
        { color: "oklch(50% 0.134 242.749)" },
        { color: "oklch(44.3% 0.11 240.79)" },
        { color: "oklch(39.1% 0.09 240.876)" },
        { color: "oklch(29.3% 0.066 243.157)" },
    ]},
    { name: "blue", set: [
        { color: "oklch(97% 0.014 254.604)" },
        { color: "oklch(93.2% 0.032 255.585)" },
        { color: "oklch(88.2% 0.059 254.128)" },
        { color: "oklch(80.9% 0.105 251.813)" },
        { color: "oklch(70.7% 0.165 254.624)" },
        { color: "oklch(62.3% 0.214 259.815)" },
        { color: "oklch(54.6% 0.245 262.881)" },
        { color: "oklch(48.8% 0.243 264.376)" },
        { color: "oklch(42.4% 0.199 265.638)" },
        { color: "oklch(37.9% 0.146 265.522)" },
        { color: "oklch(28.2% 0.091 267.935)" },
    ]},
    { name: "indigo", set: [
        { color: "oklch(96.2% 0.018 272.314)" },
        { color: "oklch(93% 0.034 272.788)" },
        { color: "oklch(87% 0.065 274.039)" },
        { color: "oklch(78.5% 0.115 274.713)" },
        { color: "oklch(67.3% 0.182 276.935)" },
        { color: "oklch(58.5% 0.233 277.117)" },
        { color: "oklch(51.1% 0.262 276.966)" },
        { color: "oklch(45.7% 0.24 277.023)" },
        { color: "oklch(39.8% 0.195 277.366)" },
        { color: "oklch(35.9% 0.144 278.697)" },
        { color: "oklch(25.7% 0.09 281.288)" },
    ]},
    { name: "violet", set: [
        { color: "oklch(96.9% 0.016 293.756)" },
        { color: "oklch(94.3% 0.029 294.588)" },
        { color: "oklch(89.4% 0.057 293.283)" },
        { color: "oklch(81.1% 0.111 293.571)" },
        { color: "oklch(70.2% 0.183 293.541)" },
        { color: "oklch(60.6% 0.25 292.717)" },
        { color: "oklch(54.1% 0.281 293.009)" },
        { color: "oklch(49.1% 0.27 292.581)" },
        { color: "oklch(43.2% 0.232 292.759)" },
        { color: "oklch(38% 0.189 293.745)" },
        { color: "oklch(28.3% 0.141 291.089)" },
    ]},
    { name: "purple", set: [
        { color: "oklch(97.7% 0.014 308.299)" },
        { color: "oklch(94.6% 0.033 307.174)" },
        { color: "oklch(90.2% 0.063 306.703)" },
        { color: "oklch(82.7% 0.119 306.383)" },
        { color: "oklch(71.4% 0.203 305.504)" },
        { color: "oklch(62.7% 0.265 303.9)" },
        { color: "oklch(55.8% 0.288 302.321)" },
        { color: "oklch(49.6% 0.265 301.924)" },
        { color: "oklch(43.8% 0.218 303.724)" },
        { color: "oklch(38.1% 0.176 304.987)" },
        { color: "oklch(29.1% 0.149 302.717)" },
    ]},
    { name: "fuchsia", set: [
        { color: "oklch(97.7% 0.017 320.058)" },
        { color: "oklch(95.2% 0.037 318.852)" },
        { color: "oklch(90.3% 0.076 319.62)" },
        { color: "oklch(83.3% 0.145 321.434)" },
        { color: "oklch(74% 0.238 322.16)" },
        { color: "oklch(66.7% 0.295 322.15)" },
        { color: "oklch(59.1% 0.293 322.896)" },
        { color: "oklch(51.8% 0.253 323.949)" },
        { color: "oklch(45.2% 0.211 324.591)" },
        { color: "oklch(40.1% 0.17 325.612)" },
        { color: "oklch(29.3% 0.136 325.661)" },
    ]},
    { name: "pink", set: [
        { color: "oklch(97.1% 0.014 343.198)" },
        { color: "oklch(94.8% 0.028 342.258)" },
        { color: "oklch(89.9% 0.061 343.231)" },
        { color: "oklch(82.3% 0.12 346.018)" },
        { color: "oklch(71.8% 0.202 349.761)" },
        { color: "oklch(65.6% 0.241 354.308)" },
        { color: "oklch(59.2% 0.249 0.584)" },
        { color: "oklch(52.5% 0.223 3.958)" },
        { color: "oklch(45.9% 0.187 3.815)" },
        { color: "oklch(40.8% 0.153 2.432)" },
        { color: "oklch(28.4% 0.109 3.907)" },
    ]},
    { name: "rose", set: [
        { color: "oklch(96.9% 0.015 12.422)" },
        { color: "oklch(94.1% 0.03 12.58)" },
        { color: "oklch(89.2% 0.058 10.001)" },
        { color: "oklch(81% 0.117 11.638)" },
        { color: "oklch(71.2% 0.194 13.428)" },
        { color: "oklch(64.5% 0.246 16.439)" },
        { color: "oklch(58.6% 0.253 17.585)" },
        { color: "oklch(51.4% 0.222 16.935)" },
        { color: "oklch(45.5% 0.188 13.697)" },
        { color: "oklch(41% 0.159 10.272)" },
        { color: "oklch(27.1% 0.105 12.094)" },
    ]},
    { name: "slate", set: [
        { color: "oklch(98.4% 0.003 247.858)" },
        { color: "oklch(96.8% 0.007 247.896)" },
        { color: "oklch(92.9% 0.013 255.508)" },
        { color: "oklch(86.9% 0.022 252.894)" },
        { color: "oklch(70.4% 0.04 256.788)" },
        { color: "oklch(55.4% 0.046 257.417)" },
        { color: "oklch(44.6% 0.043 257.281)" },
        { color: "oklch(37.2% 0.044 257.287)" },
        { color: "oklch(27.9% 0.041 260.031)" },
        { color: "oklch(20.8% 0.042 265.755)" },
        { color: "oklch(12.9% 0.042 264.695)" },
    ]},
    { name: "gray", set: [
        { color: "oklch(98.5% 0.002 247.839)" },
        { color: "oklch(96.7% 0.003 264.542)" },
        { color: "oklch(92.8% 0.006 264.531)" },
        { color: "oklch(87.2% 0.01 258.338)" },
        { color: "oklch(70.7% 0.022 261.325)" },
        { color: "oklch(55.1% 0.027 264.364)" },
        { color: "oklch(44.6% 0.03 256.802)" },
        { color: "oklch(37.3% 0.034 259.733)" },
        { color: "oklch(27.8% 0.033 256.848)" },
        { color: "oklch(21% 0.034 264.665)" },
        { color: "oklch(13% 0.028 261.692)" },
    ]},
    { name: "zinc", set: [
        { color: "oklch(98.5% 0 0)" },
        { color: "oklch(96.7% 0.001 286.375)" },
        { color: "oklch(92% 0.004 286.32)" },
        { color: "oklch(87.1% 0.006 286.286)" },
        { color: "oklch(70.5% 0.015 286.067)" },
        { color: "oklch(55.2% 0.016 285.938)" },
        { color: "oklch(44.2% 0.017 285.786)" },
        { color: "oklch(37% 0.013 285.805)" },
        { color: "oklch(27.4% 0.006 286.033)" },
        { color: "oklch(21% 0.006 285.885)" },
        { color: "oklch(14.1% 0.005 285.823)" },
    ]},
    { name: "neutral", set: [
        { color: "oklch(98.5% 0 0)" },
        { color: "oklch(97% 0 0)" },
        { color: "oklch(92.2% 0 0)" },
        { color: "oklch(87% 0 0)" },
        { color: "oklch(70.8% 0 0)" },
        { color: "oklch(55.6% 0 0)" },
        { color: "oklch(43.9% 0 0)" },
        { color: "oklch(37.1% 0 0)" },
        { color: "oklch(26.9% 0 0)" },
        { color: "oklch(20.5% 0 0)" },
        { color: "oklch(14.5% 0 0)" },
    ]},
    { name: "stone", set: [
        { color: "oklch(98.5% 0.001 106.423)" },
        { color: "oklch(97% 0.001 106.424)" },
        { color: "oklch(92.3% 0.003 48.717)" },
        { color: "oklch(86.9% 0.005 56.366)" },
        { color: "oklch(70.9% 0.01 56.259)" },
        { color: "oklch(55.3% 0.013 58.071)" },
        { color: "oklch(44.4% 0.011 73.639)" },
        { color: "oklch(37.4% 0.01 67.558)" },
        { color: "oklch(26.8% 0.007 34.298)" },
        { color: "oklch(21.6% 0.006 56.043)" },
        { color: "oklch(14.7% 0.004 49.25)" },
    ]},
    { name: "taupe", set: [
        { color: "oklch(98.6% 0.002 67.8)" },
        { color: "oklch(96% 0.002 17.2)" },
        { color: "oklch(92.2% 0.005 34.3)" },
        { color: "oklch(86.8% 0.007 39.5)" },
        { color: "oklch(71.4% 0.014 41.2)" },
        { color: "oklch(54.7% 0.021 43.1)" },
        { color: "oklch(43.8% 0.017 39.3)" },
        { color: "oklch(36.7% 0.016 35.7)" },
        { color: "oklch(26.8% 0.011 36.5)" },
        { color: "oklch(21.4% 0.009 43.1)" },
        { color: "oklch(14.7% 0.004 49.3)" },
    ]},
    { name: "mauve", set: [
        { color: "oklch(98.5% 0 0)" },
        { color: "oklch(96% 0.003 325.6)" },
        { color: "oklch(92.2% 0.005 325.62)" },
        { color: "oklch(86.5% 0.012 325.68)" },
        { color: "oklch(71.1% 0.019 323.02)" },
        { color: "oklch(54.2% 0.034 322.5)" },
        { color: "oklch(43.5% 0.029 321.78)" },
        { color: "oklch(36.4% 0.029 323.89)" },
        { color: "oklch(26.3% 0.024 320.12)" },
        { color: "oklch(21.2% 0.019 322.12)" },
        { color: "oklch(14.5% 0.008 326)" },
    ]},
    { name: "mist", set: [
        { color: "oklch(98.7% 0.002 197.1)" },
        { color: "oklch(96.3% 0.002 197.1)" },
        { color: "oklch(92.5% 0.005 214.3)" },
        { color: "oklch(87.2% 0.007 219.6)" },
        { color: "oklch(72.3% 0.014 214.4)" },
        { color: "oklch(56% 0.021 213.5)" },
        { color: "oklch(45% 0.017 213.2)" },
        { color: "oklch(37.8% 0.015 216)" },
        { color: "oklch(27.5% 0.011 216.9)" },
        { color: "oklch(21.8% 0.008 223.9)" },
        { color: "oklch(14.8% 0.004 228.8)" },
    ]},
    { name: "olive", set: [
        { color: "oklch(98.8% 0.003 106.5)" },
        { color: "oklch(96.6% 0.005 106.5)" },
        { color: "oklch(93% 0.007 106.5)" },
        { color: "oklch(88% 0.011 106.6)" },
        { color: "oklch(73.7% 0.021 106.9)" },
        { color: "oklch(58% 0.031 107.3)" },
        { color: "oklch(46.6% 0.025 107.3)" },
        { color: "oklch(39.4% 0.023 107.4)" },
        { color: "oklch(28.6% 0.016 107.4)" },
        { color: "oklch(22.8% 0.013 107.4)" },
        { color: "oklch(15.3% 0.006 107.1)" },
    ]},
]

export default function Setting() {
  const defaultTheme = Theme[0];

  const defaultColors = {
    background: defaultTheme.background,
    backgroundText: '#0f172a',
    backgroundHover: '#e2e8f0',

    navbar: defaultTheme.navbar,
    navbarText: '#ffffff',
    navbarHover: defaultTheme.header,

    header: defaultTheme.header,
    headerText: '#ffffff',
    headerHover: defaultTheme.navbar,
  };

  const [colors, setColors] = useState(defaultColors);
  const [selectedTheme, setSelectedTheme] = useState(defaultTheme.name);
  const [isSaved, setIsSaved] = useState(false);

  const applyColors = (nextColors: typeof defaultColors) => {
    document.documentElement.style.setProperty(
      '--app-background',
      nextColors.background,
    );
    document.documentElement.style.setProperty(
      '--app-background-text',
      nextColors.backgroundText,
    );
    document.documentElement.style.setProperty(
      '--app-background-hover',
      nextColors.backgroundHover,
    );

    document.documentElement.style.setProperty(
      '--app-navbar',
      nextColors.navbar,
    );
    document.documentElement.style.setProperty(
      '--app-navbar-text',
      nextColors.navbarText,
    );
    document.documentElement.style.setProperty(
      '--app-navbar-hover',
      nextColors.navbarHover,
    );

    document.documentElement.style.setProperty(
      '--app-header',
      nextColors.header,
    );
    document.documentElement.style.setProperty(
      '--app-header-text',
      nextColors.headerText,
    );
    document.documentElement.style.setProperty(
      '--app-header-hover',
      nextColors.headerHover,
    );

    document.body.style.backgroundColor = nextColors.background;
    document.body.style.color = nextColors.backgroundText;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('roomify-theme');

    if (!savedTheme) {
      applyColors(defaultColors);
      return;
    }

    try {
      const parsed = JSON.parse(savedTheme);

      if (parsed.background && parsed.navbar && parsed.header) {
        const nextColors = {
          ...defaultColors,
          ...parsed,
        };

        setColors(nextColors);
        setSelectedTheme(parsed.name || 'กำหนดเอง');
        applyColors(nextColors);
      }
    } catch {
      applyColors(defaultColors);
    }
  }, []);

  const handleThemeSelect = (theme: (typeof Theme)[number]) => {
    const nextColors = {
      background: theme.background,
      backgroundText: '#0f172a',
      backgroundHover: '#e2e8f0',

      navbar: theme.navbar,
      navbarText: '#ffffff',
      navbarHover: theme.header,

      header: theme.header,
      headerText: '#ffffff',
      headerHover: theme.navbar,
    };

    setColors(nextColors);
    setSelectedTheme(theme.name);
    setIsSaved(false);
    applyColors(nextColors);
  };

  const handleColorSelect = (
    target: keyof typeof defaultColors,
    color: string,
  ) => {
    const nextColors = {
      ...colors,
      [target]: color,
    };

    setColors(nextColors);
    setSelectedTheme('กำหนดเอง');
    setIsSaved(false);
    applyColors(nextColors);
  };

  const handleSave = () => {
    localStorage.setItem(
      'roomify-theme',
      JSON.stringify({
        ...colors,
        name: selectedTheme,
      }),
    );

    setIsSaved(true);
    window.setTimeout(() => setIsSaved(false), 1800);
  };

  const handleReset = () => {
    setColors(defaultColors);
    setSelectedTheme(defaultTheme.name);
    setIsSaved(false);

    localStorage.removeItem('roomify-theme');
    applyColors(defaultColors);
  };

  const ColorPicker = ({
    title,
    target,
    description,
  }: {
    title: string;
    target: keyof typeof defaultColors;
    description: string;
  }) => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span
            className="h-6 w-6 rounded-lg border border-black/10"
            style={{ backgroundColor: colors[target] }}
          />
          <span className="font-mono text-xs font-semibold text-slate-600">
            {colors[target]}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {SetColor.map((group) => (
          <div
            key={`${target}-${group.name}`}
            className="flex flex-col gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0 md:flex-row md:items-center"
          >
            <div className="w-24 text-sm font-bold capitalize text-slate-600">
              {group.name}
            </div>

            <div className="flex flex-1 flex-wrap gap-2">
              {group.set.map((item, index) => {
                const isSelected = colors[target] === item.color;

                return (
                  <button
                    key={`${group.name}-${index}`}
                    type="button"
                    onClick={() => handleColorSelect(target, item.color)}
                    className={`h-9 w-9 cursor-pointer rounded-xl border-2 transition-transform hover:scale-110 ${
                      isSelected
                        ? 'scale-110 border-slate-900 ring-2 ring-slate-300'
                        : 'border-white shadow-sm ring-1 ring-slate-200'
                    }`}
                    style={{ backgroundColor: item.color }}
                    title={`${group.name} ${index + 1}`}
                    aria-label={`เลือกสี ${group.name}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div
      className="min-h-screen px-4 py-8 md:px-8"
      style={{
        backgroundColor: colors.background,
        color: colors.backgroundText,
      }}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-3xl bg-white shadow-lg">
          <div
            className="p-6 md:p-8"
            style={{
              backgroundColor: colors.header,
              color: colors.headerText,
            }}
          >
            <p className="mb-2 text-sm font-semibold opacity-80">
              ROOMIFY SETTINGS
            </p>
            <h1 className="text-3xl font-extrabold">ปรับแต่งธีมระบบ</h1>
            <p className="mt-2 text-sm opacity-90">
              เลือกสีที่เหมาะกับรูปแบบของระบบคุณ และดูตัวอย่างได้ทันที
            </p>
          </div>

          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ธีมที่กำลังใช้งาน
              </p>
              <p className="mt-1 text-lg font-bold text-slate-800">
                {selectedTheme}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                คืนค่าเริ่มต้น
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="cursor-pointer rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                {isSaved ? '✓ บันทึกแล้ว' : 'บันทึกธีมนี้'}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Live Preview
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-800">
              ตัวอย่างการแสดงผล
            </h2>
          </div>

          <div
            className="overflow-hidden rounded-2xl border border-slate-200"
            style={{
              backgroundColor: colors.background,
              color: colors.backgroundText,
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{
                backgroundColor: colors.navbar,
                color: colors.navbarText,
              }}
            >
              <span className="text-lg font-extrabold">roomify</span>

              <button
                type="button"
                className="rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor = colors.navbarHover;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor =
                    'rgba(255,255,255,0.15)';
                }}
              >
                ผู้ใช้งาน
              </button>
            </div>

            <div className="p-5">
              <div
                className="rounded-2xl p-5 shadow-sm"
                style={{
                  backgroundColor: colors.header,
                  color: colors.headerText,
                }}
              >
                <p className="text-sm font-semibold opacity-80">
                  จัดการห้องเรียน
                </p>
                <h3 className="mt-1 text-xl font-bold">
                  ระบบจองห้องเรียน
                </h3>

                <button
                  type="button"
                  className="mt-4 rounded-xl px-4 py-2 text-sm font-bold transition-colors"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: colors.headerText,
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor =
                      colors.headerHover;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor =
                      'rgba(255,255,255,0.15)';
                  }}
                >
                  ดูรายละเอียด
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {['ห้องว่าง', 'รออนุมัติ', 'การจองวันนี้'].map(
                  (label, index) => (
                    <div
                      key={label}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors"
                      onMouseEnter={(event) => {
                        event.currentTarget.style.backgroundColor =
                          colors.backgroundHover;
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="mt-1 text-2xl font-bold text-slate-800">
                        {index === 0 ? '12' : index === 1 ? '3' : '8'}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Preset Themes
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-800">
              ธีมสำเร็จรูป
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              คลิกธีมที่ต้องการเพื่อดูผลลัพธ์ทันที
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Theme.map((theme) => {
              const isSelected = selectedTheme === theme.name;

              return (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => handleThemeSelect(theme)}
                  className={`group cursor-pointer rounded-2xl border p-3 text-left transition-all hover:-translate-y-1 hover:shadow-md ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className="mb-3 overflow-hidden rounded-xl border border-black/5"
                    style={{ backgroundColor: theme.background }}
                  >
                    <div
                      className="h-5"
                      style={{ backgroundColor: theme.navbar }}
                    />

                    <div className="p-3">
                      <div
                        className="h-8 rounded-lg"
                        style={{ backgroundColor: theme.header }}
                      />
                      <div className="mt-2 h-2 w-3/4 rounded bg-slate-200" />
                      <div className="mt-1 h-2 w-1/2 rounded bg-slate-200" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-700">
                      {theme.name}
                    </span>

                    {isSelected && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                        ใช้งานอยู่
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <ColorPicker
          title="สีพื้นหลัง"
          target="background"
          description="ใช้เป็นสีพื้นหลังหลักของหน้าเว็บ"
        />

        <ColorPicker
          title="สีตัวอักษรบนพื้นหลัง"
          target="backgroundText"
          description="ใช้กับข้อความทั่วไปในเนื้อหาของระบบ"
        />

        <ColorPicker
          title="สี Hover ในเนื้อหา"
          target="backgroundHover"
          description="ใช้เมื่อวางเมาส์บนปุ่มหรือการ์ดในหน้าเนื้อหา"
        />

        <ColorPicker
          title="สีแถบนำทาง"
          target="navbar"
          description="ใช้กับ Sidebar หรือ Navigation Bar"
        />

        <ColorPicker
          title="สีตัวอักษร Navbar"
          target="navbarText"
          description="ใช้กับข้อความและไอคอนภายใน Navbar"
        />

        <ColorPicker
          title="สี Hover Navbar"
          target="navbarHover"
          description="ใช้กับเมนู Navbar เมื่อวางเมาส์ชี้"
        />

        <ColorPicker
          title="สีส่วนหัว"
          target="header"
          description="ใช้กับ Header, Banner และส่วนที่ต้องการเน้น"
        />

        <ColorPicker
          title="สีตัวอักษร Header"
          target="headerText"
          description="ใช้กับข้อความและไอคอนภายใน Header"
        />

        <ColorPicker
          title="สี Hover Header"
          target="headerHover"
          description="ใช้กับปุ่มหรือเมนูใน Header เมื่อวางเมาส์ชี้"
        />
      </div>
    </div>
  );
}