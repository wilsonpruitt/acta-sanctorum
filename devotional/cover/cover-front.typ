// Acta Sanctorum Devotional — FRONT COVER
// 6x9 trim + 0.125in bleed all sides => 6.25 x 9.25 in
// Build: typst compile cover-front.typ cover-front.pdf
//        (PNG preview) typst compile cover-front.typ cover-front.png --ppi 200

#let bleed = 0.125in
#let cream = rgb("#efe6ce")      // warm aged paper, matched to the scan
#let ink   = rgb("#2b2117")      // dark sepia-brown for type
#let faint = rgb("#7c6a4e")      // muted gold-brown for rules / secondary

#set page(
  width: 6in + 2 * bleed,
  height: 9in + 2 * bleed,
  margin: 0pt,
  fill: cream,
)

#set text(fill: ink)

// Everything sits inside the trim, with a comfortable inner margin.
#let inset = bleed + 0.42in

#place(top + left, dx: 0pt, dy: 0pt)[
  #box(width: 6in + 2 * bleed, height: 9in + 2 * bleed)[
    #pad(inset)[
      // --- double keyline border framing the whole cover ---
      #place(top + left, dx: -0.16in, dy: -0.16in)[
        #rect(
          width: 6in + 2 * bleed - 2 * inset + 0.32in,
          height: 9in + 2 * bleed - 2 * inset + 0.32in,
          stroke: 0.5pt + faint,
        )
      ]
      #place(top + left, dx: -0.12in, dy: -0.12in)[
        #rect(
          width: 6in + 2 * bleed - 2 * inset + 0.24in,
          height: 9in + 2 * bleed - 2 * inset + 0.24in,
          stroke: 1.4pt + faint,
        )
      ]

      // ---- TOP GROUP: title, ornament, subtitle, engraving, tagline ----
      #align(center)[
        #v(0.24in)
        #text(font: "EB Garamond 12", size: 34pt, tracking: 5pt)[ACTA]
        #v(-0.20in)
        #text(font: "EB Garamond 12", size: 34pt, tracking: 5pt)[SANCTORVM]

        #v(0.12in)
        // small ornamental rule
        #box(width: 1.5in, height: 0.5pt, fill: faint)
        #h(0.16in)
        #text(font: "EB Garamond 12", size: 13pt, fill: faint)[\u{2767}]
        #h(0.16in)
        #box(width: 1.5in, height: 0.5pt, fill: faint)

        #v(0.12in)
        #text(font: "EB Garamond 12", style: "italic", size: 17pt)[A Daily Devotional]

        // ---- TAGLINE ----
        #v(0.16in)
        #text(font: "EB Garamond SC 12", size: 10.5pt, tracking: 0.6pt, fill: faint)[
          Three hundred fifteen lives of the saints
        ]
        #linebreak()
        #text(font: "EB Garamond SC 12", size: 10.5pt, tracking: 0.6pt, fill: faint)[
          January 1 — November 10
        ]

        // ---- ENGRAVING ----
        #v(0.28in)
        #box(stroke: 0.6pt + faint, inset: 3pt)[
          #image("engraving.png", width: 2.3in)
        ]

        // ---- AUTHOR / IMPRINT ----
        #v(0.40in)
        #text(font: "EB Garamond 12", size: 15pt, tracking: 2.5pt)[WILSON PRUITT]
        #v(0.07in)
        #text(font: "EB Garamond 12", size: 8.5pt, fill: faint, tracking: 0.5pt)[actasanctorum.org]
      ]
    ]
  ]
]
