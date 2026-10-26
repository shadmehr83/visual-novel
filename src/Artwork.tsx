export function Artwork({ kind, dynamicLight = true }: { kind: string; dynamicLight?: boolean }) {
  const cafe = kind === "cafe";
  return (
    <g className={cafe && dynamicLight ? "cafe-dynamic-light" : undefined}>
      <defs>
        <linearGradient id="cafeMovingShade" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#101923" stopOpacity="0" />
          <stop offset=".48" stopColor="#101923" stopOpacity=".22" />
          <stop offset="1" stopColor="#101923" stopOpacity="0" />
        </linearGradient>
        <clipPath id="cafePersonShade">
          <path d="M38 220Q0 160 48 121H116Q170 161 145 240Z" />
          <ellipse cx="83" cy="71" rx="45" ry="60" />
          <path d="M38 85Q13 4 80 3Q150 4 132 102L116 88L108 37Q83 65 43 63Z" />
        </clipPath>
        <clipPath id="cafePlantShade">
          <path d="M-23 0q-50-75-22-88q40 5 45 77Q15-85 40-67q13 35-40 67Q65-40 65-10Q42 15 0 13Z" />
          <path d="M-35 5h68l-12 60h-46z" />
        </clipPath>
        <linearGradient id="wall" x2="1" y2="1">
          <stop stopColor={cafe ? "#70685e" : "#323947"} />
          <stop offset="1" stopColor={cafe ? "#393d3f" : "#1c2330"} />
        </linearGradient>
        <linearGradient id="sky" x2="0" y2="1">
          <stop stopColor="#6c818a" />
          <stop offset="1" stopColor="#a9a9a0" />
        </linearGradient>
        <linearGradient id="floor" x2="0" y2="1">
          <stop stopColor="#5c514b" />
          <stop offset="1" stopColor="#2f3035" />
        </linearGradient>
        <radialGradient id="lamp">
          <stop stopColor="#ffda9c" stopOpacity=".6" />
          <stop offset="1" stopColor="#ffda9c" stopOpacity="0" />
        </radialGradient>
        <filter id="texture">
          <feTurbulence baseFrequency=".6" numOctaves="3" seed="7" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".075" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="soft-light" />
        </filter>
      </defs>
      <rect width="1000" height="563" fill="url(#wall)" />
      <path d="M0 395H1000V563H0Z" fill="url(#floor)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M${i * 230 - 200} 563L${i * 160 + 30} 395M0 ${425 + i * 28}H1000`}
          stroke="#aaa18d"
          opacity=".09"
        />
      ))}
      <rect x="46" y="23" width="560" height="368" fill="#292d2d" />
      <rect x="62" y="34" width="528" height="335" fill="url(#sky)" />
      <g opacity=".55" fill="#586875">
        <path d="M60 270V160L115 140V80H210V200H260V115H330V180H380V90H450V165H590V370H60Z" />
        <path
          d="M60 325L180 280H270L310 300H410L470 260H590V370H60Z"
          fill="#374f58"
        />
      </g>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i} opacity=".5">
          <rect
            x={90 + i * 65}
            y={200 + (i % 3) * 24}
            width="15"
            height="25"
            fill="#d9c99b"
          />
          <path
            d={`M${90 + i * 65} 255v100`}
            stroke="#3e5259"
            strokeWidth="5"
          />
        </g>
      ))}
      <path d="M325 34V375M62 192H590" stroke="#2c3438" strokeWidth="12" />
      <path d="M53 380H613" stroke="#9b8d78" strokeWidth="15" />
      <path
        d="M35 20Q70 100 45 390M615 20Q575 120 615 390"
        fill="none"
        stroke="#4a4244"
        strokeWidth="26"
      />
      {cafe ? (
        <>
          <path d="M681 0v112" stroke="#282a29" strokeWidth="4" />
          <path d="M631 145Q680 75 732 145Z" fill="#b99b69" />
          <ellipse cx="681" cy="152" rx="38" ry="6" fill="#f3d4a0" />
          <circle className="cafe-lamp-glow" cx="681" cy="182" r="150" fill="url(#lamp)" />
          <rect
            x="770"
            y="70"
            width="175"
            height="220"
            fill="#292f2e"
            stroke="#887a60"
            strokeWidth="5"
          />
          <text
            x="857"
            y="111"
            textAnchor="middle"
            fill="#c9bc9f"
            fontFamily="Georgia"
            fontSize="23"
            fontStyle="italic"
          >
            Alder &amp; Ash
          </text>
          <path
            d="M800 132H915M810 165H903M805 187H910M815 211H900M805 248H910"
            stroke="#a5a28c"
            opacity=".5"
            strokeWidth="3"
          />
          <path
            d="M15 374H194V397H15M33 395V511M173 395V511"
            stroke="#302f2c"
            strokeWidth="10"
          />
          <ellipse cx="106" cy="373" rx="105" ry="16" fill="#8b7660" />
          <path
            d="M740 370H995V398H740M772 397V530M960 397V530"
            stroke="#2c2b28"
            strokeWidth="10"
          />
          <ellipse cx="872" cy="370" rx="139" ry="24" fill="#7a6654" />
          <g className="cafe-person-light" transform="translate(280,210)">
            <path d="M38 220Q0 160 48 121H116Q170 161 145 240" fill="#423c43" />
            <path d="M54 125L77 160L108 125" fill="#c1a397" />
            <ellipse cx="83" cy="71" rx="45" ry="60" fill="#b99687" />
            <path
              d="M38 85Q13 4 80 3Q150 4 132 102L116 88L108 37Q83 65 43 63Z"
              fill="#393337"
            />
            <path d="M51 86l15-3M94 83l14 3" stroke="#4b3b3b" strokeWidth="3" />
            <path
              d="M73 112q10 5 20-1"
              fill="none"
              stroke="#765553"
              strokeWidth="2"
            />
            {dynamicLight && <g clipPath="url(#cafePersonShade)" pointerEvents="none">
              <rect className="cafe-person-shade" x="-20" y="-80" width="210" height="360" fill="url(#cafeMovingShade)" />
            </g>}
          </g>
          <ellipse cx="472" cy="508" rx="236" ry="62" fill="#312d2d" />
          <ellipse cx="472" cy="488" rx="236" ry="57" fill="#8c7760" />
          <ellipse cx="472" cy="482" rx="226" ry="50" fill="#a08b70" />
          <path d="M445 461h75l-8 30h-60z" fill="#d4d1c0" />
          <ellipse cx="482" cy="460" rx="38" ry="9" fill="#ece3cc" />
          <ellipse cx="482" cy="460" rx="29" ry="5" fill="#63503d" />
          <path
            d="M519 465q22-2 18 12q-3 9-22 4"
            fill="none"
            stroke="#d4d1c0"
            strokeWidth="6"
          />
          <path d="M340 488l45-22l33 28l-45 20z" fill="#d0bea2" />
          <g className="cafe-plant-light" transform="translate(940 315)">
            <path
              d="M-23 0q-50-75-22-88q40 5 45 77Q15-85 40-67q13 35-40 67Q65-40 65-10Q42 15 0 13"
              fill="#465448"
            />
            <path d="M-35 5h68l-12 60h-46z" fill="#896b55" />
            {dynamicLight && <g clipPath="url(#cafePlantShade)" pointerEvents="none">
              <rect className="cafe-plant-shade" x="-85" y="-160" width="170" height="300" fill="url(#cafeMovingShade)" />
            </g>}
          </g>
        </>
      ) : (
        <>
          <rect
            x="715"
            y="225"
            width="215"
            height="125"
            rx="5"
            fill="#161d28"
            stroke="#626778"
            strokeWidth="5"
          />
          <rect x="723" y="233" width="199" height="108" fill="#526b87" />
          <path d="M820 350v33M690 390H975" stroke="#777783" strokeWidth="9" />
          <path
            d="M710 391v150M955 391v150"
            stroke="#333342"
            strokeWidth="10"
          />
          <circle cx="820" cy="280" r="110" fill="url(#lamp)" opacity=".2" />
          <path d="M105 440L330 355L625 423L510 563H105Z" fill="#76727a" />
          <path d="M105 440L350 415L625 423L510 563H105Z" fill="#555766" />
          <path d="M150 430l120-50l92 30l-115 46z" fill="#b1a3a0" />
          <path d="M346 419q-7-89 45-93q60-5 78 72l-15 65" fill="#41404c" />
          <ellipse cx="398" cy="313" rx="31" ry="38" fill="#ad958c" />
          <path
            d="M367 315q-13-58 30-49q43-6 34 49l-12-22l-51 4"
            fill="#302f3a"
          />
          <rect
            x="452"
            y="370"
            width="19"
            height="32"
            rx="3"
            fill="#a2b4c6"
            transform="rotate(-15 452 370)"
          />
          <rect
            x="647"
            y="75"
            width="100"
            height="110"
            fill="#252c36"
            stroke="#7c7070"
            strokeWidth="5"
          />
          <path
            d="M662 167l26-52l25 30l19-43"
            fill="none"
            stroke="#8b7a88"
            strokeWidth="4"
          />
          {kind === "phone" && (
            <g transform="translate(410 85)">
              <rect
                width="180"
                height="320"
                rx="20"
                fill="#282a34"
                stroke="#a99da1"
                strokeWidth="3"
              />
              <rect
                x="9"
                y="30"
                width="162"
                height="255"
                rx="5"
                fill="#606473"
              />
              <circle cx="90" cy="90" r="22" fill="#b49a96" />
              <rect
                x="25"
                y="135"
                width="125"
                height="40"
                rx="10"
                fill="#8f8a98"
              />
              <rect
                x="55"
                y="195"
                width="100"
                height="32"
                rx="10"
                fill="#b8a2a5"
              />
            </g>
          )}
          {kind === "outfit" && (
            <g transform="translate(100 85)">
              <rect
                width="450"
                height="340"
                fill="#423e46"
                stroke="#847376"
                strokeWidth="6"
              />
              <path d="M25 40H425" stroke="#b2a4a0" strokeWidth="5" />
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${40 + i * 130} 40)`}>
                  <path
                    d="M50 0v20l-45 30h90L50 20"
                    fill="none"
                    stroke="#c3ada1"
                    strokeWidth="3"
                  />
                  <path
                    d="M20 45L0 80L18 110L30 92V220H85V92L95 110L110 80L82 45Z"
                    fill={["#9e8990", "#b7aaa0", "#607c8a"][i]}
                  />
                </g>
              ))}
            </g>
          )}
        </>
      )}
      <rect
        width="1000"
        height="563"
        fill="transparent"
        filter="url(#texture)"
      />
    </g>
  );
}
